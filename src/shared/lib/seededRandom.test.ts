import { seededRandom } from "@/shared/lib";
import { describe, expect, it } from "vitest";

describe("seededRandom", () => {
	it("produces the same sequence for the same seed", () => {
		const a = seededRandom(42);
		const b = seededRandom(42);
		const sequenceA = Array.from({ length: 20 }, () => a());
		const sequenceB = Array.from({ length: 20 }, () => b());
		expect(sequenceA).toEqual(sequenceB);
	});

	it("produces a different sequence for a different seed", () => {
		const a = seededRandom(1);
		const b = seededRandom(2);
		const sequenceA = Array.from({ length: 10 }, () => a());
		const sequenceB = Array.from({ length: 10 }, () => b());
		expect(sequenceA).not.toEqual(sequenceB);
	});

	it("does not repeat the same value on every draw from one generator", () => {
		const draw = seededRandom(7);
		const first = draw();
		const second = draw();
		expect(first).not.toBe(second);
	});

	it("stays within the [0, 1) range documented for a random draw", () => {
		const draw = seededRandom(123456);
		for (let i = 0; i < 200; i += 1) {
			const value = draw();
			expect(value).toBeGreaterThanOrEqual(0);
			expect(value).toBeLessThan(1);
		}
	});

	it("is a fresh, independent generator each time it is called with the same seed", () => {
		const draw = seededRandom(99);
		draw();
		draw();
		const third = draw();
		/* re-seeding must reproduce the whole sequence, not carry over the previous
		   generator's internal state */
		const fresh = seededRandom(99);
		const freshFirst = fresh();
		expect(freshFirst).not.toBe(third);
		expect(freshFirst).toBe(seededRandom(99)());
	});
});
