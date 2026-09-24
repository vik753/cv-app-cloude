/*
 * Drives a real browser against the production build and asserts the geometry of the
 * printed page. Printing is the export (see CLAUDE.md), and nothing in the Vitest suite
 * can see it: jsdom does not implement `@media print` layout at all, so a regression
 * under `@media print` is invisible to `npm run test` no matter how good the coverage
 * number looks. This script is that missing check.
 *
 * Modelled on `scripts/performance-audit.mjs`: builds first, serves the production
 * build through `vite preview` on the real `/cv-app-cloude/` base path (never `dev`,
 * which does not apply that base path), refuses to start when port 4173 is already
 * taken so it cannot silently measure someone else's server, and tears down both the
 * server and the browser on every exit path including signals.
 *
 * What "printed" means here: Chrome relays out the page at the physical page's CSS
 * pixel width when it prints — this is the same trick anyone testing print CSS by hand
 * uses (resize devtools to the page width, flip on print-media emulation) and it is how
 * the two shipped bugs were originally diagnosed, in CSS pixels (794px / 816px), not in
 * millimetres or inches. So the check sets the viewport to the target page width, turns
 * on print media emulation, and measures real `getBoundingClientRect()` geometry — no
 * PDF is generated, because the geometry question and the file-format question are
 * different questions and only the first one is what shipped broken.
 *
 * Fault injection (`--fault=`) exists to prove this check can actually fail. It adds a
 * `<style>` tag at runtime, in the browser, after the real build has loaded — it never
 * touches `print.css` on disk, which is `ui-styles`' file and is currently correct.
 * Each injected rule is written to be exactly as specific as (or more specific than)
 * the real fix it is temporarily cancelling, so the failure it causes is the original
 * bug, not some new artificial one.
 */

import { spawn } from "node:child_process";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as chromeLauncher from "chrome-launcher";
import puppeteer from "puppeteer-core";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const PORT = 4173; // vite preview's own default; pinned (with --strictPort) so the URL below is never a guess
const BASE_PATH = "/cv-app-cloude/"; // must match vite.config.ts `base` — nothing is served at "/"
const URL_UNDER_TEST = `http://localhost:${PORT}${BASE_PATH}`;

/* The printable areas to fit, in CSS pixels at 96dpi. The first two are whole sheets —
   what a browser gives when it honours `@page { margin: 0 }`, as desktop Chrome does.
   The last two are the same A4 sheet with the margins a browser imposes when it ignores
   that rule, which mobile browsers routinely do: the only cases where the check can see
   a sheet sized to the physical page overflow the area it is actually given. Testing
   whole sheets alone is how a clipped, two-page mobile export got past this check. */
const PAGE_AREAS = [
	{ label: "A4", widthPx: 794, heightPx: 1123 },
	{ label: "Letter", widthPx: 816, heightPx: 1056 },
	{ label: "A4, 10mm margins", widthPx: 718, heightPx: 1047 },
	{ label: "A4, 0.5in margins", widthPx: 698, heightPx: 1027 },
];

/* One pixel, per the task's own tolerance ("within a pixel"). Kept as a named constant
   so every comparison below reads the same way it is specified. */
const PIXEL_TOLERANCE = 1;

/* Reproduces bug 2 exactly: the stage's on-screen side padding (`panels.css`,
   `.paper-stage { padding: 8px 40px 24px }`) surviving into print instead of being
   zeroed, which narrows the sheet's containing block below the physical page width.
   Same selector, same specificity (one class) and `!important` as the real
   `print.css` rule it cancels — a style tag added via `page.addStyleTag` lands after
   the build's own stylesheet in the DOM, so on an equal-specificity tie this is the
   declaration that wins, exactly as the pre-fix cascade would have. */
const FAULT_STAGE_PADDING = `
	@media print {
		.paper-stage { padding: 8px 40px 24px !important; }
	}
`;

