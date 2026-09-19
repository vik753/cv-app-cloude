/* Geometry of the day/night landscape (viewBox 1600×900): the ridge lines of the
   hills and river, and where the scenery that the critters visit stands. */

/* Ridge lines of the landscape. The hills are built from them, and everything that
   stands or lies on a meadow is placed against them, so nothing floats or sinks. */
export const BACK_RIDGE = "M0,560 C200,480 400,520 600,500 C800,480 1000,520 1200,500 C1400,480 1600,510 1600,560";
export const MID_RIDGE = "M0,650 C250,600 450,640 650,615 C900,590 1100,630 1350,605 C1500,590 1600,610 1600,650";
export const FRONT_RIDGE = "M0,780 C200,740 400,770 650,750 C900,730 1150,770 1400,745 C1500,735 1600,750 1600,780";
export const RIVER_TOP = "M0,700 C300,670 500,730 800,700 C1100,670 1300,730 1600,700";

export type Point = [number, number];
type Segment = [Point, Point, Point, Point];

const parseRidge = (d: string): Segment[] => {
	const n = (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
	const segments: Segment[] = [];
	let start: Point = [n[0], n[1]];
	for (let i = 2; i + 5 < n.length; i += 6) {
		const segment: Segment = [start, [n[i], n[i + 1]], [n[i + 2], n[i + 3]], [n[i + 4], n[i + 5]]];
		segments.push(segment);
		start = segment[3];
	}
	return segments;
};

const bezier = (a: number, b: number, c: number, d: number, t: number) =>
	(1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t * t * c + t ** 3 * d;

/* every segment is monotonic in x, so a bisection on t finds the ridge height */
const ridgeY = (segments: Segment[], x: number): number => {
	const segment = segments.find(([p0, , , p3]) => x >= p0[0] && x <= p3[0]) ?? segments[segments.length - 1];
	const [p0, p1, p2, p3] = segment;
	let lo = 0;
	let hi = 1;
	for (let step = 0; step < 32; step += 1) {
		const mid = (lo + hi) / 2;
		if (bezier(p0[0], p1[0], p2[0], p3[0], mid) < x) lo = mid;
		else hi = mid;
	}
	return bezier(p0[1], p1[1], p2[1], p3[1], lo);
};

const BACK = parseRidge(BACK_RIDGE);
const MID = parseRidge(MID_RIDGE);
const FRONT = parseRidge(FRONT_RIDGE);
const RIVER = parseRidge(RIVER_TOP);

export const backRidgeAt = (x: number) => ridgeY(BACK, x);
export const midRidgeAt = (x: number) => ridgeY(MID, x);
export const frontRidgeAt = (x: number) => ridgeY(FRONT, x);
export const riverTopAt = (x: number) => ridgeY(RIVER, x);

/* ground line for anything walking on a meadow */
export const upperGround = (x: number) => ridgeY(MID, x) - 30;
export const lowerGround = (x: number) => ridgeY(FRONT, x);

export const onBackMeadow = (x: number) => Math.round(ridgeY(MID, x) - 30);
export const onBackRidge = (x: number) => Math.round(ridgeY(BACK, x) + 14);
export const onFrontMeadow = (x: number, depth: number) => Math.round(ridgeY(FRONT, x) + depth);

/* where the critters need to find things */
export const APPLE_TREE = { x: 78, base: onBackMeadow(78), scale: 0.9 };
export const BIRCH_TREE = { x: 470, base: onBackMeadow(470), scale: 0.9 };
export const UPPER_BUSH = { x: 580, base: onBackMeadow(580) + 2, scale: 0.9 };
export const LOWER_BUSH = { x: 430, base: onFrontMeadow(430, 70), scale: 1.05 };

/* the lower meadow's scenery. The wolf and the fox weave between these: `reach` is
   how far a trunk or crown covers anyone standing behind it */
export const LOWER_PINES = [
	{ x: 250, base: onFrontMeadow(250, 84), scale: 0.95 },
	{ x: 770, base: 865, scale: 1.1 },
	{ x: 1230, base: 791, scale: 1 },
];
export const CHERRY_TREE = { x: 80, base: onFrontMeadow(80, 84), scale: 1.1 };
export const OAK_TREE = { x: 1000, base: onFrontMeadow(1000, 90), scale: 1.1 };
export const ROWAN_TREE = { x: 1525, base: onFrontMeadow(1525, 100), scale: 1.05 };

export const LOWER_COVER = [
	...LOWER_PINES.map((pine) => ({ x: pine.x, base: pine.base, reach: 22 * pine.scale })),
	{ x: LOWER_BUSH.x, base: LOWER_BUSH.base, reach: 26 * LOWER_BUSH.scale },
	{ x: CHERRY_TREE.x, base: CHERRY_TREE.base, reach: 29 * CHERRY_TREE.scale },
	{ x: OAK_TREE.x, base: OAK_TREE.base, reach: 33 * OAK_TREE.scale },
	{ x: ROWAN_TREE.x, base: ROWAN_TREE.base, reach: 21 * ROWAN_TREE.scale },
];
