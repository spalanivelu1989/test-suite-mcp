#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

import { listApps } from "./tools/list-apps.js";
import { scaffoldApp } from "./tools/scaffold-app.js";
import { readAppModel } from "./tools/read-app-model.js";
import { listRuns } from "./tools/list-runs.js";
import { runPlaywright } from "./tools/run-playwright.js";
import { readReport } from "./tools/read-report.js";
import { ensureWorkspace } from "./lib/paths.js";
import {
  initPlaywrightProxy,
  getBrowserTools,
  isBrowserTool,
  callBrowserTool,
} from "./lib/playwright-proxy.js";

const PROMPTS_DIR = join(dirname(fileURLToPath(import.meta.url)), "../prompts");
const AGENTS_DIR = join(dirname(fileURLToPath(import.meta.url)), "../agents");

function loadPrompt(name: string): string {
  const p = join(PROMPTS_DIR, `${name}.md`);
  return existsSync(p)
    ? readFileSync(p, "utf-8")
    : `Prompt "${name}" not found.`;
}

function loadAgent(name: string): string | null {
  const p = join(AGENTS_DIR, `${name}.md`);
  return existsSync(p) ? readFileSync(p, "utf-8") : null;
}

const PROMPT_AGENTS: Record<string, string[]> = {
  "add-app": [],
  discover: ["understanding", "playwright-test-planner"],
  design: ["test-designer", "playwright-test-generator"],
  "test-app": ["executor", "playwright-test-healer", "reporter"],
};

const server = new Server(
  { name: "browser-tester", version: "0.1.0" },
  { capabilities: { tools: {}, prompts: {} } },
);

// ─── Tools ────────────────────────────────────────────────────────────────────

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    ...getBrowserTools(),
    {
      name: "list_apps",
      description: "Return every app name registered under apps/.",
      inputSchema: { type: "object", properties: {}, required: [] },
    },
    {
      name: "scaffold_app",
      description:
        "Copy the _template into apps/<name>/ to register a new app. " +
        "Raises an error if the name already exists or is not kebab-case.",
      inputSchema: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Kebab-case app name, e.g. roi-calc",
          },
        },
        required: ["name"],
      },
    },
    {
      name: "read_app_model",
      description:
        "Read the most recent app-model.json for an app (written by /discover). " +
        "Returns the full JSON object.",
      inputSchema: {
        type: "object",
        properties: {
          app: { type: "string", description: "App name" },
        },
        required: ["app"],
      },
    },
    {
      name: "list_runs",
      description:
        "List run directory names for an app, newest first. " +
        "Useful for picking a specific run_dir to pass to read_report.",
      inputSchema: {
        type: "object",
        properties: {
          app: { type: "string", description: "App name" },
        },
        required: ["app"],
      },
    },
    {
      name: "run_playwright",
      description:
        "Run the Playwright suite for an app (optionally scoped to one category). " +
        "Loads apps/<app>/secrets.local.env automatically. " +
        "Returns pass/fail counts and per-failure metadata (error, trace path, video path). " +
        "Moves Playwright output into a timestamped apps/<app>/runs/<ts>/ directory.",
      inputSchema: {
        type: "object",
        properties: {
          app: { type: "string", description: "App name" },
          category: {
            type: "string",
            enum: [
              "smoke",
              "functional",
              "flows",
              "authz",
              "migration-risk",
              "nfr",
            ],
            description: "Limit run to one test category. Omit to run all.",
          },
        },
        required: ["app"],
      },
    },
    {
      name: "read_report",
      description:
        "Read the report.md from the most recent (or a specific) test run. " +
        "Leads with Migration Risk Findings.",
      inputSchema: {
        type: "object",
        properties: {
          app: { type: "string", description: "App name" },
          run_dir: {
            type: "string",
            description:
              "Specific run directory name (e.g. 2026-05-14T09-30-12). " +
              "Omit to use the most recent run.",
          },
        },
        required: ["app"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    if (isBrowserTool(name)) {
      return callBrowserTool(name, args as Record<string, unknown>);
    }

    switch (name) {
      case "list_apps": {
        const apps = listApps();
        return {
          content: [{ type: "text", text: JSON.stringify(apps, null, 2) }],
        };
      }

      case "scaffold_app": {
        const result = scaffoldApp(args.name as string);
        return {
          content: [
            {
              type: "text",
              text:
                `Scaffolded app at ${result.app_dir}\n\n` +
                `Files created:\n${result.created.join("\n")}\n\n` +
                `Next steps:\n` +
                `1. Copy apps/${args.name}/secrets.local.env.example to apps/${args.name}/secrets.local.env and fill in credentials.\n` +
                `2. Edit apps/${args.name}/config.yaml (base_url, roles).\n` +
                `3. Edit apps/${args.name}/description.md (journeys, rules, known bugs).\n` +
                `4. Run the discover prompt to crawl the app.`,
            },
          ],
        };
      }

      case "read_app_model": {
        const model = readAppModel(args.app as string);
        return {
          content: [{ type: "text", text: JSON.stringify(model, null, 2) }],
        };
      }

      case "list_runs": {
        const runs = listRuns(args.app as string);
        return {
          content: [{ type: "text", text: JSON.stringify(runs, null, 2) }],
        };
      }

      case "run_playwright": {
        const results = runPlaywright(
          args.app as string,
          args.category as
            | import("./tools/run-playwright.js").TestCategory
            | undefined,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
        };
      }

      case "read_report": {
        const report = readReport(
          args.app as string,
          args.run_dir as string | undefined,
        );
        return {
          content: [
            { type: "text", text: `Path: ${report.path}\n\n${report.content}` },
          ],
        };
      }

      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text", text: `Error: ${message}` }],
      isError: true,
    };
  }
});

