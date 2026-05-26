import { resolve } from "path";
import { mkdirSync } from "fs";
import { existsSync } from "fs";

// Project root can be explicitly set via BROWSER_TESTER_ROOT.
// Falls back to cwd, which is correct when the MCP server starts in the workspace.
export const PROJECT_ROOT = process.env.BROWSER_TESTER_ROOT ?? process.cwd();

export const appDir = (name: string) => {
  // 1. Expected case: app lives directly under PROJECT_ROOT.
  const directPath = resolve(PROJECT_ROOT, name);
  if (existsSync(directPath)) return directPath;

  // 2. Fallback: the MCP server's cwd may be the package directory itself
  //    (e.g. test-suite-mcp/) while user apps live in a sibling directory.
  //    Walk one level up and check there.
  const siblingPath = resolve(PROJECT_ROOT, "..", name);
  if (existsSync(siblingPath)) return siblingPath;

  // 3. Default: return the direct path so later code produces a clear error.
  return directPath;
};

export const appTestsDir = (app: string) => resolve(appDir(app), "tests");
export const appRunsDir = (app: string) => resolve(appDir(app), "runs");
export const appConfigFile = (app: string) => resolve(appDir(app), "config.yaml");
export const appDescriptionFile = (app: string) => resolve(appDir(app), "description.md");
export const appSecretsFile = (app: string) => resolve(appDir(app), "secrets.local.env");

export function ensureWorkspace(): void {
  mkdirSync(PROJECT_ROOT, { recursive: true });
}
