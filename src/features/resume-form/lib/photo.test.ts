import { fitWithin, PHOTO_MAX_SIDE } from "@/features/resume-form/lib/photo";
import { describe, expect, it } from "vitest";

describe("fitWithin", () => {
	it("scales a landscape photo so its long side is the limit", () => {
		expect(fitWithin(4000, 3000, PHOTO_MAX_SIDE)).toEqual({ width: 400, height: 300 });
	});

	it("scales a portrait photo by its height", () => {
		expect(fitWithin(3024, 4032, PHOTO_MAX_SIDE)).toEqual({ width: 300, height: 400 });
	});

	it("never enlarges a photo that is already small enough", () => {
		expect(fitWithin(120, 90, PHOTO_MAX_SIDE)).toEqual({ width: 120, height: 90 });
	});

	it("keeps an extreme panorama at least one pixel high", () => {
		expect(fitWithin(40000, 10, PHOTO_MAX_SIDE)).toEqual({ width: 400, height: 1 });
	});
});
