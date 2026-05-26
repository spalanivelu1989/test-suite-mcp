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
export function scaffoldApp(name) {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
        throw new Error(`App name must be kebab-case (e.g. "roi-calc"), got: "${name}"`);
    }
    const dest = appDir(name);
    if (existsSync(join(dest, "config.yaml"))) {
        throw new Error(`App "${name}" already exists at ${dest}`);
    }
    mkdirSync(dest, { recursive: true });
    const files = {
        "config.yaml": CONFIG_YAML(name),
        "description.md": DESCRIPTION_MD(name),
        "secrets.local.env.example": SECRETS_EXAMPLE,
    };
    for (const [filename, content] of Object.entries(files)) {
        writeFileSync(join(dest, filename), content);
    }
    return {
        app_dir: dest,
        created: Object.keys(files).map((f) => join(dest, f)),
    };
}
