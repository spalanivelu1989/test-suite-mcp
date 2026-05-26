You are orchestrating the discover stage for app: {{app_name}}

## Pre-flight

1. Call `read_app_model` with app=`{{app_name}}` — if it succeeds, note the existing crawl date and ask the user whether to re-crawl or proceed with the existing model.
2. Confirm `{{app_name}}/config.yaml` and `{{app_name}}/secrets.local.env` exist. If either is missing, stop and tell the user what to fix.

## Step 1 — Crawl the app

Run the two sub-agents **sequentially** — the planner depends on auth files written by the understanding agent.

### 1a. `understanding` sub-agent (spec appended below)

Inputs:

- `app`: `{{app_name}}`
- `run_dir`: a new timestamped directory `{{app_name}}/runs/<timestamp>/`

This sub-agent will:

1. Read `{{app_name}}/config.yaml` and `secrets.local.env`.
2. Open the base URL unauthenticated and detect the auth flow (`xsuaa` | `ias` | `form` | `none`).
3. Log in per role and save `storageState` to `{{app_name}}/.auth/<role>.json`.
4. BFS-crawl up to 30 pages per role, capturing URL, ARIA outline, forms, actions, API calls, console errors, and screenshots.
5. Write `{{app_name}}/runs/<timestamp>/app-model.json`.

Wait for the `understanding` sub-agent to complete before proceeding. The auth files it writes (`{{app_name}}/.auth/<role>.json`) must exist before the planner starts — the planner has no login logic of its own.

### 1b. `playwright-test-planner` sub-agent (spec appended below)

Inputs:

- `app`: `{{app_name}}`
- `base_url`: from `{{app_name}}/config.yaml`
- `roles`: role list from `{{app_name}}/config.yaml`
- `app_model`: the `app-model.json` content from Step 1a

This sub-agent explores the app live (using the auth files from Step 1a) and writes a structured test plan to `{{app_name}}/tests/plan.md`. The plan is consumed by `playwright-test-generator` during the **design** stage.

## Step 2 — After the crawl completes

Call `read_app_model` with app=`{{app_name}}` to read the results. Then summarise:

- Pages discovered and roles successfully authenticated.
- Auth flow detected.
- Notable issues (failed logins, console errors, blocked pages).
- Whether `lib/auth.ts` and `lib/fixtures.ts` were bootstrapped.
- Whether `{{app_name}}/tests/plan.md` was written (scenario count per category).

## Step 2b — Auto-fill description.md

Read `{{app_name}}/description.md`. If any section contains `_To be discovered._` (written by the fast-path in the add-app stage), fill it in using what was learned from the crawl:

- **What the app does** — 2–3 sentence summary derived from page titles, headings, and API endpoints observed.
- **Roles** — table of roles from `config.yaml`, with landing URL and accessible pages from `app-model.json`.
- **Top user journeys** — infer from `plan.md`'s `flows` category scenarios; list each journey name with a one-line description.
- **Business rules** — list any form validation rules, calculation logic, or API constraints observed during crawl. Write "None detected." if none found.
- **Known post-migration bugs** — leave as "None detected." unless console errors or auth failures were recorded.
- **Out of scope** — leave as "None specified." unless the crawl hit external origins or embedded shells.

Update `auth.flow` in `{{app_name}}/config.yaml` with the detected value.

If `description.md` was fully filled in by the user (no stub sections), skip this step.

## Step 3 — Bootstrap lib/ (first run only)

If `lib/auth.ts` or `lib/fixtures.ts` are missing, the design stage cannot run. Bootstrap them as follows:

### `lib/auth.ts`

Write a `loginAsRole(page, role, app)` function that:

1. Reads `<app>/config.yaml` to get `auth.flow`, `auth.xsuaa_tenant_host` (if present), and `base_url`.
2. If `flow === "none"`: returns immediately.
3. If `flow === "form"` or `auth.interactive === true`: throws a clear error telling the user to run `/discover <app>` to refresh the session.
4. If `flow === "xsuaa"`: performs the XSUAA button login:
   - Navigate to `base_url`.
   - Click the login button (use the label observed during the crawl, from `app-model.json`).
   - Wait for redirect to the XSUAA tenant host (from `auth.xsuaa_tenant_host` in config, or match `*.authentication.*.hana.ondemand.com`).
   - Click the identity provider link (label from the crawl).
   - Fill email and password fields; click Continue for each.
   - Wait for redirect back to `base_url`.
5. Read `USER` and `PASS` env vars using the role's `secret_user` / `secret_pass` names from `config.yaml`.

Use the login button label, IdP link label, and field names observed in `app-model.json` for this specific app — do not hardcode labels from other apps.

### `lib/fixtures.ts`

Write a Playwright fixture file exporting `test` and `expect` that provides an `authedPage` fixture. The fixture must:

1. Infer the app name from the test file path using the regex `/\/([^/]+)\/tests\//`.
2. Read `auth.flow` from `<app>/config.yaml`.
3. If the cached storage state at `<app>/.auth/<role>.json` is fresh (< 12 min for XSUAA, persistent for MSAL), reuse it.
4. Otherwise, open a fresh browser context, call `loginAsRole`, save storage state, then close.
5. Open the authenticated context, navigate to `base_url`, wait for a visible post-login indicator (email text or logout button), then yield the page via `use(page)`.

Import `loginAsRole` from `./auth`.

## Constraints

- Do not design or run tests in this stage.
- If `lib/auth.ts` / `lib/fixtures.ts` are missing after a successful crawl, the design stage will fail — flag this.
