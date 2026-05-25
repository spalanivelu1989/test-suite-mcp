import { resolve, dirname } from "path";
import { mkdirSync } from "fs";
import { fileURLToPath } from "url";

// Supports an explicit override so the server can be run from any working dir.
export const PROJECT_ROOT =
  process.env.BROWSER_TESTER_ROOT ??
  resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

export const appsDir = () => resolve(PROJECT_ROOT, "apps");
export const appTestsDir = (app: string) => resolve(appsDir(), app, "tests");
export const appRunsDir = (app: string) => resolve(appsDir(), app, "runs");

export function ensureWorkspace(): void {
  mkdirSync(appsDir(), { recursive: true });
}
