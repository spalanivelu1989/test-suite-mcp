You are orchestrating the test-app stage for app: {{app_name}}

## Pre-flight

1. Confirm spec files exist at `apps/{{app_name}}/tests/generated/` — if the directory is absent or empty, tell the user to run the **design** prompt first. Do not use `list_runs` for this check (that lists prior run results, not spec files).
2. Confirm `apps/{{app_name}}/secrets.local.env` exists.

## Step 1 — Run the suite

Call `run_playwright` with app=`{{app_name}}`.

Optionally scope to a single category (e.g. `smoke` for a quick sanity check) by passing the `category` argument.

The tool will:

- Load `secrets.local.env` automatically.
- Run `npx playwright test` with JSON, HTML, and list reporters.
- Move output into a timestamped `apps/{{app_name}}/runs/<timestamp>/` directory.
- Return pass/fail counts and per-failure metadata.

## Step 2 — Diagnose failures

If `run_playwright` returns failures, spawn one `executor` Mode B sub-agent (spec appended below) **per failure** in parallel. Pass each sub-agent the full failure record from `run_playwright` plus the config path:

- `mode`: `B`
- `test_id`: from the failure record
- `title`: from the failure record
- `file`: from the failure record
- `error_message`: from the failure record
- `trace_path`: from the failure record
- `video_path`: from the failure record
- `config_yaml_path`: `apps/{{app_name}}/config.yaml`

Each sub-agent replays the trace with Chrome DevTools and returns a root-cause classification:

- `auth` — session expired, redirect to login mid-test
- `selector` — element not found, locator stale
- `timing` — race condition, `waitForTimeout` needed
- `data` — unexpected values, missing fixtures
- `app-bug` — the app itself behaved incorrectly
- `infra` — 5xx, timeout, network error

And a suggested action: `fix-spec` | `fix-app` | `file-bug` | `rerun` | `quarantine`.

## Step 3 — Heal fix-spec failures

Collect all failures where `suggested_action` is `fix-spec`.

- **If none**: proceed directly to Step 4.
- **If any**: spawn the `playwright-test-healer` sub-agent (spec appended below) with:
  - `app`: `{{app_name}}`
  - `failures`: the `fix-spec` subset of the executor diagnoses
  - `run_dir`: the timestamped run directory from Step 1

  The healer navigates the live app to find correct locators, edits spec files surgically, and re-runs each repaired category to confirm. It returns a status (`fixed` | `fixme`) per test. The healer's final per-category run is sufficient — do not call `run_playwright` again after healing completes.

## Step 4 — Generate the report

Spawn the `reporter` sub-agent (spec appended below) once all diagnoses and healing are complete. Pass:

- `run_dir`: the timestamped run directory from Step 1
- `app_name`: `{{app_name}}`
- `results_json_path`: the `json_results_path` field from the Step 1 `run_playwright` output
- `diagnoses`: all executor Mode B results
- `healer_results`: the healer's per-test status summary (empty array if Step 3 was skipped)

Then call `read_report` with app=`{{app_name}}` to display the final report.

The report leads with **Migration Risk Findings** — failures tagged `@migration-risk` or whose root cause is `auth`, `data`, or `infra`.

## Guardrails

- If `config.yaml` has `guardrails.is_production: true`, do NOT run any test tagged `@destructive`.
- Logout tests invalidate shared sessions. Gate them behind `RUN_LOGOUT_TESTS=1` and run with `--workers=1`.
