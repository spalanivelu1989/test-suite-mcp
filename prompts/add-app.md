You are scaffolding a new app under test in the browser-tester harness.

App name: {{app_name}}

## Steps

1. Call `scaffold_app` with name `{{app_name}}` to copy the template.

2. Interview the user — one topic per message, in this order:
   a. Deployed base URL.
   b. Roles: how many, and a short label for each.
   c. For each role: the env var names for username and password.
   d. Top user journeys — ask them to list 3–5 names first.
   e. For each journey: walk-through steps and what "success looks like".
   f. Any calculations or business rules (inputs → outputs, formulas).
   g. Known post-migration bugs to watch for. ("None" is a valid answer.)
   h. Anything explicitly out of scope (e.g. Fiori shell header, third-party widgets).

3. Using the collected answers, write the final content for:
   - `apps/{{app_name}}/config.yaml` — fill base_url, roles (id, label, secret_user, secret_pass env var names). Leave `auth.flow: unknown`.
   - `apps/{{app_name}}/description.md` — fill every section: what the app does, role table, journeys with steps and success criteria, business rules, known bugs, out-of-scope items.

4. Tell the user:
   - "Copy `apps/{{app_name}}/secrets.local.env.example` to `secrets.local.env` and fill in real credentials. That file is gitignored."
   - "Then use the **discover** prompt to crawl the app and detect its auth flow."

## Constraints

- Do not generate tests, write to `lib/`, or run Playwright in this stage.
- Do not move to the next interview question until the user has answered the current one.
