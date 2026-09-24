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
 * millimetres or inches. So the single-page checks set the viewport to the target page
 * width, turn on print media emulation, and measure real `getBoundingClientRect()`
 * geometry — no PDF is generated for those, because the geometry question and the
 * file-format question are different questions and only the first one is what shipped
 * broken.
 *
 * The multi-page check is the exception: it renders an actual PDF through `page.pdf()`
 * and reads it back with `pdfjs-dist`, because the bug it guards — page 2 of a long
 * résumé starting flush at the physical top edge instead of the sheet's own 16mm
 * padding — only exists once a `.print-paper` box is genuinely fragmented by a real
 * pagination engine. `getBoundingClientRect()` on a single continuous DOM box cannot
 * see where Chrome chooses to cut it; only the produced document can (see commit
 * ef2f510, which introduced `box-decoration-break: clone` for exactly this).
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
/* the legacy build is the one meant to run outside a browser tab — plain Node here,
   same as this whole script — and it works against a freshly-generated buffer without
   any extra worker setup, verified by hand before wiring it in below */
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

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

/* A résumé long enough to force a page break under the sheet's own layout: five
   experience entries, each with a four-line description (`whitespace-pre-line` turns
   each `\n` into a forced break regardless of column width — see ResumePreview.tsx —
   so this reliably wraps to four lines without depending on font metrics), plus the
   skills/languages/education/certificates blocks that print on every draft. Shape
   taken from `src/entities/resume/model/initialResume.ts` / `resumeSchema.ts`. */
const LONG_DRAFT_RESUME = {
	name: "Taras Print-Audit Shevchenko",
	role: "Principal Something Engineer",
	email: "taras@example.com",
	phone: "+380 00 000 0000",
	location: "Kyiv, Ukraine",
	website: "https://example.com",
	github: "https://github.com/example",
	linkedin: "https://linkedin.com/in/example",
	summary:
		"A long-serving generator of realistic filler text, kept on staff for exactly one purpose: making sure a résumé this size actually breaks across pages the way a real one eventually will.",
	skills: ["javascript", "typescript", "react", "html", "css"],
	languages: [
		{ id: 1, language: "Ukrainian", level: "Native" },
		{ id: 2, language: "English", level: "C1" },
	],
	experience: Array.from({ length: 5 }, (_, index) => ({
		id: index + 1,
		company: `Filler Industries Vol. ${index + 1}`,
		role: `Senior Paragraph Wrangler ${index + 1}`,
		period: `20${18 + index}–20${19 + index}`,
		description: [
			"Shipped a steady stream of plausible-sounding responsibilities, none of which survive a fact check.",
			"Coordinated cross-functional filler with stakeholders who exist only for this fixture.",
			"Reduced page-break bugs by a number nobody asked for and this script cannot verify either.",
			"Mentored junior filler, some of which went on to describe entirely different fake jobs.",
		].join("\n"),
	})),
	education:
		"Bachelor of Filler Studies, University of Lorem, 2014–2018\nMaster of Applied Placeholder Text, 2018–2020",
	certificates: "Certified Page-Break Auditor\nAdvanced Whitespace-Pre-Line Practitioner",
	photo: "",
};

/* Same shape App.tsx's Zustand `persist` middleware writes for real — see the
   `resume-canvas-draft-v2` contract in CLAUDE.md. Only `resume` needs seeding: the
   store reads `palette`/`mode` with their own fallbacks when a persisted draft omits
   them. */
const LONG_DRAFT_STORAGE_VALUE = JSON.stringify({ state: { resume: LONG_DRAFT_RESUME }, version: 0 });

/* Exact conversion given in the task. Kept as a named constant rather than inlined so
   every mm<->pt conversion below reads the same way it is specified. */
const PT_PER_MM = 2.835;

/* The sheet's own padding is 16mm top and bottom (`print.css`, `.print-paper { padding:
   16mm }`). The threshold is deliberately short of that, not equal to it: the measured
   clearance below is taken from each text item's glyph box (baseline plus/minus that
   item's own font ascent/descent, read from the PDF's embedded font metrics — see
   `topOfItem`/`bottomOfItem` in `measureMultiPage`), which is an honest measurement, not
   a device metric with its own rounding error. 2mm of slack absorbs that rounding plus
   the ordinary variance between fonts' ascent/descent ratios, while staying far short of
   the ~16mm gap the real fix produces and the ~0mm gap the bug produces — nothing near
   this boundary is the difference between clone and slice. */