/* Reproduces bug 1: the fade that hides the preview on screen never being cancelled
   under print, so printing while the preview is toggled off exports blank pages. Scoped
   to `.app-body.preview-hidden .print-preview` — three classes' worth of specificity,
   deliberately higher than the real fix's plain `.print-preview` — so it wins outright
   regardless of injection order, and, just as importantly, only when the preview is
   actually toggled off. The "preview on" combinations must keep passing even with this
   fault injected; if they did not, this fault would be testing something broader than
   the real bug. */
const FAULT_PREVIEW_OPACITY = `
	@media print {
		.app-body.preview-hidden .print-preview { opacity: 0 !important; visibility: hidden !important; }
	}
`;

const FAULTS = {
	"stage-padding": FAULT_STAGE_PADDING,
	"preview-opacity": FAULT_PREVIEW_OPACITY,
};

const faultArg = process.argv.find((arg) => arg.startsWith("--fault="));
const faultName = faultArg ? faultArg.slice("--fault=".length) : null;
if (faultName && !(faultName in FAULTS)) {
	throw new Error(`Unknown --fault=${faultName}. Known faults: ${Object.keys(FAULTS).join(", ")}, or omit the flag.`);
}
const faultCss = faultName ? FAULTS[faultName] : null;
const skipBuild = process.argv.includes("--skip-build");

/* Same shutdown reasoning as performance-audit.mjs: registered at module load so this
   listener runs before chrome-launcher installs its own, and it calls
   `chromeLauncher.killAll()` itself rather than trusting chrome-launcher's own signal
   handler to get a turn after `process.exit()` — which ends the process immediately, so
   a listener registered after the one that calls it never runs. Without this, a Ctrl-C
   mid-run would leave a detached headless Chrome running forever. */
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

function run(command, args) {
	return new Promise((resolve, reject) => {
		const child = spawn(command, args, { cwd: ROOT, stdio: "inherit" });
		child.on("error", reject);
		child.on("close", (code) => {
			if (code === 0) resolve();
			else reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
		});
	});
}

/** Same reasoning as performance-audit.mjs's `isPortFree`: a direct probe of the exact
 * port this run is about to use, not a process-name scan — a scan would flag an
 * unrelated project's own `vite preview` on a different port, which is none of this
 * rig's business. */
function isPortFree(port, host = "127.0.0.1") {
	return new Promise((resolve) => {
		const tester = net.createServer();
		tester.once("error", () => resolve(false));
		tester.once("listening", () => tester.close(() => resolve(true)));
		tester.listen(port, host);
	});
}

/** Same reasoning as performance-audit.mjs's `waitForServer`: polls a specific,
 * content-hashed asset from this build rather than the bare page, and races that
 * polling against the preview child's own `exit` event, so a `--strictPort` failure
 * (something else already on the port) is reported honestly instead of quietly
 * measuring whatever else is listening there. */
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
						`answered ${url}. Something else is already bound to port ${PORT}. Refusing to keep polling.`,
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
 * Measures one combination: a page width standing in for the physical print page, and
 * the preview toggled on or off exactly as a visitor would leave it. Returns raw numbers
 * plus the three pass/fail judgements — the caller decides what to do with a failure,
 * this function's job is only to measure honestly.
 *
 * `.print-preview`'s `innerText` (never `textContent`) is the blank-page signal: unlike
 * `textContent`, `innerText` is computed from the actual render tree and comes back
 * empty for anything `visibility: hidden` or `display: none` — which is exactly the
 * mechanism bug 1 exploited, so a real render-visibility regression is what this must
 * catch, not merely "the markup is still in the DOM somewhere".
 */
