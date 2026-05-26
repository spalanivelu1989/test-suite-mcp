import { Page, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { load as parseYaml } from "js-yaml";

// Generic XSUAA-button login flow (SAP BTP apps via approuter).
// Flow shape:
//   1. App landing (public) → click login button
//   2. XSUAA tenant → click identity provider link
//   3. IdP (accounts.sap.com or similar) → 2-step login (email, then password)
//   4. Callback chain back to app origin
//
// Button/link labels are read from config.yaml so this works across apps.

const SAP_IDP_HOST = "accounts.sap.com";

interface XsuaaConfig {
  login_button?: string;
  idp_link?: string;
  xsuaa_tenant_host?: string;
}

function readXsuaaConfig(app: string): XsuaaConfig & { baseUrl: string } {
  const cfg = parseYaml(
    readFileSync(join("apps", app, "config.yaml"), "utf8"),
  ) as {
    base_url?: string;
    auth?: XsuaaConfig;
  };
  return {
    baseUrl: (cfg.base_url ?? "").replace(/\/$/, ""),
    login_button: cfg.auth?.login_button ?? "Login with BTP",
    idp_link: cfg.auth?.idp_link ?? "Default Identity Provider",
    xsuaa_tenant_host: cfg.auth?.xsuaa_tenant_host,
  };
}

function hostRegex(host: string): RegExp {
  return new RegExp(`^https://${host.replace(/\./g, "\\.")}/`);
}

async function loginXsuaa(
  page: Page,
  role: string,
  app: string,
): Promise<void> {
  const { baseUrl, login_button, idp_link, xsuaa_tenant_host } =
    readXsuaaConfig(app);

  const appCfg = parseYaml(
    readFileSync(join("apps", app, "config.yaml"), "utf8"),
  ) as {
    roles?: Array<{ id: string; secret_user?: string; secret_pass?: string }>;
  };
  const roleEntry = appCfg.roles?.find((r) => r.id === role);
  const userEnvKey = roleEntry?.secret_user ?? `${role.toUpperCase()}_USER`;
  const passEnvKey = roleEntry?.secret_pass ?? `${role.toUpperCase()}_PASS`;
  const user = process.env[userEnvKey];
  const pass = process.env[passEnvKey];
  if (!user || !pass) {
    throw new Error(
      `Missing ${userEnvKey} / ${passEnvKey}. Set them in apps/${app}/secrets.local.env.`,
    );
  }

  await page.goto(baseUrl + "/");
  await page.getByRole("button", { name: login_button }).click();

  // Wait for XSUAA tenant — match configured host or the generic BTP pattern
  const tenantPattern = xsuaa_tenant_host
    ? hostRegex(xsuaa_tenant_host)
    : /\.authentication\.[^/]+\.hana\.ondemand\.com\//;
  await page.waitForURL(tenantPattern);
  await page.getByRole("link", { name: idp_link }).click();

  await page.waitForURL(hostRegex(SAP_IDP_HOST));
  await page
    .getByRole("textbox", { name: "Email, User ID or Login Name" })
    .fill(user);
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill(pass);
  await page.getByRole("button", { name: "Continue" }).click();

  await page.waitForURL(hostRegex(new URL(baseUrl).hostname));
  await expect(page.getByText(user)).toBeVisible({ timeout: 30_000 });
}

/**
 * Log in as `role` for the given `app`. Dispatches on the app's auth.flow.
 * For interactive/MSAL apps (gtm-studio etc.), re-auth cannot be automated —
 * throws a clear error directing the user to run /discover again.
 */
export async function loginAsRole(
  page: Page,
  role: string,
  app?: string,
): Promise<void> {
  if (app) {
    let flow = "xsuaa-button";
    let interactive = false;
    try {
      const cfg = parseYaml(
        readFileSync(join("apps", app, "config.yaml"), "utf8"),
      ) as {
        auth?: { flow?: string; interactive?: boolean };
      };
      flow = cfg.auth?.flow ?? "xsuaa-button";
      interactive = cfg.auth?.interactive ?? false;
    } catch {
      // If config unreadable, fall through to xsuaa default
    }

    if (flow === "none") return;

    if (interactive || flow === "form") {
      throw new Error(
        `Session for "${app}" has expired and cannot be renewed automatically.\n` +
          `This app uses interactive Microsoft SSO (MSAL). ` +
          `Run \`/discover ${app}\` to sign in and refresh the session, then re-run \`/test-app ${app}\`.`,
      );
    }

    await loginXsuaa(page, role, app);
    return;
  }

  throw new Error(
    `loginAsRole called without an app name. Pass the app parameter.`,
  );
}