const MIN_PAGE_CLEARANCE_MM = 14;

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

/* Reproduces the bug fixed in ef2f510: `box-decoration-break` reverting to its default
   (`slice`) so a `.print-paper` box that spans two physical pages is sliced at the cut
   instead of cloned — page 1 loses its bottom 16mm of padding and page 2 starts flush
   against the top edge. `slice` is the initial value of the property, so setting it
   `!important` here is not a weaker echo of the real rule, it is the literal bug: the
   fix is the only thing between this value and shipping it again. Same selector and
   specificity as the real declaration in print.css, for the same injection-order
   reasoning as the two faults above. */
const FAULT_PAGE_BREAK_PADDING = `
	@media print {
		.print-paper {
			box-decoration-break: slice !important;
			-webkit-box-decoration-break: slice !important;
		}
	}
`;

const FAULTS = {
	"stage-padding": FAULT_STAGE_PADDING,
	"preview-opacity": FAULT_PREVIEW_OPACITY,
	"page-break-padding": FAULT_PAGE_BREAK_PADDING,
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
 * empty for `visibility: hidden` descendants — which is exactly the mechanism bug 1
 * exploited. It is not a guard against `display: none` on the preview itself: for an
 * element that is not rendered at all, `innerText` falls back to `textContent` and
 * returns the text anyway. That case is caught by the geometry instead: an unrendered
 * sheet measures as a zero-size box at the left edge, so its insets cannot be equal.
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

/**
 * Renders the long draft to an actual PDF and reads it back with `pdfjs-dist`, page by
 * page, to check that every page — not just the first — keeps the sheet's own 16mm
 * padding at its top and bottom edge. Unlike `measureCombination`, this drives Chrome's
 * real pagination engine (`page.pdf`) rather than emulated print media on a single
 * viewport, because the bug this guards only exists once the browser has actually cut
 * `.print-paper` into more than one page.
 */
async function measureMultiPage(browser, { faultCss }) {
	const page = await browser.newPage();
	try {
		await page.evaluateOnNewDocument((draftJson) => {
			globalThis.localStorage.setItem("resume-canvas-scene", "off");
			globalThis.localStorage.setItem("resume-canvas-draft-v2", draftJson);
		}, LONG_DRAFT_STORAGE_VALUE);

		await page.setViewport({ width: 1280, height: 900 });
		await page.goto(URL_UNDER_TEST, { waitUntil: "load" });
		await page.waitForSelector(".print-paper");

		if (faultCss) {
			await page.addStyleTag({ content: faultCss });
		}

		await page.emulateMediaType("print");
		const pdfBuffer = await page.pdf({ format: "a4", printBackground: true, preferCSSPageSize: true });

		const pdf = await getDocument({ data: new Uint8Array(pdfBuffer) }).promise;
		const pages = [];
		for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
			const pdfPage = await pdf.getPage(pageNumber);
			const pageHeightPt = pdfPage.getViewport({ scale: 1 }).height;
			const textContent = await pdfPage.getTextContent();

			/* `transform[5]` is the glyph's baseline in PDF space, which is bottom-left
			   origin with y increasing upward. A glyph's visible box extends above the
			   baseline by its font's ascent and below it by its (negative) descent, both
			   given as fractions of the item's own height in `textContent.styles`, keyed
			   by `fontName` — this is the same metric pdfjs's own text layer uses to
			   position its spans, not a guess. Whitespace-only items report `height: 0`
			   and would otherwise pull the min/max toward the page edge for nothing. */
			let topOfContentPt = null;
			let bottomOfContentPt = null;
			for (const item of textContent.items) {
				if (!("str" in item) || item.str.trim() === "") continue;
				/* Several of this build's fonts report `ascent`/`descent` as the number
				   `NaN` rather than omitting the field — `??` only catches `null`/
				   `undefined`, so a plain fallback silently produces `NaN` clearances
				   for exactly those fonts. `Number.isFinite` catches both cases. */
				const style = textContent.styles[item.fontName];
				const ascent = Number.isFinite(style?.ascent) ? style.ascent : 0.75; // conventional default
				const descent = Number.isFinite(style?.descent) ? style.descent : -0.25;
				const topOfItem = item.transform[5] + ascent * item.height;
				const bottomOfItem = item.transform[5] + descent * item.height;
				topOfContentPt = topOfContentPt === null ? topOfItem : Math.max(topOfContentPt, topOfItem);
				bottomOfContentPt = bottomOfContentPt === null ? bottomOfItem : Math.min(bottomOfContentPt, bottomOfItem);
			}

			if (topOfContentPt === null || bottomOfContentPt === null) {
				throw new Error(`Page ${pageNumber} of the multi-page PDF rendered no visible text.`);
			}

			const topClearanceMm = (pageHeightPt - topOfContentPt) / PT_PER_MM;
			const bottomClearanceMm = bottomOfContentPt / PT_PER_MM;
			pages.push({
				pageNumber,
				topClearanceMm,
				bottomClearanceMm,
				topOk: topClearanceMm >= MIN_PAGE_CLEARANCE_MM,
				bottomOk: bottomClearanceMm >= MIN_PAGE_CLEARANCE_MM,
			});
		}

		return {
			numPages: pdf.numPages,
			pages,
			hasEnoughPages: pdf.numPages >= 2,
			pass: pdf.numPages >= 2 && pages.every((entry) => entry.topOk && entry.bottomOk),
		};
	} finally {
		await page.close();
	}
}

