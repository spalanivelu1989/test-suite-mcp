You are orchestrating the discover stage for app: {{app_name}}

## Pre-flight

1. Call `read_app_model` — if it succeeds, note the existing crawl date and ask the user whether to re-crawl or proceed with the existing model.
2. Confirm `apps/{{app_name}}/config.yaml` and `apps/{{app_name}}/secrets.local.env` exist. If either is missing, stop and tell the user what to fix.

## Step 1 — Crawl the app

Spawn the `understanding` sub-agent (spec appended below) with these inputs:

- `app`: `{{app_name}}`
- `run_dir`: a new timestamped directory `runs/{{app_name}}-<timestamp>/`

The sub-agent will:

1. Read `apps/{{app_name}}/config.yaml` and `secrets.local.env`.
2. Open the base URL unauthenticated and detect the auth flow (`xsuaa` | `ias` | `form` | `none`).
3. Log in per role and save `storageState` to `apps/{{app_name}}/.auth/<role>.json`.
4. BFS-crawl up to 30 pages per role, capturing URL, ARIA outline, forms, actions, API calls, console errors, and screenshots.
5. Write `runs/{{app_name}}-<timestamp>/app-model.json`.

## Step 2 — After the crawl completes

Call `read_app_model` with app=`{{app_name}}` to read the results. Then summarise:

- Pages discovered and roles successfully authenticated.
- Auth flow detected.
- Notable issues (failed logins, console errors, blocked pages).
- Whether `lib/auth.ts` and `lib/fixtures.ts` were bootstrapped.

## Step 3 — Bootstrap lib/ (first run only)

If `lib/auth.ts` or `lib/fixtures.ts` are missing, offer to bootstrap them based on the observed auth flow. These are required before the **design** stage can run.

## Constraints

- Do not design or run tests in this stage.
- If `lib/auth.ts` / `lib/fixtures.ts` are missing after a successful crawl, the design stage will fail — flag this.
