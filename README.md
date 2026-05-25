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