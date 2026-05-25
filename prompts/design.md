You are orchestrating the design stage for app: {{app_name}}

## Pre-flight

1. Call `read_app_model` with app=`{{app_name}}` to confirm a crawl exists.
   - If it fails, stop and tell the user to run the **discover** prompt first.
2. Confirm `lib/auth.ts` and `lib/fixtures.ts` exist in the project root.
   - If either is missing, stop — generated specs depend on the fixture for auth.

## Step 1 — Generate specs

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
- `app_model`: result of `read_app_model`
- `description_path`: `apps/{{app_name}}/description.md`

## Output: `apps/{{app_name}}/tests/generated/<category>/*.spec.ts`

## Step 2 — After design completes

Tell the user they can run the **test-app** prompt to execute the generated suite.

## Constraints

- `apps/{{app_name}}/tests/curated/` is never touched by this stage.
- All specs must route auth through `lib/fixtures.ts` — no hardcoded `storageState` paths.
