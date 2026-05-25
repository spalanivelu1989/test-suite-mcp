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

## Tools

| Tool                             | Description                                                                                         |
| -------------------------------- | --------------------------------------------------------------------------------------------------- |
| `list_apps`                      | List all registered app names under `apps/`                                                         |
| `scaffold_app(name)`             | Create `apps/<name>/` with starter `config.yaml`, `description.md`, and `secrets.local.env.example` |
| `read_app_model(app)`            | Return the most recent `app-model.json` for an app                                                  |
| `list_runs(app)`                 | List run directories for an app, newest first                                                       |
| `run_playwright(app, category?)` | Run the Playwright suite; returns pass/fail counts + per-failure metadata                           |
| `read_report(app, run_dir?)`     | Read `report.md` from the latest (or specific) run                                                  |

`run_playwright` automatically loads `apps/<app>/secrets.local.env` into the
child process environment — no manual env wiring needed.

## Prompts

Prompts are orchestration instructions the client loads to guide the LLM through
each workflow stage. They accept an `app_name` argument.

| Prompt     | Stage                                              | Sub-agents loaded      |
| ---------- | -------------------------------------------------- | ---------------------- |
| `add-app`  | Interview the user and scaffold a new app          | —                      |
| `discover` | Guide the user through crawling the deployed app   | `understanding`        |
| `design`   | Guide the user through generating Playwright specs | `test-designer`        |
| `test-app` | Run the suite, diagnose failures, read the report  | `executor`, `reporter` |

> `discover` and `design` require browser automation (Playwright MCP) and
> LLM-driven sub-agents that only exist in Claude Code. Those prompts guide the
> user to run `/discover` and `/design` in Claude Code, then return here to
> read results via `read_app_model` / `read_report`.

## Publishing to npm

### One-time setup

1. Create an account at [npmjs.com](https://www.npmjs.com) if you don't have one.
2. Log in from the terminal:
   ```bash
   npm login
   ```
3. Update the `repository.url` in `package.json` to the real GitHub URL.

### Publish

From the repo root:

```bash
npm publish
```

`prepublishOnly` runs `npm run build` automatically before publishing, so no
manual build step is needed. The package name `test-suite-mcp` must be unique
on npm — if it's already taken, use a scoped name instead:

```bash
# rename in package.json first, then:
npm publish --access public
```

### Using the published package

Users can then configure any MCP client with:

```json
{
  "mcpServers": {
    "test-suite": {
      "command": "npx",
      "args": ["-y", "test-suite-mcp@latest"],
      "env": {
        "BROWSER_TESTER_ROOT": "/path/to/any/empty/directory"
      }
    }
  }
}
```

`BROWSER_TESTER_ROOT` is **required** when using `npx` — point it at any
directory on the local machine. The server automatically creates `apps/`,
`tests/`, and `runs/` inside it on first connection. No manual setup needed.

### Publish a new version

```bash
npm version patch   # or minor / major
npm publish
```

---

## Installation

### Clone and build locally

```bash
git clone https://github.com/your-org/test-suite-mcp.git
cd test-suite-mcp
npm install
npm run build        # compiles src/ → dist/
```

Point your MCP client at the built binary:

```
/absolute/path/to/test-suite-mcp/dist/index.js
```

See [Configuring clients](#configuring-clients) below for the exact config block per client.

### Update from GitHub

Pull the latest changes and rebuild:

```bash
cd test-suite-mcp
git pull origin main
npm install          # picks up any new dependencies
npm run build        # recompiles src/ → dist/
```

Then restart your MCP client to pick up the new binary.

## Setup (development)

```bash
npm install
npm run build        # compiles src/ → dist/
```

For development (no build step):

```bash
npm run dev          # runs tsx src/index.ts directly
```

## Configuring clients

### Claude Code (project-level)

Add to `.claude/settings.json` in the test-suite-mcp project root:

```json
{
  "mcpServers": {
    "test-suite": {
      "command": "node",
      "args": ["./dist/index.js"]
    }
  }
}
```

Development variant (no build required):

```json
{
  "mcpServers": {
    "test-suite": {
      "command": "npx",
      "args": ["tsx", "./src/index.ts"]
    }
  }
}
```

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)
or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

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

Restart Claude Desktop after saving.

### VS Code (GitHub Copilot)

Create `.vscode/mcp.json` in the test-suite-mcp project root:

```json
{
  "servers": {
    "test-suite": {
      "type": "stdio",
      "command": "node",
      "args": ["${workspaceFolder}/dist/index.js"]
    }
  }
}
```

Note the top-level key is `servers`, not `mcpServers`. The `${workspaceFolder}`
variable resolves to the project root automatically.

### OpenAI Codex CLI

Edit `~/.codex/config.toml` (global) or `.codex/config.toml` (project-scoped):

```toml
[mcp_servers.test-suite]
command = "node"
args = ["/absolute/path/to/test-suite-mcp/dist/index.js"]
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

No `env` block needed — the server resolves the project root from its own file location automatically.

### Cursor / Zed / other MCP clients

Point the client at the built binary with the project root as the working
directory, or set `BROWSER_TESTER_ROOT` explicitly:

```json
{
  "mcpServers": {
    "test-suite": {
      "command": "node",
      "args": ["/absolute/path/to/test-suite-mcp/dist/index.js"],
      "env": {
        "BROWSER_TESTER_ROOT": "/absolute/path/to/workspace"
      }
    }
  }
}
```

### Claude.ai (remote MCP — future)

Build the server, deploy it behind an HTTP transport (e.g. using
`@modelcontextprotocol/sdk`'s `StreamableHTTPServerTransport`), and register
the URL in Claude.ai's MCP settings. The stdio-based server here is a starting
point; swapping the transport is a one-line change in `src/index.ts`.

## Environment variables

| Variable              | Default                       | Purpose                                                                                                               |
| --------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `BROWSER_TESTER_ROOT` | Parent of `dist/` (repo root) | Workspace root — `apps/`, `tests/`, and `runs/` are created here automatically on startup. Required when using `npx`. |

Per-app credentials belong in `apps/<app>/secrets.local.env` (gitignored).
`run_playwright` loads them automatically; other tools do not need them.

## Capability boundary

This server handles the **deterministic** parts of the workflow:

- File scaffolding
- Reading crawl artifacts
- Executing Playwright
- Reading reports

The **reasoning** parts — detecting auth flows, interpreting DOM structure,
writing test specs — remain with the LLM using the bundled prompts and agents.
For full sub-agent orchestration with trace replay, use the Claude Code harness
directly (`/discover`, `/design`, `/test-app`).
