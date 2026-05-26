import { resolve } from "path";
import { mkdirSync } from "fs";
// Supports an explicit override so the server can be run from any working dir.
export const PROJECT_ROOT = process.env.BROWSER_TESTER_ROOT ?? process.cwd();
export const appDir = (name) => resolve(PROJECT_ROOT, name);
export const appTestsDir = (app) => resolve(PROJECT_ROOT, app, "tests");
export const appRunsDir = (app) => resolve(PROJECT_ROOT, app, "runs");
export function ensureWorkspace() {
    mkdirSync(PROJECT_ROOT, { recursive: true });
}