function formatMultiPageResult(result) {
	const status = result.pass ? "PASS" : "FAIL";
	const lines = [`[${status}] multi-page long draft, rendered as an A4 PDF (${result.numPages} page(s))`];
	if (!result.hasEnoughPages) {
		lines.push(
			`  FAIL reason: draft rendered as only ${result.numPages} page(s) — the long draft is expected to force ` +
				"at least 2, or this check is not exercising the page-break behaviour it exists to guard",
		);
	}
	for (const entry of result.pages) {
		const pageStatus = entry.topOk && entry.bottomOk ? "ok" : "FAIL";
		lines.push(
			`  page ${entry.pageNumber}: [${pageStatus}] top-clearance=${entry.topClearanceMm.toFixed(1)}mm ` +
				`bottom-clearance=${entry.bottomClearanceMm.toFixed(1)}mm (minimum ${MIN_PAGE_CLEARANCE_MM}mm)`,
		);
		if (!entry.topOk) {
			lines.push(
				`    FAIL reason: top clearance ${entry.topClearanceMm.toFixed(1)}mm is below the ${MIN_PAGE_CLEARANCE_MM}mm ` +
					"minimum — the sheet's own padding is missing at the top of this page",
			);
		}
		if (!entry.bottomOk) {
			lines.push(
				`    FAIL reason: bottom clearance ${entry.bottomClearanceMm.toFixed(1)}mm is below the ` +
					`${MIN_PAGE_CLEARANCE_MM}mm minimum — the sheet's own padding is missing at the bottom of this page`,
			);
		}
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
		const multiPageResult = await measureMultiPage(browser, { faultCss });

		await browser.disconnect();

		console.log("");
		for (const { label, result } of results) {
			console.log(formatResult(label, result));
			console.log("");
		}
		console.log(formatMultiPageResult(multiPageResult));
		console.log("");

		const singlePageFailures = results.filter(
			({ result }) => !(result.fitsPage && result.insetsEqual && result.notBlank),
		);
		/* the multi-page PDF check counts as one more combination in the tally, alongside
		   the single-page geometry combinations above — same pass/fail vocabulary, a
		   different rendering path underneath */
		const totalCombinations = results.length + 1;
		const totalFailures = singlePageFailures.length + (multiPageResult.pass ? 0 : 1);
		if (totalFailures > 0) {
			console.error(`PRINT CHECK FAILED: ${totalFailures}/${totalCombinations} combination(s) failed. See above.`);
			process.exitCode = 1;
		} else {
			console.log(`PRINT CHECK PASSED: ${totalCombinations}/${totalCombinations} combination(s) passed.`);
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