// ─── Prompts ──────────────────────────────────────────────────────────────────

const PROMPT_DEFS = [
  {
    name: "add-app",
    description:
      "Interview the user to scaffold a new app under test. " +
      "Covers URL, roles, user journeys, business rules, and known migration bugs.",
    arguments: [
      {
        name: "app_name",
        description: "Kebab-case name for the new app",
        required: true,
      },
    ],
  },
  {
    name: "discover",
    description:
      "Orchestrate a crawl of the deployed app: detect auth flow, log in per role, " +
      "BFS-crawl pages, write app-model.json.",
    arguments: [
      { name: "app_name", description: "App name to discover", required: true },
    ],
  },
  {
    name: "design",
    description:
      "Generate Playwright .spec.ts files across 5 categories from app-model.json " +
      "and description.md.",
    arguments: [
      {
        name: "app_name",
        description: "App name to design tests for",
        required: true,
      },
    ],
  },
  {
    name: "test-app",
    description:
      "Run the full Playwright suite, diagnose failures, and produce a report " +
      "with Migration Risk Findings foregrounded.",
    arguments: [
      { name: "app_name", description: "App name to test", required: true },
    ],
  },
];

server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts: PROMPT_DEFS,
}));

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;
  const def = PROMPT_DEFS.find((p) => p.name === name);
  if (!def) {
    throw new Error(`Unknown prompt: ${name}`);
  }

  const appName = (args.app_name as string | undefined) ?? "<app-name>";
  const content = loadPrompt(name).replaceAll("{{app_name}}", appName);

  const agentNames = PROMPT_AGENTS[name] ?? [];
  const agentSections = agentNames
    .map((agentName) => {
      const agentContent = loadAgent(agentName);
      return agentContent
        ? `\n\n---\n\n## Sub-agent: \`${agentName}\`\n\n${agentContent}`
        : "";
    })
    .join("");

  return {
    description: def.description,
    messages: [
      {
        role: "user",
        content: { type: "text", text: content + agentSections },
      },
    ],
  };
});

// ─── Start ────────────────────────────────────────────────────────────────────

ensureWorkspace();
await initPlaywrightProxy();
const transport = new StdioServerTransport();
await server.connect(transport);
