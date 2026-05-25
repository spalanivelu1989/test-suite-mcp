import { readdirSync, statSync, existsSync } from "fs";
import { join } from "path";
import { appsDir } from "../lib/paths.js";

export function listApps(): string[] {
  const dir = appsDir();
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(
    (name) => !name.startsWith("_") && statSync(join(dir, name)).isDirectory(),
  );
}
