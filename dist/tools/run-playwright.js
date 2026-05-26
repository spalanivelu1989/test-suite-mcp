import { execSync } from "child_process";
import { mkdirSync, existsSync, cpSync, rmSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { config as loadDotenv } from "dotenv";
import { PROJECT_ROOT, appRunsDir, appTestsDir, appDir } from "../lib/paths.js";
// Resolve the playwright binary that ships with this package so we never
// fall through to npx downloading it at runtime.
const PACKAGE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const PLAYWRIGHT_BIN = join(PACKAGE_ROOT, "node_modules", ".bin", "playwright");
const PLAYWRIGHT_CONFIG = join(PACKAGE_ROOT, "playwright.config.ts");
export function runPlaywright(app, category) {
    // Load app secrets into the child process environment
    const secretsFile = join(appDir(app), "secrets.local.env");
    const childEnv = { ...process.env };
    if (existsSync(secretsFile)) {
        const parsed = loadDotenv({ path: secretsFile, processEnv: {} });
        Object.assign(childEnv, parsed.parsed ?? {});
    }
    let testPaths;
    if (category) {
        const modelPath = join(appTestsDir(app), "generated", "model", category);
        const livePath = join(appTestsDir(app), "generated", "live", category);
        testPaths = [modelPath, livePath].filter(existsSync);
        if (testPaths.length === 0) {
            throw new Error(`No "${category}" specs found under ${join(appTestsDir(app), "generated")}. Run /design ${app} first.`);
        }
    }
    else {
        const testsDir = appTestsDir(app);
        if (!existsSync(testsDir)) {
            throw new Error(`Test directory not found: ${testsDir}. Run /design ${app} first.`);
        }
        testPaths = [testsDir];
    }
    const ts = new Date().toISOString().replace(/:/g, "-").replace(/\..+/, "");
    const runDir = join(appRunsDir(app), ts);
    mkdirSync(runDir, { recursive: true });
    // Ensure the Chromium browser binary is present before running tests.
    // This is a no-op if already installed, so it's safe to run every time.
    // Handles the case where this package was installed as a dependency (postinstall
    // scripts don't run for transitive deps) or where the cache was cleared.
    execSync(`"${PLAYWRIGHT_BIN}" install chromium`, {
        stdio: "inherit",
        timeout: 120_000,
    });
    try {
        execSync(`"${PLAYWRIGHT_BIN}" test --config "${PLAYWRIGHT_CONFIG}" ${testPaths.join(" ")}`, {
            cwd: PROJECT_ROOT,
            env: childEnv,
            // 10-minute ceiling; individual test timeouts are set in playwright.config.ts
            timeout: 600_000,
            stdio: "inherit",
        });
    }
    catch {
        // Playwright exits non-zero when tests fail — that is expected, not fatal.
        // Actual infrastructure errors (missing binary, config parse failure) will
        // still throw because they write nothing to test-results/.
    }
    // Move Playwright's default output locations into the run directory.
    // Playwright resolves outputDir/outputFile relative to the config file, so
    // these land under PACKAGE_ROOT, not PROJECT_ROOT (the app workspace root).
    const srcResults = join(PACKAGE_ROOT, "test-results");
    const srcReport = join(PACKAGE_ROOT, "playwright-report");
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
        throw new Error(`Playwright JSON results not found at ${jsonPath}. ` +
            `The suite may have failed to start (check secrets.local.env and test path).`);
    }
    const raw = JSON.parse(readFileSync(jsonPath, "utf-8"));
    return parseResults(raw, runDir, jsonPath);
}
function parseResults(raw, runDir, jsonPath) {
    const stats = (raw.stats ?? {});
    const failures = [];
    for (const suite of (raw.suites ?? [])) {
        collectFailures(suite, failures);
    }
    return {
        run_dir: runDir,
        total: (stats.expected ?? 0) + (stats.unexpected ?? 0) + (stats.skipped ?? 0),
        passed: stats.expected ?? 0,
        failed: stats.unexpected ?? 0,
        skipped: stats.skipped ?? 0,
        duration_ms: stats.duration ?? 0,
        failures,
        html_report_path: join(runDir, "playwright-report", "index.html"),
        json_results_path: jsonPath,
    };
}
function collectFailures(suite, out) {
    for (const spec of suite.specs ?? []) {
        if (spec.ok)
            continue;
        for (const test of spec.tests ?? []) {
            if (test.status !== "unexpected" && test.status !== "flaky")
                continue;
            const last = test.results?.[test.results.length - 1];
            const trace = last?.attachments?.find((a) => a.name === "trace")?.path ?? null;
            const video = last?.attachments?.find((a) => a.name === "video")?.path ?? null;
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
