import { backRidgeAt, frontRidgeAt, midRidgeAt, riverTopAt } from "@/widgets/scene/lib/landscape";
import { between, plantGrid } from "@/widgets/scene/ui/flora/planting";
import { seededRandom } from "@/shared/lib";

interface Speck {
	x: number;
	y: number;
	rx: number;
	ry: number;
	angle: number;
	color: string;
}
interface Snowdrop {
	x: number;
	y: number;
	scale: number;
	delay: number;
}

interface Tuft {
	x: number;
	y: number;
	scale: number;
	flip: 1 | -1;
	shade: number;
}
export type FlowerKind = "daisy" | "poppy" | "cornflower" | "buttercup";
interface Flower {
	x: number;
	y: number;
	scale: number;
	kind: FlowerKind;
	lean: number;
	delay: number;
}
export interface Litter {
	specks: Speck[];
	snowdrops: Snowdrop[];
	tufts: Tuft[];
	flowers: Flower[];
}

const SPECK_COLORS = ["#e8c547", "#e39a3b", "#d9b44a", "#c9762f", "#e0b347"];
const FLOWER_KINDS: FlowerKind[] = ["daisy", "daisy", "poppy", "cornflower", "buttercup", "buttercup"];
/* scatter on the visible band of a hill: below its own ridge, above whatever covers it */
const scatter = (
	seed: number,
	count: number,
	top: (x: number) => number,
	bottom: (x: number) => number,
	size: number,
	columns: number,
	rows: number,
): Litter => {
	const random = seededRandom(seed);
	const specks: Speck[] = [];
	for (let attempt = 0; specks.length < count && attempt < count * 4; attempt += 1) {
		const x = between(random, 4, 1596);
		const low = top(x) + 6 * size;
		const high = bottom(x) - 4 * size;
		if (high <= low) continue;
		specks.push({
			x,
			y: between(random, low, high),
			rx: between(random, 1.8, 3.2) * size,
			ry: between(random, 0.9, 1.6) * size,
			angle: between(random, -50, 50),
			color: SPECK_COLORS[Math.floor(random() * SPECK_COLORS.length)],
		});
	}
	const snowdrops: Snowdrop[] = [];
	plantGrid(random, columns, rows, top, bottom, [12 * size, 2 * size], (x, y) => {
		const delay = between(random, 7, 16);
		/* a clump of three, not a lonely stalk */
		for (const [dx, dy, s] of [
			[0, 0, 1],
			[4.5, 1.2, 0.85],
			[-4, 1.6, 0.9],
		]) {
			snowdrops.push({
				x: x + dx * size * 1.5,
				y: y + dy * size,
				scale: s * size * 1.6,
				delay: delay + random() * 1.5,
			});
		}
	});
	/* summer grass: tufts a little denser than the snowdrops, and flowers in pairs */
	const tufts: Tuft[] = [];
	plantGrid(random, Math.round(columns * 1.5), rows, top, bottom, [8 * size, 1 * size], (x, y) => {
		tufts.push({
			x,
			y,
			scale: size * between(random, 1.1, 1.6),
			flip: random() < 0.5 ? 1 : -1,
			shade: Math.floor(random() * 3),
		});
	});
	const flowers: Flower[] = [];
	plantGrid(random, Math.round(columns * 1.2), rows, top, bottom, [12 * size, 1 * size], (x, y) => {
		const kind = FLOWER_KINDS[Math.floor(random() * FLOWER_KINDS.length)];
		const delay = between(random, 2, 12);
		for (let bloom = 0; bloom < 1 + Math.floor(random() * 2); bloom += 1) {
			flowers.push({
				x: x + bloom * between(random, 3, 6) * size,
				y: y + bloom * between(random, -1, 1.5) * size,
				scale: size * between(random, 1.2, 1.6),
				kind,
				lean: between(random, -12, 12),
				delay: delay + random(),
			});
		}
	});
	return { specks, snowdrops, tufts, flowers };
};

export const BACK_LITTER = scatter(
	11,
	70,
	(x) => backRidgeAt(x),
	(x) => midRidgeAt(x),
	0.7,
	22,
	2,
);
export const MID_LITTER = scatter(
	23,
	44,
	(x) => midRidgeAt(x),
	(x) => riverTopAt(x),
	0.85,
	20,
	2,
);
export const FRONT_LITTER = scatter(
	37,
	96,
	(x) => frontRidgeAt(x),
	() => 898,
	1.1,
	18,
	3,
);
