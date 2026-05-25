import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import { appRunsDir } from "../lib/paths.js";
export function readAppModel(app) {
    const runs = appRunsDir(app);
    if (!existsSync(runs)) {
        throw new Error(`No runs found for app "${app}". Run /discover ${app} first.`);
    }
    const latest = readdirSync(runs).sort().reverse()[0];
    if (!latest) {
        throw new Error(`No runs found for app "${app}". Run /discover ${app} first.`);
    }
    const modelPath = join(runs, latest, "app-model.json");
    if (!existsSync(modelPath)) {
        throw new Error(`app-model.json not found in ${latest}`);
    }
    return JSON.parse(readFileSync(modelPath, "utf-8"));
}
