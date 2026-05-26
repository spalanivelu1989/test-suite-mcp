# test-suite-mcp

An MCP server that exposes a browser-testing harness as primitive tools and
orchestration prompts. Any MCP-compatible client (Claude Code, Cursor, Zed,
Claude.ai) can use these tools to drive the QA workflow without needing the
Claude Code slash-command infrastructure.

## Architecture (primitive tools)

The server exposes deterministic file-system and Playwright operations as tools.
The calling LLM handles orchestration using the bundled prompts. This keeps the
server thin and stateless — no internal LLM calls, no sub-agents.

```
test-suite-mcp/          ← repo root (this package)
  src/
    index.ts             ← server entry, tool + prompt registration
    tools/               ← one file per tool
    lib/paths.ts         ← project root resolution
  agents/                ← sub-agent prompt files loaded at runtime
  prompts/               ← orchestration prompts (loaded at runtime)
  dist/                  ← compiled output
```

Workspace directories created at `BROWSER_TESTER_ROOT` on first connection:

```
<workspace>/
  apps/                  ← per-app config (config.yaml, description.md, secrets.local.env)
  tests/                 ← generated + curated specs
  runs/                  ← per-run artifacts
```

## Installation

### Prerequisites

- **Node.js** 18+ (required)
- **npm** 9+ (required)
- **System dependencies** (Linux only):
  - Debian/Ubuntu: `sudo apt-get install -y libnss3 libdbus-1-3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libpango-1.0-0 libpangoft2-1.0-0`
  - Other distributions: See [Playwright system requirements](https://playwright.dev/docs/intro#system-requirements)

### Clone and build locally

```bash
git clone https://github.com/your-org/test-suite-mcp.git
cd test-suite-mcp
npm install
npm run build        # compiles src/ → dist/
```

This will automatically:

1. Install `@playwright/mcp` and all dependencies
2. Download Playwright browser binaries (Chromium, Firefox, WebKit)
3. Compile TypeScript to JavaScript in `dist/`

**If browser binaries don't download automatically**, run:

```bash
npx playwright install
```

Point your MCP client at the built binary:

```
/absolute/path/to/test-suite-mcp/dist/index.js
```

## Configuring clients

### Claude Code

```bash
claude mcp add --scope user --transport stdio test-suite-mcp -- node /absolute/path/to/test-suite-mcp/dist/index.js
```

Verify Installation in claude code by running the command

```bash
❯ /mcp

  Manage MCP servers
  6 servers

    User MCPs (/Users/senthilpalanivelu/.claude.json)
    magic · ✔ connected · 4 tools
    stitch · ✔ connected · 14 tools
    supadata · ✔ connected · 6 tools
  ❯ test-suite-mcp · ✔ connected · 6 tools
```

### Antigravity (Google IDE)

Add to Antigravity's MCP settings:

```json
{
  "mcpServers": {
    "test-suite": {
      "command": "node",
      "args": ["/absolute/path/to/test-suite-mcp/dist/index.js"]
    }
  }
}
```

To remove the server you just added:

```bash
claude mcp remove test-suite-mcp
```

## Workflow

The harness runs as a four-stage pipeline. Each stage is an orchestration prompt
(in `prompts/`) that drives one or more sub-agents (in `agents/`). Run them in order:

```
add-app  →  discover  →  design  →  test-app
```

| Stage       | Prompt     | Sub-agents                                       | What it does                                                                                                                                                                       |
| ----------- | ---------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Add app  | `add-app`  | —                                                | Scaffolds `<app>/config.yaml`, `description.md`, and `secrets.local.env.example`. Interviews you for URL, roles, and journeys (or stubs them for auto-discovery).                  |
| 2. Discover | `discover` | `understanding` → `playwright-test-planner`      | Crawls the deployed app: detects auth flow, logs in per role, BFS-crawls pages, and writes `app-model.json`. Then plans the `functional` + `flows` scenarios into `tests/plan.md`. |
| 3. Design   | `design`   | `test-designer` ×N, `playwright-test-generator`  | Generates runnable `.spec.ts` files from the model and the plan.                                                                                                                   |
| 4. Test     | `test-app` | `executor`, `playwright-test-healer`, `reporter` | Runs the suite, diagnoses each failure, auto-heals spec-level breakage, and writes a plain-English report.                                                                         |

The two sub-agents bundled with each prompt are appended to the prompt text at
runtime (`PROMPT_AGENTS` in `src/index.ts`), so the calling LLM has their specs
inline — no separate agent runtime is required.

### Test generation: one test per category (no duplicates)

Two generation paths exist, and each category is owned by exactly one of them, so
the same behavior is never tested twice:

| Path           | Owner                       | Categories                         | How                                                                                                                                                                                                    |
| -------------- | --------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Model-based    | `test-designer`             | `smoke`, `authz`, `migration-risk` | Generated structurally from `app-model.json` — no browser. Breadth across all crawled pages. Written to `<app>/tests/generated/model/`.                                                                |
| Live-execution | `playwright-test-generator` | `functional`, `flows`              | Locators resolved from `app-model.json` first; the browser is used only for gaps the model can't capture (form outcomes, validation text, flow transitions). Written to `<app>/tests/generated/live/`. |

If no `tests/plan.md` exists (the planner didn't run), the model-based path also
covers `functional` and `flows` as a fallback, so coverage is never lost.

The `playwright-test-planner` (during discover) likewise works model-first: it
derives structure from `app-model.json` and goes live only for dynamic outcomes,
rather than re-crawling what the `understanding` agent already captured.

### Reports

`test-app` writes `report.md` and a self-contained `report.html` into the run
directory. The report is written for non-technical readers and includes:

- **Success rate** — passed ÷ total as a percentage, counted post-heal.
- **What Passed / What Needs Attention / Where to Improve** — a plain-English
  breakdown across every test (no stack traces or line numbers outside the
  Technical Appendix).
- **Migration Risk Findings** — failures tagged `@migration-risk` or rooted in
  auth/data/infra, surfaced first.
- **Fix Prompts** — copy-pasteable prompts (app-code fixes, test fixes,
  infra/config) that list every concrete problem and the exact change to make.

Read the latest report any time with the `read_report` tool.