async function measureCombination(browser, { widthPx, heightPx, previewOn, faultCss }) {
	const page = await browser.newPage();
	try {
		/* runs before the build's own scripts on every navigation this page makes,
		   including the very first — this is what lets a fresh page land straight in
		   the form, the same shortcut a returning visitor with a saved draft gets, per
		   App.tsx's readInitialView(). */
		await page.evaluateOnNewDocument(() => {
			localStorage.setItem("resume-canvas-scene", "off");
		});
		/* a normal desktop width for the interactive part (finding and clicking the
		   preview toggle) — the print-page width is applied afterwards, only for the
		   measurement itself, matching how Chrome's own print layout is a distinct pass
		   from the on-screen layout rather than a resize of the visible window */
		await page.setViewport({ width: 1280, height: 900 });
		await page.goto(URL_UNDER_TEST, { waitUntil: "load" });
		await page.waitForSelector(".print-paper");

		if (previewOn) {
			await page.click(".preview-toggle");
		}
		/* These two callbacks run inside the page, not in this Node process — `document`,
		   `getComputedStyle` and `window` would all be genuine globals there, but ESLint
		   lints this file with the Node globals (see the plain-scripts block in
		   eslint.config.js) and has no way to know that a `page.evaluate` callback's
		   scope is the browser's. Going through `globalThis` (a real global in both
		   environments, and the same object as `window` inside the page) says exactly
		   that without reaching for a disable directive on a file outside this task. */
		await page.waitForFunction(
			(wantOn) => {
				const body = globalThis.document.querySelector(".app-body");
				return body ? body.classList.contains("preview-hidden") !== wantOn : false;
			},
			{},
			previewOn,
		);

		if (faultCss) {
			await page.addStyleTag({ content: faultCss });
		}

		await page.setViewport({ width: widthPx, height: heightPx });
		await page.emulateMediaType("print");

		const measured = await page.evaluate(() => {
			const paper = globalThis.document.querySelector(".print-paper");
			const preview = globalThis.document.querySelector(".print-preview");
			if (!paper || !preview) return null;
			const rect = paper.getBoundingClientRect();
			const style = globalThis.getComputedStyle(preview);
			return {
				left: rect.left,
				right: rect.right,
				width: rect.width,
				bottom: rect.bottom,
				innerWidth: globalThis.innerWidth,
				innerHeight: globalThis.innerHeight,
				previewOpacity: style.opacity,
				previewVisibility: style.visibility,
				renderedTextLength: preview.innerText.trim().length,
			};
		});

		if (!measured) {
			throw new Error(".print-paper or .print-preview was not found in the DOM under print media emulation");
		}

		const overflowLeft = Math.max(0, -measured.left);
		const overflowRight = Math.max(0, measured.right - measured.innerWidth);
		/* past the bottom of the area is a second page, however little is on it */
		const overflowBottom = Math.max(0, measured.bottom - measured.innerHeight);
		const leftInset = measured.left;
		const rightInset = measured.innerWidth - measured.right;
		const insetDiff = Math.abs(leftInset - rightInset);

		return {
			widthPx,
			heightPx,
			previewOn,
			...measured,
			overflowLeft,
			overflowRight,
			overflowBottom,
			leftInset,
			rightInset,
			insetDiff,
			fitsPage:
				overflowLeft <= PIXEL_TOLERANCE && overflowRight <= PIXEL_TOLERANCE && overflowBottom <= PIXEL_TOLERANCE,
			insetsEqual: insetDiff <= PIXEL_TOLERANCE,
			notBlank: measured.renderedTextLength > 0,
		};
	} finally {
		await page.close();
	}
}

