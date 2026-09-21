import { nextSeason, type Season } from "@/hooks/useDayNightCycle";
import { describe, expect, it } from "vitest";

describe("nextSeason", () => {
	it("cycles summer -> autumn -> winter -> spring -> summer", () => {
		const start: Season = "summer";
		const sequence: Season[] = [start];
		let current: Season = start;
		for (let i = 0; i < 4; i += 1) {
			current = nextSeason(current);
			sequence.push(current);
		}
		expect(sequence).toEqual(["summer", "autumn", "winter", "spring", "summer"]);
	});

	it("never produces the same season twice in a row", () => {
		let current: Season = "winter";
		for (let i = 0; i < 8; i += 1) {
			const next = nextSeason(current);
			expect(next).not.toBe(current);
			current = next;
		}
	});
});
