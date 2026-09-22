/*
 * Repeatable Lighthouse run against the production build, so the metrics stage 4 is
 * judged by can be compared wave over wave instead of eyeballed by hand.
 *
 * Always measures `vite preview`, never `vite dev`: dev does not apply the
 * `/cv-app-cloude/` base path from vite.config.ts, so its asset URLs (and therefore its
 * weight and its score) do not match what GitHub Pages actually serves.
 *
 * Stage 4 is accepted on mobile, `throttlingMethod: "devtools"` — real CPU throttling
 * applied live during capture — not on Lighthouse's Performance score. A score built
 * around load-time metrics (FCP, LCP, TBT, SI, TTI) cannot see an animation that never
 * stops, and this app's actual cost is a permanently-running scene, not page load: the
 * same build scores ~92 under Lighthouse's default *simulated* throttling (which mostly
 * estimates CPU cost from the network waterfall, a poor model for animation-bound work)
 * and roughly half that under real *devtools* throttling, which actually slows the CPU
 * down while the scene keeps animating. Neither number is wrong; they measure different
 * things. `npm run lighthouse` (no flag) runs both: devtools timings as the acceptance
 * metrics, simulated category scores as a regression guard against breaking Accessibility /
 * Best Practices / SEO while chasing Performance. `--desktop` runs a single simulated,
 * desktop-profile, scores-only pass, kept as a second reference point — never the
 * acceptance profile.
 */

