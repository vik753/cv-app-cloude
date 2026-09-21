/* The pure maths the choreography is built from: interpolation, the fade envelope
   that brings a figure in and out again, and sampling a timed route. Nothing here
   reads the clock or touches the DOM — `useCycleFrame` supplies the `f` these are
   evaluated at. */

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const ease = (t: number) => t * t * (3 - 2 * t);
export const TAU = Math.PI * 2;

/* fade in/out over the first and last slice of a visible stretch */
export const presence = (f: number, from: number, to: number, fade = 0.006) =>
	Math.max(0, Math.min(1, (f - from) / fade, (to - f) / fade));

/* A route: timed waypoints on the ground. Between two waypoints whoever is walking
   follows a Catmull-Rom curve through the neighbouring ones, so they arc around
   things instead of marching in straight lines. Two identical waypoints in a row
   mean standing still; `facing` pins which way they look while they do. */
export interface Waypoint<M extends string = string> {
	f: number;
	x: number;
	d: number;
	mode: M;
	facing?: 1 | -1;
}

const catmull = (a: number, b: number, c: number, d: number, t: number) =>
	0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (3 * b - a - 3 * c + d) * t * t * t);

export const onRoute = <M extends string>(route: Waypoint<M>[], f: number) => {
	const i = route.findIndex((point, index) => index < route.length - 1 && f >= point.f && f < route[index + 1].f);
	if (i < 0) return null;
	const from = route[i];
	const to = route[i + 1];
	const before = route[Math.max(0, i - 1)];
	const after = route[Math.min(route.length - 1, i + 2)];
	const p = (f - from.f) / (to.f - from.f);
	if (from.x === to.x && from.d === to.d)
		return { x: from.x, d: from.d, dx: 0, p, mode: from.mode, facing: from.facing };
	const x = catmull(before.x, from.x, to.x, after.x, p);
	return {
		x,
		d: catmull(before.d, from.d, to.d, after.d, p),
		dx: catmull(before.x, from.x, to.x, after.x, Math.min(1, p + 0.02)) - x,
		p,
		mode: from.mode,
		facing: from.facing,
	};
};
