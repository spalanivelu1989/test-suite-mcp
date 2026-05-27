You are orchestrating the test-app stage for app: {{app_name}}

## Pre-flight

**These checks are mandatory. If either fails, output ONLY the message shown and do nothing else — no investigation, no browsing, no further steps.**

1. **Spec files check** — Run: `ls {{app_name}}/tests/generated/ 2>/dev/null`
   - If the directory is absent or empty: output exactly →
     `No spec files found for {{app_name}}. Run /design {{app_name}} first.`
     Then STOP.
2. **Secrets check** — Verify `{{app_name}}/secrets.local.env` exists.
   - If missing: output exactly →
     `Missing {{app_name}}/secrets.local.env. Copy {{app_name}}/secrets.local.env.example to secrets.local.env and fill in credentials.`
     Then STOP.

## Step 1 — Run the suite

Call `run_playwright` with app=`{{app_name}}`.

Optionally scope to a single category (e.g. `smoke` for a quick sanity check) by passing the `category` argument.

The tool will:

- Load `secrets.local.env` automatically.
- Run `npx playwright test` with JSON, HTML, and list reporters.
- Move output into a timestamped `{{app_name}}/runs/<timestamp>/` directory.
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
- `config_yaml_path`: `{{app_name}}/config.yaml`

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

---

## Next step

This is the final stage of the pipeline. After displaying the report, end your response with exactly this block (substitute `<run_dir>` with the actual timestamped run directory path returned in Step 1, e.g. `{{app_name}}/runs/2026-05-14T09-30-12`):

> ✅ **`test-app` complete for `{{app_name}}`.** The report above is the final output of the pipeline.
>
> **Reports saved to `<run_dir>/`:**
>
> | Report                 | Path                                     |
> | ---------------------- | ---------------------------------------- |
> | Custom HTML report     | `<run_dir>/report.html`                  |
> | Playwright HTML report | `<run_dir>/playwright-report/index.html` |
>
> **Open the Playwright report in your browser:**
>
> ```
> npx playwright show-report <run_dir>/playwright-report
> ```
>
> **Follow-ups:**
>
> - Re-run after fixes: `/test-app {{app_name}}`
> - Regenerate specs: `/design {{app_name}}`
> - Re-crawl the app: `/discover {{app_name}}`
