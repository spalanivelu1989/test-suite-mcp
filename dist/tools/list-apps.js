import { readdirSync, existsSync, statSync } from "fs";
import { join } from "path";
import { PROJECT_ROOT } from "../lib/paths.js";
export function listApps() {
    if (!existsSync(PROJECT_ROOT))
        return [];
    return readdirSync(PROJECT_ROOT).filter((entry) => {
        const dir = join(PROJECT_ROOT, entry);
        try {
            return (statSync(dir).isDirectory() && existsSync(join(dir, "config.yaml")));
        }
        catch {
            return false;
        }
    });
}