function formatResult(pageLabel, result) {
	const status = result.fitsPage && result.insetsEqual && result.notBlank ? "PASS" : "FAIL";
	const lines = [
		`[${status}] page=${pageLabel} (${result.widthPx}x${result.heightPx}px) preview=${result.previewOn ? "on" : "off"}`,
		`  paper: left=${result.leftInset.toFixed(1)} right=${result.rightInset.toFixed(1)} width=${result.width.toFixed(1)} ` +
			`page-width=${result.widthPx} overflow-left=${result.overflowLeft.toFixed(1)} overflow-right=${result.overflowRight.toFixed(1)} ` +
			`overflow-bottom=${result.overflowBottom.toFixed(1)} inset-diff=${result.insetDiff.toFixed(1)}`,
		`  content: rendered-text-length=${result.renderedTextLength} preview-opacity=${result.previewOpacity} preview-visibility=${result.previewVisibility}`,
	];
	if (!result.fitsPage) {
		lines.push(
			`  FAIL reason: sheet overflows the page (overflow-left=${result.overflowLeft.toFixed(1)}px, ` +
				`overflow-right=${result.overflowRight.toFixed(1)}px, overflow-bottom=${result.overflowBottom.toFixed(1)}px, ` +
				`tolerance=${PIXEL_TOLERANCE}px)`,
		);
	}
	if (!result.insetsEqual) {
		lines.push(
			`  FAIL reason: left/right insets are not equal (left=${result.leftInset.toFixed(1)}px, ` +
				`right=${result.rightInset.toFixed(1)}px, diff=${result.insetDiff.toFixed(1)}px, tolerance=${PIXEL_TOLERANCE}px)`,
		);
	}
	if (!result.notBlank) {
		lines.push(
			`  FAIL reason: .print-preview rendered no visible text (opacity=${result.previewOpacity}, ` +
				`visibility=${result.previewVisibility}) — this is what a blank export looks like`,
		);
	}
	return lines.join("\n");
}

async function main() {
	const portFree = await isPortFree(PORT);
	if (!portFree) {
		throw new Error(
			`Refusing to run: port ${PORT} is already in use. This rig always measures that exact port; starting ` +
				"our own '--strictPort' preview server against it would either fail immediately or, worse, leave " +
				`whatever is already there silently under test instead of this build. Free port ${PORT} first, then re-run.`,
		);
	}

	if (skipBuild) {
		console.log("Skipping build (--skip-build) — measuring whatever is already in dist/.");
	} else {
		console.log("Building production bundle...");
		await run("npm", ["run", "build"]);
	}

	console.log("Starting preview server...");
	const preview = spawn(
		process.execPath,
		[path.join(ROOT, "node_modules", "vite", "bin", "vite.js"), "preview", "--port", String(PORT), "--strictPort"],
		{ cwd: ROOT, stdio: "pipe" },
	);
	previewProcess = preview;
	let previewOutput = "";
	preview.stdout.on("data", (chunk) => {
		previewOutput += chunk;
	});
	preview.stderr.on("data", (chunk) => {
		previewOutput += chunk;
	});

	let chrome = null;
	try {
		await waitForServer(URL_UNDER_TEST, preview);

		console.log("Launching Chrome...");
		chrome = await chromeLauncher.launch({ chromeFlags: ["--headless=new", "--no-sandbox"] });
		const browser = await puppeteer.connect({ browserURL: `http://localhost:${chrome.port}` });

		console.log(
			faultName
				? `Running with fault injected: --fault=${faultName} (this run is EXPECTED to fail)`
				: "Running against the real build, no fault injected.",
		);

		const results = [];
		for (const { label, widthPx, heightPx } of PAGE_AREAS) {
			for (const previewOn of [false, true]) {
				const result = await measureCombination(browser, { widthPx, heightPx, previewOn, faultCss });
				results.push({ label, result });
			}
		}

		await browser.disconnect();

		console.log("");
		for (const { label, result } of results) {
			console.log(formatResult(label, result));
			console.log("");
		}

		const failures = results.filter(({ result }) => !(result.fitsPage && result.insetsEqual && result.notBlank));
		if (failures.length > 0) {
			console.error(`PRINT CHECK FAILED: ${failures.length}/${results.length} combination(s) failed. See above.`);
			process.exitCode = 1;
		} else {
			console.log(`PRINT CHECK PASSED: ${results.length}/${results.length} combination(s) passed.`);
		}
	} finally {
		if (chrome) chrome.kill();
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
