import { readdirSync, existsSync } from "fs";
import { appRunsDir } from "../lib/paths.js";

export function listRuns(app: string): string[] {
  const runs = appRunsDir(app);
  if (!existsSync(runs)) return [];
  return readdirSync(runs).sort().reverse();
}
