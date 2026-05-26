# Getting Started with Browser Tester MCP

This tool lets you automatically test any web application using plain English. You describe your app, and the tool crawls it, writes tests, runs them, and gives you a report — all without writing a single line of code yourself.

---

## Part 1 — Installation

### Step 1: Clone the project

Open your terminal and run:

```bash
git clone https://github.com/your-org/browser-tester.git
cd browser-tester
```

### Step 2: Install dependencies

```bash
npm install
```

### Step 3: Build the project

```bash
npm run build
```

This compiles the project into a `dist/` folder that Claude can run.

### Step 4: Connect it to Claude Code

Run this command, replacing `/path/to/browser-tester` with the actual folder location on your computer:

```bash
claude mcp add browser-tester -- node /path/to/browser-tester/dist/index.js
```

To confirm it connected, run:

```bash
claude mcp list
```

You should see `browser-tester` in the list.

---

## Part 2 — How It Works (The Big Picture)

Testing a web app with this tool is a four-step journey. Each step has a command you type into Claude:

```
/add-app    →    /discover    →    /design    →    /test-app
   Set up          Crawl the       Write the       Run the
   your app        app live        tests           tests
```

Each command is powered by a **prompt file** (in the `prompts/` folder), which in turn uses one or more **agents** (in the `agents/` folder) to do the work. You do not need to open these files — Claude reads them automatically when you run a command.

---

## Part 3 — The Four Commands

### Command 1: `/add-app` — Register your app

**What it does:** Asks you a few questions about your app (or just takes the URL), then creates a folder for it with a basic configuration.

**How to call it:**

```
/add-app my-app-name
```

Replace `my-app-name` with a short label for your app (lowercase, hyphens only — e.g. `roi-calculator`).

**What it asks you:**

- The URL of your app
- Whether you want to describe it yourself or let the tool figure it out automatically
- If you choose manual: role names (e.g. admin, viewer) and their login credentials

**Files it creates:**

| File                                         | What it contains                               |
| -------------------------------------------- | ---------------------------------------------- |
| `apps/my-app-name/config.yaml`               | The app URL and login role configuration       |
| `apps/my-app-name/description.md`            | What the app does, user journeys, known issues |
| `apps/my-app-name/secrets.local.env.example` | A template for your login credentials          |

**Important:** Copy `secrets.local.env.example` to `secrets.local.env` in the same folder and fill in your real usernames and passwords. This file is never committed to version control.

---

### Command 2: `/discover` — Crawl your app

**What it does:** Opens your app in a browser, logs in, and explores every page automatically. It maps out the structure of your app and writes a test plan.

**How to call it:**

```
/discover my-app-name
```

**What happens behind the scenes:**

Two agents work in sequence:

1. **`understanding` agent** — Logs in as each role, visits every page, and records what it finds (buttons, forms, navigation links, API calls). This takes a few minutes.
2. **`playwright-test-planner` agent** — Explores the live app and designs a set of test scenarios based on what it saw.

**Files it creates:**

