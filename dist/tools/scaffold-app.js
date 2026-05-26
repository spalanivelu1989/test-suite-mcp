import { mkdirSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { appDir } from "../lib/paths.js";
const CONFIG_YAML = (name) => `\
name: ${name}
display_name: ${name}

base_url: https://your-app.cfapps.eu10.hana.ondemand.com

auth:
  flow: unknown
  login_path: /
  logout_path: /logout

roles:
  - id: admin
    label: Administrator
    secret_user: ADMIN_USER
    secret_pass: ADMIN_PASS
  - id: viewer
    label: Viewer
    secret_user: VIEWER_USER
    secret_pass: VIEWER_PASS

tags: []
baseline_url: null
test_depth: standard

guardrails:
  is_production: false
  destructive_operations_allowed: false
`;
const DESCRIPTION_MD = (name) => `\
# ${name} — Description

## What this app does

<1-2 sentences describing the app's purpose>

## User roles

| Role id | Can do | Cannot do |
|---|---|---|
| admin | <actions> | — |
| viewer | <actions> | <restrictions> |

## Top user journeys

### Journey 1: <name>
1. <step>
**Success looks like:** <observable outcome>

## Calculations / business rules

- <input → output relationship or formula>

## Known post-migration bugs / things to watch

- <anything seen go wrong after BTP migration>

## Out of scope for testing

- <e.g. Fiori shell launchpad header>
`;
const SECRETS_EXAMPLE = `\
# Copy this file to secrets.local.env (gitignored) and fill in real credentials.
# config.yaml references these env var NAMES, never the values.

ADMIN_USER=
ADMIN_PASS=

VIEWER_USER=
VIEWER_PASS=
`;
const LIB_AUTH_TS = `\
import { Page, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { load as parseYaml } from "js-yaml";

const SAP_IDP_HOST = "accounts.sap.com";

interface XsuaaConfig {
  login_button?: string;
  idp_link?: string;
  xsuaa_tenant_host?: string;
}

function readXsuaaConfig(): XsuaaConfig & { baseUrl: string } {
  const cfg = parseYaml(
    readFileSync(join(__dirname, "..", "config.yaml"), "utf8"),
  ) as {
    base_url?: string;
    auth?: XsuaaConfig;
  };
  return {
    baseUrl: (cfg.base_url ?? "").replace(/\\/$/, ""),
    login_button: cfg.auth?.login_button ?? "Login with BTP",
    idp_link: cfg.auth?.idp_link ?? "Default Identity Provider",
    xsuaa_tenant_host: cfg.auth?.xsuaa_tenant_host,
  };
}

function hostRegex(host: string): RegExp {
  return new RegExp(\`^https://\${host.replace(/\\./g, "\\\\.")}/\`);
}

async function loginXsuaa(page: Page, role: string): Promise<void> {
  const { baseUrl, login_button, idp_link, xsuaa_tenant_host } = readXsuaaConfig();

  const appCfg = parseYaml(
    readFileSync(join(__dirname, "..", "config.yaml"), "utf8"),
  ) as {
    roles?: Array<{ id: string; secret_user?: string; secret_pass?: string }>;
  };
  const roleEntry = appCfg.roles?.find((r) => r.id === role);
  const userEnvKey = roleEntry?.secret_user ?? \`\${role.toUpperCase()}_USER\`;
  const passEnvKey = roleEntry?.secret_pass ?? \`\${role.toUpperCase()}_PASS\`;
  const user = process.env[userEnvKey];
  const pass = process.env[passEnvKey];
  if (!user || !pass) {
    throw new Error(
      \`Missing \${userEnvKey} / \${passEnvKey}. Set them in secrets.local.env.\`,
    );
  }

  await page.goto(baseUrl + "/");
  await page.getByRole("button", { name: login_button }).click();

  const tenantPattern = xsuaa_tenant_host
    ? hostRegex(xsuaa_tenant_host)
    : /\\.authentication\\.[^/]+\\.hana\\.ondemand\\.com\\//;
  await page.waitForURL(tenantPattern);
  await page.getByRole("link", { name: idp_link }).click();

  await page.waitForURL(hostRegex(SAP_IDP_HOST));
  await page.getByRole("textbox", { name: "Email, User ID or Login Name" }).fill(user);
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill(pass);
  await page.getByRole("button", { name: "Continue" }).click();

  await page.waitForURL(hostRegex(new URL(baseUrl).hostname));
  await expect(page.getByText(user)).toBeVisible({ timeout: 30_000 });
}

export async function loginAsRole(page: Page, role: string): Promise<void> {
  let flow = "xsuaa-button";
  let interactive = false;
  try {
    const cfg = parseYaml(
      readFileSync(join(__dirname, "..", "config.yaml"), "utf8"),
    ) as {
      auth?: { flow?: string; interactive?: boolean };
    };
    flow = cfg.auth?.flow ?? "xsuaa-button";
    interactive = cfg.auth?.interactive ?? false;
  } catch {
    // fall through to xsuaa default
  }

  if (flow === "none") return;

  if (interactive || flow === "form") {
    throw new Error(
      "Session has expired and cannot be renewed automatically.\\n" +
        "This app uses interactive Microsoft SSO (MSAL). " +
        "Run '/discover' to sign in and refresh the session, then re-run tests.",
    );
  }

  await loginXsuaa(page, role);
}
`;
const LIB_FIXTURES_TS = `\
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

const XSUAA_AUTH_AGE_MS = 12 * 60 * 1000;
const EMAIL_RE = /[\\w.+-]+@[\\w-]+(?:\\.[\\w-]+)+/;

interface AppAuthConfig {
  flow?: string;
  interactive?: boolean;
}

function authPath(role: string): string {
  return join(__dirname, "..", ".auth", \`\${role}.json\`);
}

function configPath(): string {
  return join(__dirname, "..", "config.yaml");
}

function readAuthConfig(): AppAuthConfig {
  try {
    const cfg = parseYaml(readFileSync(configPath(), "utf8")) as {
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
    authCfg.flow === "form" || authCfg.interactive ? 12 * 60 * 1000 : XSUAA_AUTH_AGE_MS;
  return Date.now() - statSync(p).mtimeMs < maxAge;
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

function readBaseUrl(): string {
  const cfg = parseYaml(readFileSync(configPath(), "utf8")) as {
    base_url?: string;
  };
  return (cfg.base_url ?? "").replace(/\\/$/, "");
}

export const test = base.extend<Fixtures>({
  role: ["user", { option: true }],

  authedPage: async ({ browser, role }, use) => {
    const authCfg = readAuthConfig();
    const baseUrl = readBaseUrl();

    if (authCfg.interactive) {
      const statePath = authPath(role);

      if (!existsSync(statePath)) {
        throw new Error(
          \`No session file found at \${statePath}.\\n\` +
            \`Run the one-time setup, then re-run tests:\\n\` +
            \`  npx tsx scripts/setup-session.ts \${role}\\n\` +
            \`  npx playwright test\`,
        );
      }

      const context = await browser.newContext({ storageState: statePath });
      const page = await context.newPage();
      await page.goto(baseUrl + "/");

      const appHostname = new URL(baseUrl).hostname;
      try {
        await page.waitForURL(
          (url) =>
            new URL(url).hostname === appHostname &&
            !new URL(url).pathname.startsWith("/login"),
          { timeout: 45_000 },
        );
      } catch {
        await context.close();
        throw new Error(
          \`Session is stale (\${statePath}).\\n\` +
            \`Refresh it with:\\n\` +
            \`  npx tsx scripts/setup-session.ts \${role}\\n\` +
            \`  npx playwright test\`,
        );
      }

      await use(page);
      await context.close();
      return;
    }

    const cachePath = authPath(role);

    if (!isFresh(cachePath, authCfg)) {
      const secretsPath = join(__dirname, "..", "secrets.local.env");
      if (existsSync(secretsPath)) loadDotenv({ path: secretsPath, override: false });

      const bootstrap = await browser.newContext();
      const bp = await bootstrap.newPage();
      await loginAsRole(bp, role);
      mkdirSync(dirname(cachePath), { recursive: true });
      await bootstrap.storageState({ path: cachePath });
      await bootstrap.close();
    }

    const context = await browser.newContext({ storageState: cachePath });
    const page = await context.newPage();

    const userEmail = readUserEmail(cachePath);
    await page.goto(baseUrl + "/");
    if (userEmail) {
      await expect(page.getByText(userEmail).first()).toBeVisible({ timeout: 15_000 });
    } else {
      await expect(
        page.getByRole("button", { name: /log\\s*out/i }).first(),
      ).toBeVisible({ timeout: 15_000 });
    }

    await use(page);
    await context.close();
  },
});

export { expect };
`;
export function scaffoldApp(name) {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
        throw new Error(`App name must be kebab-case (e.g. "roi-calc"), got: "${name}"`);
    }
    const dest = appDir(name);
    if (existsSync(join(dest, "config.yaml"))) {
        throw new Error(`App "${name}" already exists at ${dest}`);
    }
    mkdirSync(dest, { recursive: true });
    mkdirSync(join(dest, "lib"), { recursive: true });
    const files = {
        "config.yaml": CONFIG_YAML(name),
        "description.md": DESCRIPTION_MD(name),
        "secrets.local.env.example": SECRETS_EXAMPLE,
        "lib/auth.ts": LIB_AUTH_TS,
        "lib/fixtures.ts": LIB_FIXTURES_TS,
    };
    for (const [filename, content] of Object.entries(files)) {
        writeFileSync(join(dest, filename), content);
    }
    return {
        app_dir: dest,
        created: Object.keys(files).map((f) => join(dest, f)),
    };
}