import { execSync, spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as chromeLauncher from "chrome-launcher";
import lighthouse, { defaultConfig, desktopConfig } from "lighthouse";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const PORT = 4173; // vite preview's own default; pinned (with --strictPort) so the URL below is never a guess
const BASE_PATH = "/cv-app-cloude/"; // must match vite.config.ts `base` — nothing is served at "/"
const URL_UNDER_TEST = `http://localhost:${PORT}${BASE_PATH}`;
const ARTIFACT_DIR = path.join(ROOT, "artifacts", "performance");
const FOUR_CATEGORIES = ["performance", "accessibility", "best-practices", "seo"];

/* devtools throttling is wall-clock, not a trace-based estimate, so one run can be a fluke.
   Three runs, median reported with the best-worst spread, so a noisy result cannot hide
   behind a single lucky number — the spread itself is diagnostic. */
const DEVTOOLS_RUNS = 3;

const useDesktop = process.argv.includes("--desktop");

/* Set once main() has spawned the preview server, so the SIGINT/SIGTERM handlers below can
   reach it even mid-run. Registering here, at module load, guarantees this listener exists
   before chrome-launcher ever gets a chance to install its own — chrome-launcher installs a
   SIGINT handler of its own the moment it launches its first Chrome, and Node runs listeners
   for one signal in registration order, so going first is what lets us act at all.

   Going first is not enough on its own, though: this handler must also kill every Chrome
   instance itself, via `chromeLauncher.killAll()`, rather than leaving that to chrome-launcher's
   own listener and then calling `process.exit()`. `process.exit()` ends the process immediately
   — no listener registered after the one calling it ever runs — so if ours ran first and then
   exited, chrome-launcher's own listener (the only thing that can kill a Chrome it launched
   detached, in its own process group) would never get its turn, and every headless Chrome this
   run had open would survive us, each one still rendering the scene at full tilt, forever, on
   the exact machine whose wall-clock devtools numbers are the acceptance metric. The preview
   server does not need the same treatment: it is not spawned detached, so an ordinary Ctrl-C
   already reaches it via the terminal's own process-group signal before this handler even runs;
   killing it here too is belt and suspenders, not the fix. */
let previewProcess = null;
function teardownAndExit(signal) {
	if (previewProcess && previewProcess.exitCode === null && previewProcess.signalCode === null) {
		previewProcess.kill();
	}
	chromeLauncher.killAll();
	process.exit(signal === "SIGINT" ? 130 : 143);
}
process.on("SIGINT", () => teardownAndExit("SIGINT"));
process.on("SIGTERM", () => teardownAndExit("SIGTERM"));

/**
 * Runs a command to completion and rejects on a non-zero exit code. Used for the build
 * step, where partial output is worse than no output — a stale `dist/` must never be
 * measured silently. Stdout is optionally captured (and still echoed live) so the build's
 * own chunk-size report can be parsed instead of re-measured by hand. Resolves on `close`,
 * not `exit`: `exit` can fire before the stdio streams have finished delivering their last
 * buffered `data` events, which would mean parsing the build output before all of it exists.
 */
function run(command, args, { captureStdout = false } = {}) {
	return new Promise((resolve, reject) => {
		const child = spawn(command, args, {
			cwd: ROOT,
			stdio: ["inherit", captureStdout ? "pipe" : "inherit", "inherit"],
		});
		let stdout = "";
		if (captureStdout) {
			child.stdout.on("data", (chunk) => {
				stdout += chunk;
				process.stdout.write(chunk);
			});
		}
		child.on("error", reject);
		child.on("close", (code) => {
			if (code === 0) resolve(stdout);
			else reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
		});
	});
}

/**
 * Polls the preview server instead of parsing its stdout — Vite's own startup banner is not
 * a stable contract — but races that polling against the preview child's own `exit` event.
 * Without the race, a `--strictPort` child that dies on EADDRINUSE (because something else
 * already holds the port) would leave `fetch` quietly and successfully talking to whatever
 * that something else is, and this rig would write a summary that looks completely normal
 * while measuring the wrong process entirely.
 *
 * `url` is deliberately not the bare page — it is one specific, content-hashed asset from
 * *this* build (see `main`), because a generic "does anything answer" check cannot tell this
 * build apart from a stale preview serving an older `dist/`: an ordinary page request would
 * get 200 from either. A stale build cannot have this exact filename — Vite hashes it from
 * the content — so only this build's own, truly-ready server can ever return 200 here. That
 * makes this an identity check, not just a liveness check, and it holds regardless of how
 * fast or slow the exit race above resolves on any given machine.
 */
async function waitForServer(url, child, timeoutMs = 30_000) {
	const deadline = Date.now() + timeoutMs;
	let exitInfo = null;
	const onExit = (code, signal) => {
		exitInfo = { code, signal };
	};
	child.once("exit", onExit);
	try {
		while (Date.now() < deadline) {
			if (exitInfo) {
				throw new Error(
					`The preview server process exited (code ${exitInfo.code}, signal ${exitInfo.signal}) before it ` +
						`answered ${url}. This is the classic '--strictPort' + EADDRINUSE failure: something else is ` +
						`already bound to that port. Refusing to keep polling — that would silently measure whatever ` +
						`is already listening there, not this build.`,
				);
			}
			try {
				const response = await fetch(url);
				if (response.ok) return;
			} catch {
				// connection refused while the server is still starting — expected, keep polling
			}
			await new Promise((resolve) => setTimeout(resolve, 300));
		}
		throw new Error(`Timed out waiting for ${url} to respond`);
	} finally {
		child.off("exit", onExit);
	}
}

/**
 * Answers exactly one question — can *we* bind this port right now — by attempting to, then
 * releasing it immediately. This is the same test `--strictPort` is about to make for real, run
 * ahead of time so `main` can refuse cleanly instead of finding out via a dead child.
 *
 * Deliberately not a `ps`-based scan for "vite preview"-looking processes: a scan like that
 * cannot tell a process bound to *this* port from a genuine, unrelated `vite preview` for a
 * *different* project on a *different* port, and a different project's preview is none of this
 * rig's business — aborting a run over it wastes the operator's time for no reason, and a rig
 * that cries wolf gets its check commented out, which is worse than not having it. Binding the
 * exact port answers the exact question, regardless of what, if anything, is holding it, or how
 * its command line happens to read.
 */
function isPortFree(port, host = "127.0.0.1") {
	return new Promise((resolve) => {
		const tester = net.createServer();
		tester.once("error", () => resolve(false));
		tester.once("listening", () => tester.close(() => resolve(true)));
		tester.listen(port, host);
	});
}

function formatScore(category) {
	const score = category.score;
	return score === null ? "n/a" : Math.round(score * 100);
}

function median(values) {
	const sorted = [...values].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/**
 * `values` may contain `null` for a run whose audit failed outright — excluded from the
 * median/spread rather than counted as zero or poisoning it into `NaN`, with the exclusion
 * folded into the text so a partial result never reads like a complete one. The check is
 * `typeof value === "number" && Number.isFinite(value)`, not `!Number.isNaN(value)`:
 * `Number.isNaN(undefined)` is `false`, so a failed audit whose numericValue comes through
 * as `undefined` (as opposed to explicit `null`) would have silently passed the old check
 * and poisoned `Math.min`/`Math.max` into `NaN` while still being counted as "successful".
 */
function summarizeMetric(values, unit = " ms") {
	const successful = values.filter((value) => typeof value === "number" && Number.isFinite(value));
	if (successful.length === 0) return `no successful runs out of ${values.length} — see failure note below`;

	const min = Math.min(...successful);
	const max = Math.max(...successful);
	const fmt = (value) => `${Math.round(value)}${unit}`;
	const base = `median ${fmt(median(successful))}  (range ${fmt(min)}–${fmt(max)}, spread ${fmt(max - min)}, n=${successful.length}/${values.length})`;
	const failedCount = values.length - successful.length;
	return failedCount > 0 ? `${base} — ${failedCount} run(s) failed, see note below` : base;
}

/**
 * Reads the chunk table straight out of `vite build`'s own stdout — the same raw/gzip
 * bytes a developer sees locally — rather than recomputing gzip ourselves, which would
 * drift slightly from Vite's own numbers depending on gzip implementation and settings.
 *
 * The number pattern allows thousands separators (`1,234.56 kB`): Vite formats sizes with
 * `toLocaleString`, so a chunk at or above 1000 kB — exactly the case this number exists to
 * catch — would otherwise fail to match and be silently dropped, undercounting both its
 * size and the chunk count.
 *
 * Every `dist/...` line is required to parse into a finite size, not just the filename: a
 * line that matches the shape but yields a non-finite `rawKb` (wrong capture group, unit
 * Vite stops using, anything) is exactly as much a parse failure as a line that does not
 * match at all, and is refused the same way — a chunk is never allowed to vanish from the
 * total by silently failing to parse.
 */
function parseBuildOutput(buildOutput) {
	const SIZE = /([\d,]+(?:\.\d+)?)\s*kB/;
	const toNumber = (raw) => Number(raw.replace(/,/g, ""));

	const distLines = buildOutput.split("\n").filter((line) => line.trim().startsWith("dist/"));
	const unparsedLines = [];
	const chunks = [];

	for (const line of distLines) {
		const [left, right] = line.split("│");
		const fileMatch = left?.trim().match(new RegExp(`^(\\S+)\\s+${SIZE.source}$`));
		const gzipMatch = right?.trim().match(new RegExp(`gzip:\\s*${SIZE.source}`));
		/* group 1 of fileMatch is the filename, group 2 is the size — gzipMatch has no
		   filename capture, so its size is group 1; conflating the two is how this produced
		   `rawKb = Number("dist/assets/index-....js")` = NaN in every summary before this fix */
		const rawKb = fileMatch ? toNumber(fileMatch[2]) : null;
		if (!fileMatch || !Number.isFinite(rawKb)) {
			unparsedLines.push(line);
			continue;
		}
		chunks.push({ file: fileMatch[1], rawKb, gzipKb: gzipMatch ? toNumber(gzipMatch[1]) : null });
	}

	if (unparsedLines.length > 0) {
		throw new Error(
			`Could not parse ${unparsedLines.length} line(s) of \`vite build\`'s chunk table into a finite size — ` +
				`refusing to write a bundle-size summary that silently dropped them:\n` +
				unparsedLines.map((line) => `  ${line}`).join("\n"),
		);
	}

	const bundle = {
		js: chunks.filter((chunk) => chunk.file.endsWith(".js")),
		css: chunks.filter((chunk) => chunk.file.endsWith(".css")),
	};

	if (bundle.js.length === 0 || bundle.css.length === 0) {
		throw new Error(
			`Could not find the expected JS/CSS chunks in \`vite build\`'s output (found ${bundle.js.length} JS, ` +
				`${bundle.css.length} CSS). Refusing to write a bundle-size summary built on an empty read.`,
		);
	}

	return bundle;
}

function bundleLines(bundle) {
	const lines = ["Bundle (from this build, raw/gzip as reported by `vite build`):"];
	for (const chunk of bundle.js) {
		lines.push(
			`  JS   ${chunk.file}: ${chunk.rawKb.toFixed(2)} kB raw / ${(chunk.gzipKb ?? "n/a").toString()} kB gzip`,
		);
	}
	for (const chunk of bundle.css) {
		lines.push(
			`  CSS  ${chunk.file}: ${chunk.rawKb.toFixed(2)} kB raw / ${(chunk.gzipKb ?? "n/a").toString()} kB gzip`,
		);
	}
	lines.push(`  JS chunk count: ${bundle.js.length}`);
	return lines;
}

/**
 * A snapshot taken before this script starts its own preview server or Chrome, so anything
 * it finds is genuinely pre-existing load on the machine — relevant because devtools
 * throttling times real wall-clock CPU work, and unrelated load moves that number.
 *
 * `otherPreviews` here is informational only — background CPU load context, nothing more. It
 * is not, and must not become again, the basis for refusing to run: a `vite preview` visible
 * in `ps` could belong to a different project on a different port entirely, and `main` refuses
 * on a direct probe of port 4173 instead (see `isPortFree`), which is the one thing that
 * actually matters and cannot be fooled by an unrelated project's own preview server.
 */
function snapshotMachineConditions() {
	let psOutput;
	try {
		psOutput = execSync("ps aux", { encoding: "utf-8" });
	} catch {
		psOutput = ""; // `ps` may not exist on every platform this ever runs on — degrade to "unknown", not a crash
	}
	const lines = psOutput.split("\n").filter(Boolean);
	const otherPreviews = lines.filter((line) => /vite(\.js)?\s+preview/.test(line));
	const interactiveChrome = lines.some(
		(line) => /Google Chrome\.app|google-chrome/.test(line) && !line.includes("Helper"),
	);

	return {
		platform: `${os.platform()} ${os.release()}`,
		cpuCount: os.cpus().length,
		loadAvg1m: os.loadavg()[0],
		otherPreviews,
		interactiveChrome,
	};
}

function machineLines(machine) {
	const lines = [
		"Machine conditions at the start of this run (devtools throttling is wall-clock; unrelated load on",
		"this machine moves the acceptance numbers below, which is exactly why this is recorded):",
		`  Platform: ${machine.platform}, ${machine.cpuCount} CPUs, load average (1m): ${machine.loadAvg1m.toFixed(2)}`,
	];
	if (machine.otherPreviews.length > 0) {
		lines.push(
			`  Other "vite preview"-looking processes visible (informational — may belong to other projects/ports,`,
			`  not necessarily port ${PORT}): ${machine.otherPreviews.length}`,
		);
		for (const line of machine.otherPreviews) lines.push(`    ${line.trim()}`);
	} else {
		lines.push('  Other "vite preview"-looking processes visible: none detected');
	}
	lines.push(`  Interactive (non-headless) Chrome already running: ${machine.interactiveChrome ? "yes" : "no"}`);
	return lines;
}

/**
 * "Which build produced these numbers" is the first question anyone reads a summary weeks
 * later asks, and a timestamp only answers it for as long as someone's shell history lasts.
 */
function gitInfo() {
	let commit;
	try {
		commit = execSync("git rev-parse --short HEAD", { cwd: ROOT, encoding: "utf-8" }).trim();
	} catch {
		commit = "unknown (not a git checkout, or git unavailable)";
	}
	let dirty;
	try {
		dirty = execSync("git status --porcelain", { cwd: ROOT, encoding: "utf-8" }).trim().length > 0;
	} catch {
		dirty = null; // leave unknown rather than assert a clean tree we could not actually confirm
	}
	return { commit, dirty };
}

function gitLine(git) {
	const dirtySuffix = git.dirty === null ? "" : git.dirty ? " (dirty working tree)" : " (clean working tree)";
	return `Git: ${git.commit}${dirtySuffix}`;
}

async function withChrome(fn) {
	const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless=new", "--no-sandbox"] });
	try {
		return await fn(chrome.port);
	} finally {
		chrome.kill();
	}
}

/**
 * Pulls the four acceptance numbers out of one Lighthouse run: Total Blocking Time, the
 * main-thread time `bootup-time` attributes to the app's own JS (summed across every JS
 * entry, not just today's single chunk — this stays correct once code-splitting lands),
 * `bootup-time`'s own headline value (JS parse/compile + execution), and the long-task
 * count/total duration.
 *
 * Under real CPU throttling, an audit can fail outright — most often `bootup-time` and
 * `long-tasks` with `NO_TTI_CPU_IDLE_PERIOD`, because the main thread never reached a quiet
 * period within Lighthouse's wait budget. For a page with a scene that never stops
 * animating, that is not a fluke run to retry past — it is itself a measurement. Each metric
 * below carries its own `*Error`, taken from that specific audit's own `errorMessage`, not a
 * single blanket message borrowed from whichever audit happened to fail: `bootup-time` and
 * `total-blocking-time`/`long-tasks` fail independently, and asserting one's cause for the
 * other would put a confident, occasionally wrong sentence in a summary read by someone who
 * cannot check it.
 *
 * `mainThreadJsMs` depends on `bootup-time`'s own `details`, so a failed `bootup-time` also
 * fails it — captured explicitly as `null`, not summed from an empty list into a silent `0`,
 * which would read as an improvement rather than a missing measurement. That "failed" check is
 * on `details` itself, not only on `errorMessage`: an audit that reports no error but somehow
 * also carries no `details` object has still not told us anything about JS-attributed time, and
 * `bootupAudit.details?.items ?? []` would otherwise treat that silently as a confirmed zero.
 */
function extractAcceptanceMetrics(lhr) {
	const audits = lhr.audits;
	const tbtAudit = audits["total-blocking-time"];
	const longTasksAudit = audits["long-tasks"];
	const bootupAudit = audits["bootup-time"];

	const bootupFailureReason =
		bootupAudit.errorMessage ?? (bootupAudit.details ? null : "bootup-time audit returned no `details`");
	const jsAttributed = bootupFailureReason
		? null
		: (bootupAudit.details.items ?? []).filter((item) => item.url?.endsWith(".js"));
	const longTaskItems = longTasksAudit?.errorMessage ? null : (longTasksAudit?.details?.items ?? null);

	return {
		totalBlockingTimeMs: typeof tbtAudit.numericValue === "number" ? tbtAudit.numericValue : null,
		totalBlockingTimeError: tbtAudit.errorMessage ?? null,
		mainThreadJsMs: jsAttributed ? jsAttributed.reduce((sum, item) => sum + item.total, 0) : null,
		mainThreadJsError: bootupFailureReason,
		bootupScriptingMs: typeof bootupAudit.numericValue === "number" ? bootupAudit.numericValue : null,
		bootupScriptingError: bootupFailureReason,
		longTaskCount: longTaskItems ? longTaskItems.length : null,
		longTaskTotalMs: longTaskItems ? longTaskItems.reduce((sum, item) => sum + item.duration, 0) : null,
		longTaskError: longTasksAudit?.errorMessage ?? null,
	};
}

/** A run that threw entirely (Lighthouse crashed, Chrome died mid-gather, ...) — every metric failed. */
function crashedRunMetrics(message) {
	return {
		totalBlockingTimeMs: null,
		totalBlockingTimeError: message,
		mainThreadJsMs: null,
		mainThreadJsError: message,
		bootupScriptingMs: null,
		bootupScriptingError: message,
		longTaskCount: null,
		longTaskTotalMs: null,
		longTaskError: message,
	};
}

/** Collects every `run N — <label>: <message>` line for one metric's error field, across all runs. */
function collectFailureLines(devtoolsRuns, errorKey, label) {
	return devtoolsRuns
		.map((run, index) => ({ index, error: run.metrics[errorKey] }))
		.filter((run) => run.error)
		.map((run) => `  run ${run.index + 1} — ${label}: ${run.error}`);
}

async function runDesktopReference(timestamp, bundle, machine, git) {
	console.log("Running Lighthouse (desktop profile, simulated throttling, reference only)...");
	const result = await withChrome((port) =>
		lighthouse(
			URL_UNDER_TEST,
			{ logLevel: "error", output: "json", onlyCategories: FOUR_CATEGORIES, port },
			desktopConfig,
		),
	);
	if (!result) throw new Error("Lighthouse produced no result");
	const { lhr } = result;

	const jsonPath = path.join(ARTIFACT_DIR, `lighthouse-desktop-${timestamp}.json`);
	const summaryPath = path.join(ARTIFACT_DIR, `lighthouse-desktop-${timestamp}.summary.txt`);
	await writeFile(jsonPath, result.report, "utf-8");

	const summary = [
		"PROFILE: desktop (Lighthouse's bundled desktop preset, simulated throttling) — reference only.",
		"Stage 4 is NOT accepted against this run. The acceptance metrics are mobile + devtools",
		"throttling — run `npm run lighthouse` with no flag for those. This is a second data point.",
		"",
		`Run: ${timestamp}`,
		`URL: ${URL_UNDER_TEST}`,
		`Lighthouse: ${lhr.lighthouseVersion}`,
		gitLine(git),
		"",
		...bundleLines(bundle),
		"",
		...machineLines(machine),
		"",
		"Scores (0-100):",
		`  Performance:     ${formatScore(lhr.categories.performance)}`,
		`  Accessibility:   ${formatScore(lhr.categories.accessibility)}`,
		`  Best Practices:  ${formatScore(lhr.categories["best-practices"])}`,
		`  SEO:             ${formatScore(lhr.categories.seo)}`,
		"",
		`Full report: ${path.basename(jsonPath)}`,
	].join("\n");

	await writeFile(summaryPath, summary, "utf-8");
	console.log(`\n${summary}\n`);
}

async function runMobileAcceptanceAndGuard(timestamp, bundle, machine, git) {
	console.log("Running Lighthouse (mobile, simulated throttling) — regression guard...");
	const guardResult = await withChrome((port) =>
		lighthouse(
			URL_UNDER_TEST,
			{ logLevel: "error", output: "json", onlyCategories: FOUR_CATEGORIES, port },
			defaultConfig,
		),
	);
	if (!guardResult) throw new Error("Lighthouse produced no result (regression guard)");
	const guardLhr = guardResult.lhr;
	const guardJsonPath = path.join(ARTIFACT_DIR, `lighthouse-mobile-simulate-${timestamp}.json`);
	await writeFile(guardJsonPath, guardResult.report, "utf-8");

	console.log(`Running Lighthouse (mobile, devtools throttling) — acceptance metrics, ${DEVTOOLS_RUNS} runs...`);
	const devtoolsRuns = [];
	for (let i = 1; i <= DEVTOOLS_RUNS; i += 1) {
		console.log(`  run ${i}/${DEVTOOLS_RUNS}...`);
		/* one run throwing (Chrome dying mid-gather, Lighthouse itself crashing) must not throw
		   away the runs already collected — the median machinery already tolerates a reduced
		   sample, so a crash is recorded as one more failed run, not a lost summary */
		try {
			const result = await withChrome((port) =>
				lighthouse(
					URL_UNDER_TEST,
					{ logLevel: "error", output: "json", onlyCategories: ["performance"], port, throttlingMethod: "devtools" },
					defaultConfig,
				),
			);
			if (!result) throw new Error("Lighthouse produced no result");
			const jsonPath = path.join(ARTIFACT_DIR, `lighthouse-mobile-devtools-run${i}-${timestamp}.json`);
			await writeFile(jsonPath, result.report, "utf-8");
			devtoolsRuns.push({
				metrics: extractAcceptanceMetrics(result.lhr),
				jsonPath,
				performanceScore: formatScore(result.lhr.categories.performance),
			});
		} catch (error) {
			console.error(`  run ${i}/${DEVTOOLS_RUNS} threw: ${error.message}`);
			devtoolsRuns.push({ metrics: crashedRunMetrics(error.message), jsonPath: null, performanceScore: "n/a" });
		}
	}

	const tbtValues = devtoolsRuns.map((r) => r.metrics.totalBlockingTimeMs);
	const mainThreadJsValues = devtoolsRuns.map((r) => r.metrics.mainThreadJsMs);
	const bootupValues = devtoolsRuns.map((r) => r.metrics.bootupScriptingMs);
	const longTaskCountValues = devtoolsRuns.map((r) => r.metrics.longTaskCount);
	const longTaskTotalValues = devtoolsRuns.map((r) => r.metrics.longTaskTotalMs);

	/* each line names the specific run, the specific metric, and quotes that metric's own
	   errorMessage — never a cause asserted across a metric that did not actually fail */
	const failureLines = [
		...collectFailureLines(devtoolsRuns, "totalBlockingTimeError", "Total Blocking Time"),
		...collectFailureLines(devtoolsRuns, "mainThreadJsError", "main-thread time attributed to JS"),
		...collectFailureLines(devtoolsRuns, "bootupScriptingError", "bootup-time"),
		...collectFailureLines(devtoolsRuns, "longTaskError", "long tasks"),
	];

	const summaryPath = path.join(ARTIFACT_DIR, `lighthouse-mobile-${timestamp}.summary.txt`);
	const summary = [
		"PROFILE: mobile — acceptance metrics (devtools throttling, median of 3 runs) + regression guard",
		"(simulated throttling, category scores).",
		"",
		"A note for anyone tempted to 'fix' this rig later: the same build scores far higher under",
		"simulated throttling than under devtools throttling below. That is not a bug in either run.",
		"Simulated throttling estimates cost mainly from the network waterfall and lightly scales observed",
		"script time — a poor model for an app whose cost is a permanently-running animation loop rather",
		"than page load. Devtools throttling actually slows the CPU down live during capture, so it is the",
		"one that sees the sustained cost. Both are correct measurements of different things; only the",
		"devtools numbers below are what stage 4 is accepted against.",
		"",
		`Run: ${timestamp}`,
		`URL: ${URL_UNDER_TEST}`,
		`Lighthouse: ${guardLhr.lighthouseVersion}`,
		gitLine(git),
		"",
		...bundleLines(bundle),
		"",
		...machineLines(machine),
		"",
		"=== ACCEPTANCE METRICS — mobile, devtools throttling (real CPU throttling, not estimated) ===",
		`These are the numbers stage 4 is judged against (${DEVTOOLS_RUNS} runs; median with best-worst spread):`,
		`  Total Blocking Time:                 ${summarizeMetric(tbtValues)}`,
		`  Main-thread time attributed to JS:   ${summarizeMetric(mainThreadJsValues)}`,
		`  bootup-time (JS parse/compile+exec): ${summarizeMetric(bootupValues)}`,
		`  Long tasks — count:                  ${summarizeMetric(longTaskCountValues, "")}`,
		`  Long tasks — total duration:         ${summarizeMetric(longTaskTotalValues)}`,
		`  Per-run Performance score (informational only): ${devtoolsRuns.map((r) => r.performanceScore).join(", ")}`,
		`  Full reports: ${devtoolsRuns.map((r, i) => (r.jsonPath ? path.basename(r.jsonPath) : `run ${i + 1}: none (run threw)`)).join(", ")}`,
		...(failureLines.length > 0
			? [
					"",
					`NOTE — ${failureLines.length} metric/run combination(s) below did not produce a result (excluded from`,
					"the median/range above, not counted as zero and not averaged in). Each line is that specific audit's",
					"own message for that specific run, not a cause assumed from a different metric's failure:",
					...failureLines,
					"See that run's full JSON report for complete audit detail.",
				]
			: []),
		"",
		"=== REGRESSION GUARD — mobile, simulated throttling (category scores) ===",
		"Not the acceptance metric. Its job is to catch a regression in Accessibility / Best Practices /",
		"SEO while stage 4 optimises Performance. Performance is recorded too, but only as information —",
		"simulated throttling hides the cost this stage is about; see the note above.",
		`  Performance (informational only): ${formatScore(guardLhr.categories.performance)}`,
		`  Accessibility:                    ${formatScore(guardLhr.categories.accessibility)}`,
		`  Best Practices:                   ${formatScore(guardLhr.categories["best-practices"])}`,
		`  SEO:                              ${formatScore(guardLhr.categories.seo)}`,
		`  Full report: ${path.basename(guardJsonPath)}`,
	].join("\n");

	await writeFile(summaryPath, summary, "utf-8");
	console.log(`\n${summary}\n`);
}

async function main() {
	await mkdir(ARTIFACT_DIR, { recursive: true });

	/* taken first, before this script's own preview server or Chrome exist, so it only ever
	   reports load this script did not itself cause */
	const machine = snapshotMachineConditions();
	const git = gitInfo();

	/* refuse rather than risk measuring someone else's build — but on a direct probe of the
	   exact port we are about to use, not a process-name scan. A scan matches any "vite preview"
	   anywhere, including a genuine one for a different project on a different port, which is
	   none of this rig's business; probing port 4173 itself answers only the question that
	   actually matters, and cannot produce that false alarm. */
	const portFree = await isPortFree(PORT);
	if (!portFree) {
		throw new Error(
			`Refusing to run: port ${PORT} is already in use. This rig always measures that exact port; starting ` +
				"our own '--strictPort' preview server against it would either fail immediately or, worse, leave " +
				`whatever is already there silently under test instead of this build. Free port ${PORT} first, then ` +
				"re-run.",
		);
	}

	console.log("Building production bundle...");
	const buildOutput = await run("npm", ["run", "build"], { captureStdout: true });
	const bundle = parseBuildOutput(buildOutput);

	/* the build's own content-hashed JS entry, requested through the preview base path — see
	   `waitForServer`'s comment for why this, and not the bare page, is what proves the server
	   answering is truly this build and not a stale leftover. Computed before the preview server
	   is spawned, deliberately: nothing between the spawn and the `try` that owns its cleanup
	   should be able to throw, or a failure there would exit with the preview running and no
	   `finally` ever entered to stop it — a property of the structure, not of what these
	   particular lines happen to contain today. */
	const buildFingerprintUrl = `${URL_UNDER_TEST}${bundle.js[0].file.replace(/^dist\//, "")}`;

	console.log("Starting preview server...");
	/* invoking vite's own entry point through node, not the npm script — an `npm run preview`
	   child is a shell wrapping a second process, and killing the shell does not reliably
	   kill vite underneath it, which is exactly the stray-process failure mode this must avoid */
	const preview = spawn(
		process.execPath,
		[path.join(ROOT, "node_modules", "vite", "bin", "vite.js"), "preview", "--port", String(PORT), "--strictPort"],
		{
			cwd: ROOT,
			stdio: "pipe",
		},
	);
	previewProcess = preview; // reachable from the SIGINT/SIGTERM handlers registered at module load
	let previewOutput = "";
	preview.stdout.on("data", (chunk) => {
		previewOutput += chunk;
	});
	preview.stderr.on("data", (chunk) => {
		previewOutput += chunk;
	});

	try {
		await waitForServer(buildFingerprintUrl, preview);

		const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
		if (useDesktop) {
			await runDesktopReference(timestamp, bundle, machine, git);
		} else {
			await runMobileAcceptanceAndGuard(timestamp, bundle, machine, git);
		}
	} finally {
		/* SIGTERM and wait for the actual exit — but only if it has not already happened.
		   `waitForServer` throwing on the child's own `exit` event (the EADDRINUSE case above)
		   means the child is already gone by the time we get here; `.once("exit", ...)` after
		   the event has already fired never fires again, so awaiting it unconditionally hangs
		   this promise, and the whole run, forever. */
		if (preview.exitCode === null && preview.signalCode === null) {
			await new Promise((resolve) => {
				preview.once("exit", resolve);
				preview.kill();
			});
		}
		if (preview.exitCode !== 0 && preview.exitCode !== null) {
			console.error(previewOutput);
		}
	}
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
