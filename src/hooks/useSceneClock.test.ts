import { ease, lerp, onRoute, presence, type Waypoint } from "@/widgets/scene/model/useSceneClock";
import { describe, expect, it } from "vitest";

describe("lerp", () => {
	it("returns the start value at t=0", () => {
		expect(lerp(10, 20, 0)).toBe(10);
	});

	it("returns the end value at t=1", () => {
		expect(lerp(10, 20, 1)).toBe(20);
	});

	it("returns the midpoint at t=0.5", () => {
		expect(lerp(10, 20, 0.5)).toBe(15);
	});
});

describe("ease", () => {
	it("starts at 0", () => {
		expect(ease(0)).toBe(0);
	});

	it("ends at 1", () => {
		expect(ease(1)).toBe(1);
	});

	it("passes through the midpoint at t=0.5", () => {
		expect(ease(0.5)).toBeCloseTo(0.5, 10);
	});
});

describe("presence", () => {
	it("is fully visible in the middle of the visible stretch", () => {
		expect(presence(0.5, 0.4, 0.6)).toBe(1);
	});

	it("is invisible before the visible stretch begins", () => {
		expect(presence(0.3, 0.4, 0.6)).toBe(0);
	});

	it("is invisible after the visible stretch ends", () => {
		expect(presence(0.7, 0.4, 0.6)).toBe(0);
	});

	it("fades in across the entry edge", () => {
		const fade = 0.01;
		expect(presence(0.4, 0.4, 0.6, fade)).toBe(0);
		expect(presence(0.4 + fade / 2, 0.4, 0.6, fade)).toBeCloseTo(0.5, 5);
		expect(presence(0.4 + fade, 0.4, 0.6, fade)).toBe(1);
	});

	it("fades out across the exit edge", () => {
		const fade = 0.01;
		expect(presence(0.6, 0.4, 0.6, fade)).toBe(0);
		expect(presence(0.6 - fade / 2, 0.4, 0.6, fade)).toBeCloseTo(0.5, 5);
	});
});

describe("onRoute", () => {
	const route: Waypoint[] = [
		{ f: 0, x: 0, d: 0, mode: "walk" },
		{ f: 0.5, x: 100, d: 10, mode: "walk" },
		{ f: 1, x: 200, d: 0, mode: "walk" },
	];

	it("sits exactly on the first waypoint at its own f", () => {
		const point = onRoute(route, 0);
		expect(point).not.toBeNull();
		expect(point!.x).toBeCloseTo(0, 5);
		expect(point!.d).toBeCloseTo(0, 5);
	});

	it("is close to the middle waypoint just before its own f", () => {
		const point = onRoute(route, 0.4999);
		expect(point).not.toBeNull();
		expect(point!.x).toBeCloseTo(100, 0);
	});

	it("returns null past the end of the route (f === the last waypoint's f)", () => {
		expect(onRoute(route, 1)).toBeNull();
	});

	it("returns null before the start of the route", () => {
		const shifted: Waypoint[] = [
			{ f: 0.2, x: 0, d: 0, mode: "walk" },
			{ f: 0.8, x: 100, d: 0, mode: "walk" },
		];
		expect(onRoute(shifted, 0.1)).toBeNull();
	});

	it("returns null for an f well past every waypoint", () => {
		expect(onRoute(route, 1.5)).toBeNull();
	});

	it("treats two identical waypoints in a row as standing still", () => {
		const standing: Waypoint[] = [
			{ f: 0, x: 50, d: 5, mode: "idle", facing: -1 },
			{ f: 0.5, x: 50, d: 5, mode: "idle", facing: -1 },
			{ f: 1, x: 80, d: 5, mode: "walk" },
		];
		const point = onRoute(standing, 0.25);
		expect(point).toEqual({ x: 50, d: 5, dx: 0, p: 0.5, mode: "idle", facing: -1 });
	});

	it("carries the segment's own mode and facing across its span", () => {
		const withFacing: Waypoint[] = [
			{ f: 0, x: 0, d: 0, mode: "walk", facing: 1 },
			{ f: 1, x: 10, d: 0, mode: "walk", facing: 1 },
		];
		const point = onRoute(withFacing, 0.3);
		expect(point!.mode).toBe("walk");
		expect(point!.facing).toBe(1);
	});
});
