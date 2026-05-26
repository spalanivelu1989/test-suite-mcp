import { test as base, expect, type Page } from "@playwright/test";
import { existsSync, statSync, mkdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { load as parseYaml } from "js-yaml";
import { config as loadDotenv } from "dotenv";
import { loginAsRole } from "./auth";

type Fixtures = {
  role: string;
  authedPage: Page;
};

// roi-calc JWT TTL is 15 minutes. Cap cache age at 12 min.
const XSUAA_AUTH_AGE_MS = 12 * 60 * 1000;
const EMAIL_RE = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/;

interface AppAuthConfig {
  flow?: string;
  interactive?: boolean;
}

function authPath(app: string, role: string): string {
  return join("apps", app, ".auth", `${role}.json`);
}

function configPath(app: string): string {
  return join("apps", app, "config.yaml");
}

function readAuthConfig(app: string): AppAuthConfig {
  try {
    const cfg = parseYaml(readFileSync(configPath(app), "utf8")) as {
      auth?: AppAuthConfig;
    };
    return cfg.auth ?? {};
  } catch {
    return {};
  }
}

function isFresh(p: string, authCfg: AppAuthConfig): boolean {
  if (!existsSync(p)) return false;
  const maxAge =
    authCfg.flow === "form" || authCfg.interactive
      ? 12 * 60 * 1000 // XSUAA-style short TTL (unused for MSAL — handled via persistent profile)
      : XSUAA_AUTH_AGE_MS;
  return Date.now() - statSync(p).mtimeMs < maxAge;
}

function inferAppFromTestPath(testFile: string): string {
  const m = testFile.replace(/\\/g, "/").match(/\/apps\/([^/]+)\//);
  if (!m) throw new Error(`Cannot infer app name from test path: ${testFile}`);
  return m[1];
}

function readUserEmail(storagePath: string): string | null {
  try {
    const s = JSON.parse(readFileSync(storagePath, "utf8")) as {
      origins?: Array<{ localStorage?: Array<{ value: string }> }>;
    };
    for (const o of s.origins ?? []) {
      for (const ls of o.localStorage ?? []) {
        const m = (ls.value || "").match(EMAIL_RE);
        if (m) return m[0];
      }
    }
  } catch {
    // ignore
  }
  return null;
}

function readBaseUrl(app: string): string {
  const cfg = parseYaml(readFileSync(configPath(app), "utf8")) as {
    base_url?: string;
  };
  return (cfg.base_url ?? "").replace(/\/$/, "");
}

export const test = base.extend<Fixtures>({
  role: ["user", { option: true }],

  authedPage: async ({ browser, role }, use, testInfo) => {
    const app = inferAppFromTestPath(testInfo.file);
    const authCfg = readAuthConfig(app);
    const baseUrl = readBaseUrl(app);

    // ── MSAL / interactive path ────────────────────────────────────────────
    // Uses a storageState JSON exported by setup-session.ts. Playwright's
    // storageState API reads cookies through Chrome's decryption layer and
    // serialises them as plaintext, so the file is portable across headed
    // and headless contexts without any OS Keychain access.
    //
    // On load, MSAL reads the msal.cache.encryption cookie to recover its
    // WebCrypto key and decrypts the cached tokens in localStorage. If the
    // access token has expired, MSAL silently refreshes via the Microsoft
    // ESTSAUTHPERSISTENT session cookie (also captured in the export).
    if (authCfg.interactive) {
      const statePath = authPath(app, role);

      if (!existsSync(statePath)) {
        throw new Error(
          `No session file found at ${statePath}.\n` +
            `Run the one-time setup, then re-run tests:\n` +
            `  npx tsx scripts/setup-session.ts ${app} ${role}\n` +
            `  npx playwright test`,
        );
      }

      const context = await browser.newContext({ storageState: statePath });
      const page = await context.newPage();

      await page.goto(baseUrl + "/");

      const appHostname = new URL(baseUrl).hostname;
      try {
        // Allow up to 45 s — MSAL may need to silently refresh an expired
        // access token via the Microsoft session cookie before redirecting home.
        await page.waitForURL(
          (url) =>
            new URL(url).hostname === appHostname &&
            !new URL(url).pathname.startsWith("/login"),
          { timeout: 45_000 },
        );
      } catch {
        await context.close();
        throw new Error(
          `Session for "${app}" is stale (${statePath}).\n` +
            `Refresh it with:\n` +
            `  npx tsx scripts/setup-session.ts ${app} ${role}\n` +
            `  npx playwright test`,
        );
      }

      await use(page);
      await context.close();
      return;
    }

    // ── storageState path (XSUAA / non-interactive apps) ──────────────────
    const cachePath = authPath(app, role);

    if (!isFresh(cachePath, authCfg)) {
      const secretsPath = join("apps", app, "secrets.local.env");
      if (existsSync(secretsPath))
        loadDotenv({ path: secretsPath, override: false });

      const bootstrap = await browser.newContext();
      const bp = await bootstrap.newPage();
      await loginAsRole(bp, role, app);
      mkdirSync(dirname(cachePath), { recursive: true });
      await bootstrap.storageState({ path: cachePath });
      await bootstrap.close();
    }

    const context = await browser.newContext({ storageState: cachePath });
    const page = await context.newPage();

    // Pre-navigate and wait for the authed shell. SPA hydrates auth from
    // localStorage on first paint; if a test asserts before that completes
    // it sees the public landing and times out. We block here once so every
    // test gets a ready page.
    const userEmail = readUserEmail(cachePath);
    await page.goto(baseUrl + "/");
    if (userEmail) {
      await expect(page.getByText(userEmail).first()).toBeVisible({
        timeout: 15_000,
      });
    } else {
      await expect(
        page.getByRole("button", { name: /log\s*out/i }).first(),
      ).toBeVisible({
        timeout: 15_000,
      });
    }

    await use(page);
    await context.close();
  },
});

export { expect };
