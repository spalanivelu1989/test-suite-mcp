You are orchestrating the design stage for app: {{app_name}}

## Pre-flight

1. Call `read_app_model` with app=`{{app_name}}` to confirm a crawl exists.
   - If it fails, stop and tell the user to run the **discover** prompt first.
2. Confirm `lib/auth.ts` and `lib/fixtures.ts` exist in the project root.
   - If either is missing, stop — generated specs depend on the fixture for auth.

## Category ownership (no category is ever generated twice)

Each category is produced by exactly **one** path:

| Category         | Owner | Path                                            |
| ---------------- | ----- | ----------------------------------------------- |
| `smoke`          | model | `test-designer` → `generated/model/`            |
| `authz`          | model | `test-designer` → `generated/model/`            |
| `migration-risk` | model | `test-designer` → `generated/model/`            |
| `functional`     | live  | `playwright-test-generator` → `generated/live/` |
| `flows`          | live  | `playwright-test-generator` → `generated/live/` |

The live path verifies real locators in the browser, so it owns the interaction-heavy categories (`functional`, `flows`). The model path is structural (no browser) and owns the breadth categories (`smoke`, `authz`, `migration-risk`). The two never overlap, so `test-app` runs each scenario only once.

**Before anything else, check whether `{{app_name}}/tests/plan.md` exists** — this decides who owns `functional` and `flows`.

## Step 1 — Model-based specs (`test-designer`)

Spawn `test-designer` sub-agents in parallel (spec appended below), one per category:

- **Always spawn**: `smoke`, `authz`, `migration-risk`.
- **Fallback only — spawn `functional` and `flows` ONLY if `plan.md` does NOT exist.** When `plan.md` exists, the live path owns these; do not spawn them here or you reintroduce duplicate tests.

Pass to each sub-agent:

- `app`: `{{app_name}}`
- `category`: the category name
- `app_model`: the JSON object returned by `read_app_model` (pass inline — do not re-read from disk)
- `description_path`: `{{app_name}}/description.md`
- `out_dir`: `{{app_name}}/tests/generated/model/<category>/` (substitute the category name)

## Step 2 — Live-execution specs (`playwright-test-generator`)

- **If `plan.md` does not exist**: skip this step. Step 1's fallback already covered `functional` and `flows`. Suggest re-running `/discover {{app_name}}` if browser-verified coverage is desired.
- **If `plan.md` exists**: spawn **one** `playwright-test-generator` sub-agent (spec appended below) with `scenario: "all"`. It resolves locators from `app-model.json` first and goes live only for gaps the model cannot capture, then writes one `.spec.ts` per scenario to `{{app_name}}/tests/generated/live/<category>/`.

  Pass to the sub-agent:
  - `app`: `{{app_name}}`
  - `plan_path`: `{{app_name}}/tests/plan.md`
  - `scenario`: `"all"`
  - `base_url`: from `{{app_name}}/config.yaml`
  - `app_model`: the JSON object returned by `read_app_model` (pass inline — the generator has only `Read`, no `Glob`/`Bash`, so it cannot locate the file itself)
  - `seed_file`: `seed.spec.ts`
  - `fixtures_import`: `../../../../../lib/fixtures`
  - `auth_fixture`: `authedPage`

  The plan contains only `functional` and `flows` scenarios, so live specs never overlap the model-based categories.

## Output

- Model-based: `{{app_name}}/tests/generated/model/<category>/*.spec.ts`
- Live-execution: `{{app_name}}/tests/generated/live/<category>/*.spec.ts`

## Step 3 — After design completes

Tell the user:

- How many spec files were written (model-based vs live-execution).
- Whether any live scenarios were marked `test.fixme()` (needs attention before running).
- They can run the **test-app** prompt to execute the full suite.

## Constraints

- `{{app_name}}/tests/curated/` is never touched by this stage.
- All specs must route auth through `lib/fixtures.ts` — no hardcoded `storageState` paths.
