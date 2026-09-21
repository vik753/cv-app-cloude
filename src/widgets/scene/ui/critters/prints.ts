import { lowerGround, upperGround, type Point } from "@/widgets/scene/lib/landscape";
import { lerp, onRoute, type Waypoint } from "@/widgets/scene/lib/choreography";
import type { Mode } from "@/widgets/scene/ui/critters/rig";
import { FOX, HARE, WOLF } from "@/widgets/scene/ui/critters/routes";

/* Winter only: every walker leaves prints in the snow as it goes. The winter day is
   one cycle, so what's pressed in today stays until the thaw at the spring dawn. */
export interface Print {
	x: number;
	y: number;
	rx: number;
	ry: number;
	f: number;
}

const MOVING = new Set<Mode>(["walk", "trot", "run"]);

/* wolf: prints in pairs; fox: one neat line, each paw in the last one's print */
const printsAlong = (
	route: Waypoint<Mode>[],
	stride: number,
	spread: number,
	size: number,
	depthScale: number,
): Print[] => {
	const prints: Print[] = [];
	let last: Point | null = null;
	let travelled = 0;
	let side = 1;
	for (let f = route[0].f; f < route[route.length - 1].f; f += 0.0002) {
		const at = onRoute(route, f);
		if (!at || !MOVING.has(at.mode)) {
			last = null;
			continue;
		}
		const y = lowerGround(at.x) + at.d;
		if (last) travelled += Math.hypot(at.x - last[0], y - last[1]);
		last = [at.x, y];
		const pace = at.mode === "run" ? stride * 1.8 : stride;
		if (travelled < pace) continue;
		travelled = 0;
		side = -side;
		const scale = 0.98 + at.d / depthScale;
		prints.push({ x: at.x, y: y + side * spread * scale, rx: size * scale, ry: size * 0.42 * scale, f });
	}
	return prints;
};

/* the fox's dive leaves a crater with scuffed snow at the rim */
const FOX_DIVE = FOX.find((point) => point.mode === "dive") as Waypoint;
const FOX_PRINTS: Print[] = [
	...printsAlong(FOX, 8, 0.4, 1.5, 500),
	{ x: FOX_DIVE.x - 26, y: lowerGround(FOX_DIVE.x) + FOX_DIVE.d, rx: 7, ry: 2.4, f: FOX_DIVE.f + 0.002 },
];
const WOLF_PRINTS = printsAlong(WOLF, 11, 2.2, 1.9, 420);
export const LOWER_PRINTS = [...WOLF_PRINTS, ...FOX_PRINTS].sort((a, b) => a.f - b.f);

/* hare: at every landing the long hind feet come down ahead of the small forefeet */
export const HARE_PRINTS: Print[] = (() => {
	const prints: Print[] = [];
	let start = 0;
	for (const segment of HARE) {
		if (segment.mode === "hop") {
			const hops = segment.hops ?? 3;
			for (let hop = 1; hop <= hops; hop += 1) {
				const f = start + ((segment.until - start) * hop) / hops;
				const x = lerp(segment.x[0], segment.x[1], hop / hops);
				const y = upperGround(x) + 3;
				const ahead = -segment.facing;
				prints.push(
					{ x: x - ahead * 3.5, y: y - 1.2, rx: 2.6, ry: 0.8, f },
					{ x: x - ahead * 3.5, y: y + 1.2, rx: 2.6, ry: 0.8, f },
					{ x: x + ahead * 3.2, y, rx: 1, ry: 0.6, f },
					{ x: x + ahead * 5.2, y: y + 0.6, rx: 1, ry: 0.6, f },
				);
			}
		}
		start = segment.until;
	}
	return prints;
})();
