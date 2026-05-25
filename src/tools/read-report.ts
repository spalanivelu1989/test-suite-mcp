import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import { appRunsDir } from "../lib/paths.js";

export interface ReportResult {
  content: string;
  path: string;
}

export function readReport(app: string, runDir?: string): ReportResult {
  let targetDir: string;

  if (runDir) {
    targetDir = runDir.startsWith("/") ? runDir : join(appRunsDir(app), runDir);
  } else {
    const runs = appRunsDir(app);
    if (!existsSync(runs)) {
      throw new Error(
        `No runs found for app "${app}". Run /test-app ${app} first.`,
      );
    }
    const latest = readdirSync(runs).sort().reverse()[0];

    if (!latest) {
      throw new Error(
        `No runs found for app "${app}". Run /test-app ${app} first.`,
      );
    }
    targetDir = join(runs, latest);
  }

  const reportPath = join(targetDir, "report.md");
  if (!existsSync(reportPath)) {
    throw new Error(
      `report.md not found in ${targetDir}. Run /test-app first.`,
    );
  }

  return { content: readFileSync(reportPath, "utf-8"), path: reportPath };
}
