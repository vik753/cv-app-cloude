import {
	BACK_RIDGE,
	backRidgeAt,
	FIELD,
	fieldRow,
	frontRidgeAt,
	MOW_FROM,
	MOW_STEP,
	BANDS,
	mownAt,
	midRidgeAt,
	projectScene,
	RIVER_PATH,
	RIVER_TOP,
} from "@/services/landscape";
import { describe, expect, it } from "vitest";

describe("landscape ridges", () => {
	it("reads the back ridge's height at its own left endpoint", () => {
		/* BACK_RIDGE starts with "M0,560", so x=0 must return exactly that height */
		expect(backRidgeAt(0)).toBeCloseTo(560, 5);
	});

	it("reads the back ridge's height at its own right endpoint", () => {
		/* the last point of BACK_RIDGE is "1600,560" */
		expect(backRidgeAt(1600)).toBeCloseTo(560, 5);
	});

	it("clamps to the last segment for an x past the end of the ridge", () => {
		/* frontRidgeAt is used by scenery placed at the map's edges; going out of
		   bounds must not throw or return NaN */
		expect(Number.isNaN(frontRidgeAt(5000))).toBe(false);
		expect(frontRidgeAt(5000)).toBeCloseTo(frontRidgeAt(1600), 3);
	});

	it("returns a mid ridge height between the back and front ridges at the same x", () => {
		const x = 800;
		expect(midRidgeAt(x)).toBeGreaterThan(backRidgeAt(x));
		expect(midRidgeAt(x)).toBeLessThan(frontRidgeAt(x));
	});

	it("builds RIVER_PATH out of the river's top curve, closed into a filled shape", () => {
		expect(RIVER_PATH.startsWith(RIVER_TOP)).toBe(true);
		expect(RIVER_PATH.trim().endsWith("Z")).toBe(true);
	});

	it("keeps BACK_RIDGE parseable as an SVG cubic path (M + multiples of 3 curve points)", () => {
		const numbers = BACK_RIDGE.match(/-?\d+(\.\d+)?/g) ?? [];
		/* one M point (2 numbers) plus whole groups of 3 cubic-bezier points (6 numbers each) */
		expect((numbers.length - 2) % 6).toBe(0);
	});
});

describe("fieldRow", () => {
	it("matches the field's near edge at depth 0", () => {
		const row = fieldRow(0);
		expect(row.y).toBe(FIELD.nearY);
		expect(row.from).toBe(FIELD.nearFrom);
		expect(row.to).toBe(FIELD.nearTo);
	});

	it("matches the field's far edge at its full depth", () => {
		const row = fieldRow(FIELD.depth);
		expect(row.y).toBe(FIELD.nearY - FIELD.depth);
		expect(row.from).toBeCloseTo(FIELD.farFrom, 5);
		expect(row.to).toBeCloseTo(FIELD.farTo, 5);
	});
});

describe("mownAt", () => {
	it("gives the nearest band (the last one) the smallest cut threshold, MOW_FROM", () => {
		expect(mownAt(BANDS - 1)).toBeCloseTo(MOW_FROM, 10);
	});

	it("gives band 0 the largest cut threshold", () => {
		expect(mownAt(0)).toBeCloseTo(MOW_FROM + MOW_STEP * (BANDS - 1), 10);
	});

	it("decreases monotonically as the band index rises, so bands cut in order", () => {
		const thresholds = Array.from({ length: BANDS }, (_, band) => mownAt(band));
		for (let i = 1; i < thresholds.length; i += 1) {
			expect(thresholds[i]).toBeLessThan(thresholds[i - 1]);
		}
	});
});

describe("projectScene", () => {
	it("scales to fill the viewport width when the viewport is wide and short", () => {
		const viewport = { width: 1600, height: 400 };
		const scene = projectScene(viewport);
		/* strip = max(400*0.58, 380) = 380; scale = max(1600/1600, 380/900) = 1 */
		expect(scene.scale).toBeCloseTo(1, 5);
	});

	it("scales to fill the taller strip when the viewport is narrow and tall", () => {
		const viewport = { width: 400, height: 2000 };
		const scene = projectScene(viewport);
		const strip = Math.max(2000 * 0.58, 380);
		const expectedScale = Math.max(400 / 1600, strip / 900);
		expect(scene.scale).toBeCloseTo(expectedScale, 5);
	});

	it("anchors a landscape point to the bottom of the viewport", () => {
		const viewport = { width: 1600, height: 900 };
		const scene = projectScene(viewport);
		/* a point at scene y=900 (the very bottom of the 900-tall viewBox) must land
		   exactly on the viewport's own bottom edge */
		const spot = scene.at(0, 900);
		expect(spot.top).toBeCloseTo(900, 5);
	});
});