| File                                               | What it contains                                                                    |
| -------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `apps/my-app-name/.auth/<role>.json`               | Saved login session for each role (so tests don't need to log in every time)        |
| `apps/my-app-name/runs/<timestamp>/app-model.json` | A map of every page, form, and button found in the app                              |
| `apps/my-app-name/tests/plan.md`                   | A human-readable list of test scenarios                                             |
| `apps/my-app-name/description.md`                  | Auto-filled with what the tool discovered (if you used the fast path in `/add-app`) |

After this step, open `apps/my-app-name/tests/plan.md` to review the test plan. You can read through the scenarios and feel free to move on if they look right.

---

### Command 3: `/design` — Write the tests

**What it does:** Takes the app map and test plan from the previous step and writes actual Playwright test code for each scenario.

**How to call it:**

```
/design my-app-name
```

**What happens behind the scenes:**

Two sets of agents work to produce test files:

1. **`test-designer` agents** (one per test category, running in parallel) — Read the app map and write tests based on what was discovered statically. These cover five categories:

   | Category         | What gets tested                                             |
   | ---------------- | ------------------------------------------------------------ |
   | `smoke`          | Does the app load? Are the main links visible?               |
   | `functional`     | Do forms work? Do validation messages appear correctly?      |
   | `flows`          | Can a user complete a full journey end to end?               |
   | `authz`          | Can each role access the right pages (and only those pages)? |
   | `migration-risk` | Are there any signs the app broke during a recent migration? |

2. **`playwright-test-generator` agent** — Executes each scenario from `plan.md` live in a browser, confirms the exact buttons and fields to click, then writes the test code.

**Files it creates:**

| Folder                                               | What it contains                                                  |
| ---------------------------------------------------- | ----------------------------------------------------------------- |
| `apps/my-app-name/tests/generated/model/<category>/` | Tests written from the app map (one file per scenario)            |
| `apps/my-app-name/tests/generated/live/<category>/`  | Tests written from live browser execution (one file per scenario) |

These are standard `.spec.ts` Playwright test files. You do not need to edit them.

---

### Command 4: `/test-app` — Run the tests

**What it does:** Runs all the generated tests against your live app, diagnoses any failures, automatically fixes simple issues, and produces a plain-English report.

**How to call it:**

```
/test-app my-app-name
```

You can also run just one category for a quick check:

```
/test-app my-app-name smoke
```

**What happens behind the scenes:**

Three agents handle this stage:

1. **`executor` agent** — Examines each failed test and works out why it failed (wrong selector, session expired, app bug, etc.).
2. **`playwright-test-healer` agent** — For failures it can fix automatically (e.g. a button label changed), it edits the test file and re-runs to confirm the fix.
3. **`reporter` agent** — Assembles everything into a plain-English report.

**Files it creates:**

| File                                                             | What it contains                                       |
| ---------------------------------------------------------------- | ------------------------------------------------------ |
| `apps/my-app-name/runs/<timestamp>/report.md`                    | Plain-English test report                              |
| `apps/my-app-name/runs/<timestamp>/report.html`                  | The same report as a webpage (open in any browser)     |
| `apps/my-app-name/runs/<timestamp>/playwright-report/index.html` | Detailed Playwright report with screenshots and traces |

---

## Part 4 — Viewing Your Test Report

After `/test-app` completes, Claude will show you a summary. To open the full visual report:

1. Navigate to `apps/my-app-name/runs/` in your file manager
2. Open the most recent folder (it's named by date and time)
3. Open `report.html` in your browser for the plain-English version
4. Open `playwright-report/index.html` for the detailed technical report with screenshots of every failure

The report always leads with **Migration Risk Findings** — these are the most important failures to look at first, as they indicate the app may have broken during a recent update.

---

## Part 5 — Your App's Folder Structure

After running all four commands, your app folder looks like this:

```
apps/
  my-app-name/
    config.yaml               ← App URL and login roles
    description.md            ← What the app does
    secrets.local.env         ← Your login credentials (never shared)
    .auth/
      admin.json              ← Saved login session for admin role
      viewer.json             ← Saved login session for viewer role
    tests/
      plan.md                 ← The test plan (readable by humans)
      generated/
        model/                ← Tests written from app map
          smoke/
          functional/
          flows/
          authz/
          migration-risk/
        live/                 ← Tests written from live execution
          smoke/
          functional/
          ...
    runs/
      2026-05-26T10-30-00/    ← Results from one test run
        report.md
        report.html
        app-model.json
        playwright-report/
```

---

## Part 6 — Quick Reference

| What you want to do               | Command                             |
| --------------------------------- | ----------------------------------- |
| Add a new app                     | `/add-app my-app-name`              |
| Crawl and map the app             | `/discover my-app-name`             |
| Write tests                       | `/design my-app-name`               |
| Run all tests                     | `/test-app my-app-name`             |
| Run only smoke tests              | `/test-app my-app-name smoke`       |
| Re-crawl after the app changes    | `/discover my-app-name` (run again) |
| Regenerate tests after a re-crawl | `/design my-app-name` (run again)   |

---

## Part 7 — Agents Reference

You do not need to interact with agents directly — the commands above call them automatically. This table is for reference only.

| Agent file                     | Called by   | What it does                                               |
| ------------------------------ | ----------- | ---------------------------------------------------------- |
| `understanding.md`             | `/discover` | Logs in and crawls every page of the app                   |
| `playwright-test-planner.md`   | `/discover` | Designs the test scenarios from what was found             |
| `test-designer.md`             | `/design`   | Writes test code from the app map (domain-aware)           |
| `playwright-test-generator.md` | `/design`   | Writes test code by re-running scenarios live in a browser |
| `executor.md`                  | `/test-app` | Diagnoses why a test failed                                |
| `playwright-test-healer.md`    | `/test-app` | Automatically fixes tests it can repair                    |
| `reporter.md`                  | `/test-app` | Writes the plain-English report                            |

---

## Troubleshooting

**"Test path not found" error when running `/test-app`**
Run `/design my-app-name` first to generate the test files.

**Tests fail because login stopped working**
Your saved session has expired. Run `/discover my-app-name` again to refresh it.

**The app has changed since you last ran `/discover`**
Run `/discover my-app-name` followed by `/design my-app-name` to update the app map and regenerate tests.

**`secrets.local.env` not found**
Copy `apps/my-app-name/secrets.local.env.example` to `apps/my-app-name/secrets.local.env` and fill in your credentials.
