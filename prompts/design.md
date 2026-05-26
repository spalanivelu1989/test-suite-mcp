You are orchestrating the design stage for app: {{app_name}}

## Pre-flight

1. Call `read_app_model` with app=`{{app_name}}` to confirm a crawl exists.
   - If it fails, stop and tell the user to run the **discover** prompt first.
2. Confirm `lib/auth.ts` and `lib/fixtures.ts` exist in the project root.
   - If either is missing, stop — generated specs depend on the fixture for auth.

## Step 1 — Generate specs (model-based path)

Spawn 5 `test-designer` sub-agents in parallel (spec appended below) — one per category:

| Category         | What it generates                                                            |
| ---------------- | ---------------------------------------------------------------------------- |
| `smoke`          | Landing page loads, no console errors, nav links visible (one spec per role) |
| `functional`     | Happy-path and validation specs for every detected form and list             |
| `flows`          | One spec per user journey from `description.md`                              |
| `authz`          | Page-access assertions for every role/page pair (capped at 20)               |
| `migration-risk` | Regression checks for Lovable → BTP common failure modes                     |

Pass to each sub-agent:

- `app`: `{{app_name}}`
- `category`: the category name
- `app_model`: the JSON object returned by `read_app_model` (pass inline — do not re-read from disk)
- `description_path`: `apps/{{app_name}}/description.md`
- `out_dir`: `apps/{{app_name}}/tests/generated/model/<category>/` (substitute the category name)

## Step 2 — Generate specs (live-execution path, if plan exists)

Check whether `apps/{{app_name}}/tests/plan.md` exists.

- **If it does not exist**: skip this step. The model-based specs from Step 1 are sufficient. Suggest running `/discover {{app_name}}` again if live-execution coverage is desired.
- **If it exists**: spawn **one** `playwright-test-generator` sub-agent (spec appended below) with `scenario: "all"` to process every scenario in the plan. The generator executes each scenario live in a browser to confirm real locators, then writes a `.spec.ts` per scenario to `apps/{{app_name}}/tests/generated/live/<category>/`.

  Pass to the sub-agent:
  - `app`: `{{app_name}}`
  - `plan_path`: `apps/{{app_name}}/tests/plan.md`
  - `scenario`: `"all"`
  - `base_url`: from `apps/{{app_name}}/config.yaml`
  - `seed_file`: `apps/seed.spec.ts`
  - `fixtures_import`: `../../../../../../lib/fixtures`
  - `auth_fixture`: `authedPage`

  Live-execution specs complement the model-based ones — both sets run together in `test-app`.

## Output

- Model-based: `apps/{{app_name}}/tests/generated/model/<category>/*.spec.ts`
- Live-execution: `apps/{{app_name}}/tests/generated/live/<category>/*.spec.ts`

## Step 3 — After design completes

Tell the user:

- How many spec files were written (model-based vs live-execution).
- Whether any live scenarios were marked `test.fixme()` (needs attention before running).
- They can run the **test-app** prompt to execute the full suite.

## Constraints

- `apps/{{app_name}}/tests/curated/` is never touched by this stage.
- All specs must route auth through `lib/fixtures.ts` — no hardcoded `storageState` paths.
