You are scaffolding a new app under test in the browser-tester harness.

App name: {{app_name}}

## Steps

1. Call `scaffold_app` with name `{{app_name}}` to copy the template.

2. Ask the user: **"What is the deployed base URL?"** (required — cannot proceed without this.)

3. Ask the user: **"Do you want to walk me through the app details, or should I discover everything automatically from the URL?"**
   - If they choose **auto-discover** (or say they don't know / just want to provide the URL): go to **Fast Path** below.
   - If they choose **guided setup**: go to **Guided Interview** below.

---

### Fast Path (auto-discover)

Ask only: **"Does the app require login? If yes, how many roles are there and what are the env var names for each role's username and password?"**

- If they provide roles: write `config.yaml` with those roles.
- If they say no login / skip: write `config.yaml` with `roles: []` and `auth.flow: none`.

Write `{{app_name}}/config.yaml` with the base URL and any roles provided. Leave `auth.flow: unknown` unless the user said no login.

Write a stub `{{app_name}}/description.md` with this content:

```markdown
# {{app_name}}

> Auto-generated stub — sections below will be filled in by the discover stage.

## What the app does

_To be discovered._

## Roles

_To be discovered._

## Top user journeys

_To be discovered._

## Business rules

_To be discovered._

## Known post-migration bugs

_To be discovered._

## Out of scope

_To be discovered._
```

Then tell the user:

- "Copy `{{app_name}}/secrets.local.env.example` to `secrets.local.env` and fill in real credentials. That file is gitignored."

Then output the **Next step** block (see end of this prompt). Stop here — do not ask further questions.

---

### Guided Interview

Interview the user — one topic per message, in this order:

a. Roles: how many, and a short label for each.
b. For each role: the env var names for username and password.
c. Top user journeys — ask them to list 3–5 names first. If they're unsure, tell them: "You can skip this — the discover stage will infer journeys automatically."
d. (Only if they provided journeys) For each journey: walk-through steps and what "success looks like".
e. Any calculations or business rules (inputs → outputs, formulas). ("None" or "unsure" is fine — discover will infer.)
f. Known post-migration bugs to watch for. ("None" is a valid answer.)
g. Anything explicitly out of scope (e.g. Fiori shell header, third-party widgets).

Using the collected answers, write:

- `{{app_name}}/config.yaml` — fill base_url, roles (id, label, secret_user, secret_pass env var names). Leave `auth.flow: unknown`.
- `{{app_name}}/description.md` — fill every section the user answered. For any section the user skipped, write `_To be discovered._` so the discover stage fills it in.

Then tell the user:

- "Copy `{{app_name}}/secrets.local.env.example` to `secrets.local.env` and fill in real credentials. That file is gitignored."

Then output the **Next step** block (see end of this prompt).

---

## Constraints

- Do not generate tests, write to `lib/`, or run Playwright in this stage.
- Do not move to the next interview question until the user has answered the current one.
- Never block progress waiting for journey details — they are always optional.

---

## Next step

After the files are written and the credential note is shown, end your response with exactly this block:

> ✅ **`add-app` complete for `{{app_name}}`.**
> **Next, run:** `/discover {{app_name}}`
> This crawls the app, detects the auth flow, and fills in the discovered details automatically.
