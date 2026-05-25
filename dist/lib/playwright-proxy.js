import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { createRequire } from "module";
const _require = createRequire(import.meta.url);
let client = null;
let browserTools = [];
function resolvePlaywrightMcpCli() {
    const pkgJsonPath = _require.resolve("@playwright/mcp/package.json");
    const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf-8"));
    const pkgDir = dirname(pkgJsonPath);
    if (pkg.bin) {
        const binPath = typeof pkg.bin === "string" ? pkg.bin : Object.values(pkg.bin)[0];
        return join(pkgDir, binPath);
    }
    throw new Error("@playwright/mcp has no bin entry in package.json");
}
export async function initPlaywrightProxy() {
    let cliPath;
    try {
        cliPath = resolvePlaywrightMcpCli();
    }
    catch (err) {
        console.error("[playwright-proxy] @playwright/mcp not found —", err);
        return;
    }
    try {
        const transport = new StdioClientTransport({
            command: process.execPath,
            args: [cliPath],
        });
        client = new Client({ name: "test-suite-browser-proxy", version: "0.1.0" }, { capabilities: {} });
        await client.connect(transport);
        const { tools } = await client.listTools();
        browserTools = tools;
        console.error(`[playwright-proxy] ready — ${browserTools.length} browser tools`);
    }
    catch (err) {
        console.error("[playwright-proxy] failed to start:", err);
        client = null;
        browserTools = [];
    }
}
export function getBrowserTools() {
    return browserTools;
}
export function isBrowserTool(name) {
    return browserTools.some((t) => t.name === name);
}
export async function callBrowserTool(name, args) {
    if (!client) {
        throw new Error("Playwright proxy not connected — ensure @playwright/mcp is installed.");
    }
    // The Client and Server SDK union types differ structurally even though
    // they are protocol-compatible; cast through unknown to satisfy tsc.
    return client.callTool({ name, arguments: args });
}
