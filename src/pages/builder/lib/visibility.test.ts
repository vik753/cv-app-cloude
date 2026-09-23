import { visibleFraction } from "@/pages/builder/lib/visibility";
import { describe, expect, it } from "vitest";

describe("visibleFraction", () => {
	it("reports full visibility for a panel entirely inside the viewport", () => {
		const box = { top: 100, bottom: 500, height: 400 };
		expect(visibleFraction(box, 800)).toBeCloseTo(1, 10);
	});

	it("reports zero for a panel entirely below the fold", () => {
		const box = { top: 900, bottom: 1300, height: 400 };
		expect(visibleFraction(box, 800)).toBe(0);
	});

	it("reports zero for a panel entirely above the fold", () => {
		const box = { top: -500, bottom: -100, height: 400 };
		expect(visibleFraction(box, 800)).toBe(0);
	});

	it("reports a partial fraction for a panel straddling the bottom edge", () => {
		/* only the top 100px of a 400px-tall panel overlap an 800-tall viewport */
		const box = { top: 700, bottom: 1100, height: 400 };
		expect(visibleFraction(box, 800)).toBeCloseTo(0.25, 10);
	});

	it("judges a panel taller than the viewport against the viewport, not its own height", () => {
		/* the panel covers the whole screen: the denominator is capped at the viewport's
		   height, or a panel nobody could ever see all of would never reach 1 */
		const box = { top: -200, bottom: 1200, height: 1400 };
		expect(visibleFraction(box, 800)).toBeCloseTo(1, 10);
	});

	it("judges a panel shorter than the viewport against its own height", () => {
		/* a 200px panel, 150px of it scrolled past the top: 150/200 showing */
		const box = { top: -50, bottom: 150, height: 200 };
		expect(visibleFraction(box, 800)).toBeCloseTo(0.75, 10);
	});

	it("returns zero rather than a negative fraction for a box with no showable height", () => {
		const box = { top: 0, bottom: 0, height: 0 };
		expect(visibleFraction(box, 800)).toBe(0);
	});

	it("clamps to 1 rather than a ratio above it for an inconsistent box that overstates overlap", () => {
		/* bottom-top exceeds the declared height; the function still refuses to report
		   more than "fully visible" */
		const box = { top: 0, bottom: 1000, height: 100 };
		expect(visibleFraction(box, 1000)).toBe(1);
	});

	it("reproduces the incident where a mid-transition panel measured 0.87 and suppressed a needed scroll", () => {
		/* the panel's top sits 104px above the viewport's own top, with a height equal to
		   the viewport: geometrically 87% overlaps, clearing the 0.5 threshold in
		   BuilderPage and skipping scrollIntoView, even though the panel had not
		   actually settled into its visible position yet */
		const box = { top: -104, bottom: 696, height: 800 };
		expect(visibleFraction(box, 800)).toBeCloseTo(0.87, 10);
	});
});
