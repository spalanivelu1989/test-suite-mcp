import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { createRequire } from "module";

const _require = createRequire(import.meta.url);

export interface BrowserTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export type { CallToolResult as BrowserToolResult };

let client: Client | null = null;
let browserTools: BrowserTool[] = [];

function resolvePlaywrightMcpCli(): string {
  const pkgJsonPath = _require.resolve("@playwright/mcp/package.json");
  const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf-8")) as {
    bin?: string | Record<string, string>;
  };
  const pkgDir = dirname(pkgJsonPath);
  if (pkg.bin) {
    const binPath =
      typeof pkg.bin === "string" ? pkg.bin : Object.values(pkg.bin)[0];
    return join(pkgDir, binPath);
  }
  throw new Error("@playwright/mcp has no bin entry in package.json");
}

export async function initPlaywrightProxy(): Promise<void> {
  let cliPath: string;
  try {
    cliPath = resolvePlaywrightMcpCli();
  } catch (err) {
    console.error("[playwright-proxy] @playwright/mcp not found —", err);
    return;
  }

  try {
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [cliPath],
    });

    client = new Client(
      { name: "test-suite-browser-proxy", version: "0.1.0" },
      { capabilities: {} },
    );

    await client.connect(transport);
    const { tools } = await client.listTools();
    browserTools = tools as BrowserTool[];
    console.error(
      `[playwright-proxy] ready — ${browserTools.length} browser tools`,
    );
  } catch (err) {
    console.error("[playwright-proxy] failed to start:", err);
    client = null;
    browserTools = [];
  }
}

export function getBrowserTools(): BrowserTool[] {
  return browserTools;
}

export function isBrowserTool(name: string): boolean {
  return browserTools.some((t) => t.name === name);
}

export async function callBrowserTool(
  name: string,
  args: Record<string, unknown>,
): Promise<CallToolResult> {
  if (!client) {
    throw new Error(
      "Playwright proxy not connected — ensure @playwright/mcp is installed.",
    );
  }
  // The Client and Server SDK union types differ structurally even though
  // they are protocol-compatible; cast through unknown to satisfy tsc.
  return client.callTool({ name, arguments: args }) as unknown as CallToolResult;
}
