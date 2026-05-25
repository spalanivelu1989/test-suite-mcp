import { execSync } from "child_process";
import { mkdirSync, existsSync, cpSync, rmSync, readFileSync } from "fs";
import { join } from "path";
import { config as loadDotenv } from "dotenv";
import { PROJECT_ROOT, appRunsDir, appTestsDir, appsDir } from "../lib/paths.js";

export type TestCategory =
  | "smoke"
  | "functional"
  | "flows"
  | "authz"
  | "migration-risk"
  | "nfr";

export interface FailureRecord {
  test_id: string;
  title: string;
  file: string;
  error_message: string;
  trace_path: string | null;
  video_path: string | null;
}

export interface PlaywrightResults {
  run_dir: string;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration_ms: number;
  failures: FailureRecord[];
  html_report_path: string;
  json_results_path: string;
}

export function runPlaywright(
  app: string,
  category?: TestCategory,
): PlaywrightResults {
  // Load app secrets into the child process environment
  const secretsFile = join(appsDir(), app, "secrets.local.env");
  const childEnv = { ...process.env };
  if (existsSync(secretsFile)) {
    const parsed = loadDotenv({ path: secretsFile, processEnv: {} });
    Object.assign(childEnv, parsed.parsed ?? {});
  }

  const testPath = category
    ? join(appTestsDir(app), "generated", category)
    : appTestsDir(app);

  if (!existsSync(testPath)) {
    throw new Error(
      `Test path not found: ${testPath}. Run /design ${app} first.`,
    );
  }

  const ts = new Date().toISOString().replace(/:/g, "-").replace(/\..+/, "");
  const runDir = join(appRunsDir(app), ts);
  mkdirSync(runDir, { recursive: true });

  try {
    execSync(`npx playwright test ${testPath} --reporter=list,json,html`, {
      cwd: PROJECT_ROOT,
      env: childEnv,
      // 10-minute ceiling; individual test timeouts are set in playwright.config.ts
      timeout: 600_000,
      stdio: "inherit",
    });
  } catch {
    // Playwright exits non-zero when tests fail — that is expected, not fatal.
    // Actual infrastructure errors (missing binary, config parse failure) will
    // still throw because they write nothing to test-results/.
  }

  // Move Playwright's default output locations into the run directory
  const srcResults = join(PROJECT_ROOT, "test-results");
  const srcReport = join(PROJECT_ROOT, "playwright-report");
  const destResults = join(runDir, "test-results");
  const destReport = join(runDir, "playwright-report");

  if (existsSync(srcResults)) {
    cpSync(srcResults, destResults, { recursive: true });
    rmSync(srcResults, { recursive: true, force: true });
  }
  if (existsSync(srcReport)) {
    cpSync(srcReport, destReport, { recursive: true });
    rmSync(srcReport, { recursive: true, force: true });
  }

  const jsonPath = join(destResults, "results.json");
  if (!existsSync(jsonPath)) {
    throw new Error(
      `Playwright JSON results not found at ${jsonPath}. ` +
        `The suite may have failed to start (check secrets.local.env and test path).`,
    );
  }

  const raw = JSON.parse(readFileSync(jsonPath, "utf-8"));
  return parseResults(raw, runDir, jsonPath);
}

function parseResults(
  raw: Record<string, unknown>,
  runDir: string,
  jsonPath: string,
): PlaywrightResults {
  const stats = (raw.stats ?? {}) as Record<string, number>;
  const failures: FailureRecord[] = [];

  for (const suite of (raw.suites ?? []) as unknown[]) {
    collectFailures(suite as SuiteNode, failures);
  }

  return {
    run_dir: runDir,
    total:
      (stats.expected ?? 0) + (stats.unexpected ?? 0) + (stats.skipped ?? 0),
    passed: stats.expected ?? 0,
    failed: stats.unexpected ?? 0,
    skipped: stats.skipped ?? 0,
    duration_ms: stats.duration ?? 0,
    failures,
    html_report_path: join(runDir, "playwright-report", "index.html"),
    json_results_path: jsonPath,
  };
}

interface Attachment {
  name: string;
  path?: string;
}

interface TestResult {
  status: string;
  error?: { message?: string };
  attachments?: Attachment[];
}

interface TestNode {
  status: string;
  results?: TestResult[];
}

interface SpecNode {
  ok: boolean;
  title?: string;
  tests?: TestNode[];
}

interface SuiteNode {
  file?: string;
  specs?: SpecNode[];
  suites?: SuiteNode[];
}

function collectFailures(suite: SuiteNode, out: FailureRecord[]): void {
  for (const spec of suite.specs ?? []) {
    if (spec.ok) continue;
    for (const test of spec.tests ?? []) {
      if (test.status !== "unexpected" && test.status !== "flaky") continue;
      const last = test.results?.[test.results.length - 1];
      const trace =
        last?.attachments?.find((a) => a.name === "trace")?.path ?? null;
      const video =
        last?.attachments?.find((a) => a.name === "video")?.path ?? null;
      out.push({
        test_id: `${suite.file ?? ""} > ${spec.title ?? ""}`,
        title: spec.title ?? "",
        file: suite.file ?? "",
        error_message: last?.error?.message ?? "",
        trace_path: trace,
        video_path: video,
      });
      break; // one entry per spec
    }
  }
  for (const child of suite.suites ?? []) {
    collectFailures(child, out);
  }
}
