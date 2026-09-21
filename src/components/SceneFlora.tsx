import { WheatField } from "@/components/SceneField";
import type { Season } from "@/hooks/useDayNightCycle";
import {
	APPLE_TREE,
	BACK_RIDGE,
	BIRCH_TREE,
	CHERRY_TREE,
	FRONT_RIDGE,
	LOWER_BUSH,
	LOWER_PINES,
	MID_RIDGE,
	OAK_TREE,
	ROWAN_TREE,
	STUMP,
	UPPER_BUSH,
	backRidgeAt,
	frontRidgeAt,
	midRidgeAt,
	onBackMeadow,
	onBackRidge,
	riverTopAt,
	type Point,
} from "@/services/landscape";
import { StorkTree } from "@/components/SceneStorks";
import { Village } from "@/components/SceneVillage";
import { seededRandom } from "@/shared/lib";
import type { CSSProperties, ReactNode } from "react";

const between = (random: () => number, min: number, max: number) => min + random() * (max - min);

/* ---------------------------------------------------------------- trees */

type TreeKind = "apple" | "cherry" | "maple" | "birch" | "oak" | "rowan" | "bush";
type Tone = "far" | "near";
type Shade = 0 | 1 | 2;
/* cx, cy, rx, ry, shade */
type Blob = [number, number, number, number, Shade];

interface TreeShape {
	trunk: string;
	bark: string;
	/* twigs default to the bark colour; the birch's are dark against its white trunk */
	twig?: string;
	branches: string;
	branchWidth: number;
	marks?: string;
	crown: Blob[];
	autumn: [string, string, string];
	fruit?: "apple" | "cherry" | "rowan";
	fruitAt?: Point[];
}

const SUMMER: Record<Tone, [string, string, string]> = {
	/* main, shaded sides, sunlit top */
	far: ["#5aa473", "#4b9366", "#6db57f"],
	near: ["#3d8459", "#326f4b", "#4d9763"],
};

const TREES: Record<TreeKind, TreeShape> = {
	apple: {
		trunk: "M-3.5,0 C-3,-10 -3,-20 -2.2,-30 L2.2,-30 C3,-20 3,-10 3.5,0 Z",
		bark: "#6b4a33",
		branches:
			"M0,-26 L-13,-42 M0,-28 L12,-44 M0,-29 L-1,-58 M-7,-35 L-19,-40 M6,-37 L19,-42 M-1,-48 L-9,-61 M-1,-50 L8,-62",
		branchWidth: 2.4,
		crown: [
			[0, -38, 13, 9, 1],
			[-15, -42, 14, 13, 1],
			[14, -43, 14, 13, 1],
			[0, -50, 20, 19, 0],
			[-8, -62, 13, 12, 2],
			[9, -61, 13, 12, 2],
		],
		autumn: ["#d4a93a", "#9aa640", "#e2b64a"],
		fruit: "apple",
		fruitAt: [
			[-12, -40],
			[6, -47],
			[14, -37],
			[-4, -58],
			[11, -56],
			[-17, -50],
			[2, -37],
			[-6, -46],
		],
	},
	cherry: {
		trunk: "M-3,0 C-2.6,-10 -2.6,-20 -2,-27 L2,-27 C2.6,-20 2.6,-10 3,0 Z",
		bark: "#6d3f35",
		branches:
			"M0,-24 L-15,-40 M0,-25 L15,-41 M0,-26 L0,-58 M-9,-33 L-21,-36 M8,-33 L20,-37 M0,-44 L-8,-60 M0,-45 L9,-61",
		branchWidth: 2.2,
		crown: [
			[-20, -36, 9, 7, 1],
			[19, -37, 9, 7, 1],
			[-14, -45, 12, 11, 1],
			[14, -46, 12, 11, 1],
			[0, -51, 15, 14, 0],
			[-7, -62, 11, 10, 2],
			[8, -63, 11, 10, 2],
		],
		autumn: ["#d9652f", "#e6a13a", "#b8452c"],
		fruit: "cherry",
		fruitAt: [
			[-13, -39],
			[6, -46],
			[16, -40],
			[-4, -57],
			[11, -58],
			[-19, -47],
			[0, -38],
		],
	},
	maple: {
		trunk: "M-3.5,0 C-3,-10 -3,-20 -2.4,-32 L2.4,-32 C3,-20 3,-10 3.5,0 Z",
		bark: "#5f4331",
		branches:
			"M0,-28 L-14,-44 M0,-30 L13,-46 M0,-31 L0,-66 M-8,-38 L-20,-42 M7,-39 L20,-43 M0,-50 L-10,-62 M0,-52 L10,-63",
		branchWidth: 2.4,
		crown: [
			[0, -37, 14, 8, 1],
			[-17, -42, 13, 11, 1],
			[17, -42, 13, 11, 1],
			[0, -50, 21, 18, 0],
			[-10, -61, 13, 11, 2],
			[10, -61, 13, 11, 2],
			[0, -69, 10, 8, 2],
		],
		autumn: ["#d8452b", "#ef7d2a", "#f2b134"],
	},
	birch: {
		trunk: "M-2.4,0 C-2.2,-18 -1.8,-40 -1,-66 L1,-66 C1.8,-40 2.2,-18 2.4,0 Z",
		bark: "#efece4",
		twig: "#5d5048",
		marks:
			"M-2.3,-8 L-0.5,-8.6 M0.6,-15 L2.2,-15.5 M-2.1,-24 L-0.4,-24.4 M0.4,-33 L1.9,-33.6 M-1.8,-42 L-0.3,-42.5 M0.3,-50 L1.5,-50.5",
		branches:
			"M0,-30 L-10,-46 C-12,-50 -13,-54 -13,-58 M0,-34 L10,-50 C12,-54 12,-58 12,-60 M0,-46 L-6,-66 M0,-48 L6,-68",
		branchWidth: 1.6,
		crown: [
			[-10, -46, 8, 13, 1],
			[10, -47, 8, 13, 1],
			[0, -55, 11, 20, 0],
			[-6, -62, 7, 10, 2],
			[6, -63, 7, 10, 2],
			[0, -72, 7, 9, 2],
		],
		autumn: ["#f0c93a", "#e6b52e", "#d9c24a"],
	},
	oak: {
		trunk: "M-5.5,0 C-4.5,-10 -4.5,-18 -4,-26 L4,-26 C4.5,-18 4.5,-10 5.5,0 Z",
		bark: "#5a4030",
		branches:
			"M0,-22 L-20,-38 M0,-23 L20,-39 M0,-25 L-2,-58 M-10,-30 L-24,-34 M10,-30 L25,-35 M-1,-44 L-12,-58 M-1,-46 L12,-58",
		branchWidth: 3,
		crown: [
			[-19, -39, 14, 11, 1],
			[19, -40, 14, 11, 1],
			[0, -46, 26, 16, 0],
			[-11, -57, 14, 11, 2],
			[11, -58, 14, 11, 2],
			[0, -64, 11, 8, 2],
		],
		autumn: ["#b8732f", "#9c6a2c", "#c98b3a"],
	},
	rowan: {
		trunk: "M-2.6,0 C-2.4,-12 -2.2,-24 -1.6,-34 L1.6,-34 C2.2,-24 2.4,-12 2.6,0 Z",
		bark: "#6b4a33",
		branches: "M0,-30 L-11,-45 M0,-31 L10,-47 M0,-33 L0,-70 M0,-50 L-12,-61 M0,-52 L11,-63",
		branchWidth: 1.9,
		crown: [
			[-10, -45, 10, 9, 1],
			[9, -47, 10, 9, 1],
			[0, -56, 12, 11, 0],
			[-11, -60, 9, 8, 2],
			[11, -62, 9, 8, 2],
			[0, -70, 8, 7, 2],
		],
		autumn: ["#e0602a", "#c9412a", "#eb8a33"],
		fruit: "rowan",
		fruitAt: [
			[-12, -41],
			[8, -43],
			[-3, -52],
			[12, -57],
			[-9, -58],
			[3, -64],
		],
	},
	/* a hazel-like shrub: no trunk, a fan of stems straight from the ground */
	bush: {
		trunk: "",
		bark: "#6b4a33",
		branches: "M0,0 L-15,-15 M0,0 L-6,-22 M0,0 L5,-23 M0,0 L15,-15 M-7,-7 L-19,-9 M7,-7 L19,-8",
		branchWidth: 1.8,
		crown: [
			[-13, -10, 11, 8, 1],
			[13, -10, 11, 8, 1],
			[0, -15, 15, 11, 0],
			[-7, -22, 9, 7, 2],
			[7, -22, 9, 7, 2],
		],
		autumn: ["#b8452c", "#d9772f", "#e2a33c"],
	},
};

/* Forked twigs at every branch tip and one along each straight limb, so a bare tree
   reads as a tree and not as a coat hanger. Derived from the branch path itself. */
const twigsFor = (branches: string): { path: string; tips: Point[] } => {
	const twigs: string[] = [];
	/* every twig tip is where a bud swells in spring */
	const tips: Point[] = [];
	const at = (x: number, y: number, angle: number, length: number) => {
		const tip: Point = [x + Math.cos(angle) * length, y + Math.sin(angle) * length];
		tips.push(tip);
		return `M${x.toFixed(1)},${y.toFixed(1)} L${tip[0].toFixed(1)},${tip[1].toFixed(1)}`;
	};
	let current: Point = [0, 0];
	for (const command of branches.split(/(?=[MLC])/)) {
		const n = (command.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
		const end: Point = [n[n.length - 2], n[n.length - 1]];
		if (command.startsWith("M")) {
			current = end;
			continue;
		}
		const from: Point = command.startsWith("C") ? [n[2], n[3]] : current;
		const angle = Math.atan2(end[1] - from[1], end[0] - from[0]);
		twigs.push(at(end[0], end[1], angle - 0.55, 6), at(end[0], end[1], angle + 0.5, 5));
		if (command.startsWith("L")) {
			const mid: Point = [current[0] + (end[0] - current[0]) * 0.6, current[1] + (end[1] - current[1]) * 0.6];
			twigs.push(at(mid[0], mid[1], angle + (end[0] < current[0] ? -0.7 : 0.7), 5));
		}
		current = end;
	}
	return { path: twigs.join(" "), tips };
};

const ROWAN_CLUSTER: Point[] = [
	[0, 0],
	[2.2, 0.4],
	[1, 2],
	[-1.2, 1.6],
];

interface FallingLeaf {
	x: number;
	y: number;
	fallX: number;
	fallY: number;
	duration: number;
	delay: number;
	shade: Shade;
}
interface GroundLeaf {
	x: number;
	y: number;
	rx: number;
	ry: number;
	angle: number;
	shade: Shade;
}

const scatterLeaves = (seed: number, crown: Blob[]) => {
	const random = seededRandom(seed);
	const shade = () => Math.floor(random() * 3) as Shade;
	const top = Math.min(...crown.map(([, cy]) => cy));
	const bottom = Math.max(...crown.map(([, cy]) => cy));
	const reach = Math.max(...crown.map(([cx, , rx]) => Math.abs(cx) + rx));
	const falling: FallingLeaf[] = Array.from({ length: 5 }, () => {
		const y = between(random, top, bottom);
		return {
			x: between(random, -reach * 0.6, reach * 0.6),
			y,
			fallX: between(random, -10, 24),
			fallY: -y + between(random, -2, 1),
			duration: between(random, 5, 8),
			delay: between(random, 0, 6),
			shade: shade(),
		};
	});
	const ground: GroundLeaf[] = Array.from({ length: 11 }, () => ({
		x: between(random, -reach, reach),
		y: between(random, -1.5, 2.5),
		rx: between(random, 1.8, 2.8),
		ry: between(random, 0.9, 1.4),
		angle: between(random, -40, 40),
		shade: shade(),
	}));
	return { falling, ground };
};

interface TreeProps {
	kind: TreeKind;
	x: number;
	base: number;
	scale: number;
	tone: Tone;
	season: Season;
	seed: number;
}

function Tree({ kind, x, base, scale, tone, season, seed }: TreeProps) {
	const shape = TREES[kind];
	const summer = SUMMER[tone];
	const { falling, ground } = scatterLeaves(seed, shape.crown);
	const twigs = twigsFor(shape.branches);
	const budSeed = seededRandom(seed + 7);
	const palette = {
		"--autumn-0": shape.autumn[0],
		"--autumn-1": shape.autumn[1],
		"--autumn-2": shape.autumn[2],
	} as CSSProperties;

	return (
		<g className={`tree tree-${kind}`} transform={`translate(${x} ${base}) scale(${scale})`} style={palette}>
			<path
				d={shape.branches}
				stroke={shape.twig ?? shape.bark}
				strokeWidth={shape.branchWidth}
				strokeLinecap='round'
				fill='none'
			/>
			<path
				d={twigs.path}
				stroke={shape.twig ?? shape.bark}
				strokeWidth={shape.branchWidth * 0.45}
				strokeLinecap='round'
				fill='none'
			/>
			{shape.trunk ? <path d={shape.trunk} fill={shape.bark} /> : null}
			{shape.marks ? <path d={shape.marks} stroke='#3b3b3b' strokeWidth={1.2} strokeLinecap='round' /> : null}
			{/* the hare's nightly work; the critters' clock reveals it */}
			{kind === "birch" ? (
				<ellipse id='birch-gnaw' cx={0.2} cy={-9} rx={2.3} ry={3.6} fill='#c79a6c' opacity={0} />
			) : null}
			<path
				className='snow-cap'
				d={shape.branches}
				transform='translate(0 -1.3)'
				stroke='#fbfdff'
				strokeWidth={shape.branchWidth * 0.7}
				strokeLinecap='round'
				fill='none'
			/>

			{twigs.tips.map(([bx, by], index) => (
				<circle
					key={index}
					className='bud'
					cx={bx}
					cy={by}
					r={1.25}
					fill={index % 3 === 0 ? "#c9d86a" : "#9fcf6a"}
					style={{ "--bud-delay": `${(10 + budSeed() * 14).toFixed(1)}s` } as CSSProperties}
				/>
			))}

			{shape.crown.map(([cx, cy, rx, ry, shade], index) => (
				<ellipse key={index} className={`leaf leaf-${shade}`} cx={cx} cy={cy} rx={rx} ry={ry} fill={summer[shade]} />
			))}

			{shape.fruit === "apple"
				? shape.fruitAt?.map(([fx, fy], index) => (
						<circle key={index} className='fruit fruit-apple' cx={fx} cy={fy} r={2.7} fill='#d8433a' />
					))
				: null}
			{shape.fruit === "cherry"
				? shape.fruitAt?.map(([fx, fy], index) => (
						<g key={index} className='fruit fruit-cherry'>
							<path
								d={`M${fx - 1.8},${fy} L${fx},${fy - 4} L${fx + 1.8},${fy}`}
								stroke='#4a6b2a'
								strokeWidth={0.7}
								fill='none'
							/>
							<circle cx={fx - 1.8} cy={fy} r={1.9} fill='#b3142f' />
							<circle cx={fx + 1.8} cy={fy} r={1.9} fill='#b3142f' />
						</g>
					))
				: null}
			{shape.fruit === "rowan"
				? shape.fruitAt?.map(([fx, fy], index) => (
						<g key={index} className='fruit fruit-rowan' fill='#e0452a'>
							{ROWAN_CLUSTER.map(([dx, dy], berry) => (
								<circle key={berry} cx={fx + dx} cy={fy + dy} r={1.4} />
							))}
						</g>
					))
				: null}

			{ground.map((leaf, index) => (
				<ellipse
					key={index}
					className='ground-leaf'
					cx={leaf.x}
					cy={leaf.y}
					rx={leaf.rx}
					ry={leaf.ry}
					transform={`rotate(${leaf.angle} ${leaf.x} ${leaf.y})`}
					fill={shape.autumn[leaf.shade]}
				/>
			))}

			{/* only mounted in autumn, so the loops don't run the rest of the year */}
			{season === "autumn"
				? falling.map((leaf, index) => (
						<g key={index} transform={`translate(${leaf.x} ${leaf.y})`}>
							<path
								className='falling-leaf'
								d='M0,-3 C2.5,-2 2.5,2 0,3 C-2.5,2 -2.5,-2 0,-3 Z'
								fill={shape.autumn[leaf.shade]}
								style={
									{
										"--fall-x": `${leaf.fallX}px`,
										"--fall-y": `${leaf.fallY}px`,
										"--fall-duration": `${leaf.duration}s`,
										"--fall-delay": `${leaf.delay}s`,
									} as CSSProperties
								}
							/>
						</g>
					))
				: null}
		</g>
	);
}

interface PineProps {
	x: number;
	base: number;
	scale: number;
	color: string;
	/* strung with lights and topped with a star once winter comes */
	festive?: boolean;
}

/* a folk eight-pointed star, the kind carried at Christmas */
const STAR = Array.from({ length: 16 }, (_, i) => {
	const radius = i % 2 ? 2.9 : 7.4;
	const angle = (i / 16) * Math.PI * 2 - Math.PI / 2;
	return `${(Math.cos(angle) * radius).toFixed(1)},${(Math.sin(angle) * radius).toFixed(1)}`;
}).join(" ");

/* bulbs draped along both tiers */
const BULBS: [number, number, string][] = [
	[-15, 11, "#ffd54a"],
	[-8, 4.5, "#e8544a"],
	[0, 10, "#4aa9e0"],
	[8, 4, "#6fd07a"],
	[15, 10.5, "#ffd54a"],
	[-13, 27, "#e8544a"],
	[-6.5, 21, "#ffd54a"],
	[0, 26.5, "#6fd07a"],
	[6.5, 20.5, "#4aa9e0"],
	[13, 26.5, "#e8544a"],
];

function Pine({ x, base, scale, color, festive = false }: PineProps) {
	return (
		<g transform={`translate(${x} ${base}) scale(${scale}) translate(0 -46)`}>
			<rect x={-4} y={30} width={8} height={16} fill='#6b4a33' />
			<polygon points='0,-32 22,18 -22,18' fill={color} />
			<polygon points='0,-10 18,32 -18,32' fill={color} />
			{festive ? (
				<>
					<g className='pine-lights'>
						<path
							d='M-15,11 Q-11,5 -8,4.5 Q-4,8 0,10 Q4,6 8,4 Q12,7 15,10.5'
							stroke='#5c6b52'
							strokeWidth={0.7}
							fill='none'
						/>
						<path
							d='M-13,27 Q-10,21 -6.5,21 Q-3,25 0,26.5 Q3,22 6.5,20.5 Q10,24 13,26.5'
							stroke='#5c6b52'
							strokeWidth={0.7}
							fill='none'
						/>
						{BULBS.map(([bx, by, tone], index) => (
							<circle
								key={index}
								className='pine-light'
								cx={bx}
								cy={by}
								r={1.7}
								fill={tone}
								style={{ "--bulb-delay": `${(index * 0.31).toFixed(2)}s` } as CSSProperties}
							/>
						))}
					</g>
					<g className='pine-star' transform='translate(0 -37)'>
						<circle className='star-glow' r={11} fill='#ffd54a' opacity={0.35} />
						<polygon points={STAR} fill='#ffd54a' />
						<polygon points={STAR} fill='none' stroke='#e0a92a' strokeWidth={0.5} />
						<circle r={2} fill='#fff3c4' />
						<circle r={0.9} fill='#e0a92a' />
					</g>
				</>
			) : null}
			<g className='snow-cap' fill='#fbfdff'>
				<polygon points='0,-32 9.5,-10.5 4,-13 0,-9.5 -4,-13 -9.5,-10.5' />
				<polygon points='0,-10 8.4,9.6 3.6,7.2 0,10 -3.6,7.2 -8.4,9.6' />
				<polygon points='-22,18 -14,18 -17,15.5' />
				<polygon points='22,18 14,18 17,15.5' />
			</g>
		</g>
	);
}

/* ------------------------------------------------------- meadow litter */

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
type FlowerKind = "daisy" | "poppy" | "cornflower" | "buttercup";
interface Flower {
	x: number;
	y: number;
	scale: number;
	kind: FlowerKind;
	lean: number;
	delay: number;
}
interface Litter {
	specks: Speck[];
	snowdrops: Snowdrop[];
	tufts: Tuft[];
	flowers: Flower[];
}

const SPECK_COLORS = ["#e8c547", "#e39a3b", "#d9b44a", "#c9762f", "#e0b347"];
const FLOWER_KINDS: FlowerKind[] = ["daisy", "daisy", "poppy", "cornflower", "buttercup", "buttercup"];

/* Planting on a jittered grid rather than pure chance: evenly spaced columns across
   the whole width, a few rows down the meadow, each nudged a little so the pattern
   doesn't show. Pure random placement left whole stretches bare. */
const plantGrid = (
	random: () => number,
	columns: number,
	rows: number,
	top: (x: number) => number,
	bottom: (x: number) => number,
	margin: [number, number],
	plant: (x: number, y: number) => void,
) => {
	const step = 1600 / columns;
	for (let column = 0; column < columns; column += 1) {
		for (let row = 0; row < rows; row += 1) {
			const x = Math.min(1590, Math.max(10, (column + 0.5) * step + between(random, -0.35, 0.35) * step));
			const low = top(x) + margin[0];
			const high = bottom(x) - margin[1];
			if (high <= low) continue;
			plant(x, low + (high - low) * ((row + between(random, 0.15, 0.85)) / rows));
		}
	}
};

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

const BACK_LITTER = scatter(
	11,
	70,
	(x) => backRidgeAt(x),
	(x) => midRidgeAt(x),
	0.7,
	22,
	2,
);
const MID_LITTER = scatter(
	23,
	44,
	(x) => midRidgeAt(x),
	(x) => riverTopAt(x),
	0.85,
	20,
	2,
);
const FRONT_LITTER = scatter(
	37,
	96,
	(x) => frontRidgeAt(x),
	() => 898,
	1.1,
	18,
	3,
);

const GRASS = ["#3f8a4f", "#4c9a58", "#5aa862"];

function FlowerHead({ kind }: { kind: FlowerKind }) {
	switch (kind) {
		case "daisy":
			return (
				<>
					{[0, 72, 144, 216, 288].map((angle) => (
						<ellipse key={angle} cx={0} cy={-1.5} rx={0.8} ry={1.4} fill='#fbfbf6' transform={`rotate(${angle})`} />
					))}
					<circle r={0.9} fill='#f2c230' />
				</>
			);
		case "poppy":
			return (
				<>
					<circle r={2.1} fill='#d8352a' />
					<circle cx={-0.6} cy={-0.6} r={0.9} fill='#ea5a4a' />
					<circle r={0.6} fill='#2b1a1a' />
				</>
			);
		case "cornflower":
			return (
				<>
					{[0, 60, 120, 180, 240, 300].map((angle) => (
						<ellipse key={angle} cx={0} cy={-1.3} rx={0.6} ry={1.2} fill='#4a72d8' transform={`rotate(${angle})`} />
					))}
					<circle r={0.6} fill='#2c3f94' />
				</>
			);
		case "buttercup":
			return (
				<>
					<circle r={1.5} fill='#f2c62f' />
					<circle cx={-0.4} cy={-0.5} r={0.5} fill='#fbe58a' />
				</>
			);
	}
}

function MeadowLitter({ specks, snowdrops, tufts, flowers }: Litter) {
	return (
		<>
			{tufts.map((tuft, index) => (
				<path
					key={index}
					className='grass'
					d='M0,0 Q-1.5,-4 -4,-7 M0,0 Q-0.5,-5 -0.8,-9.5 M0,0 Q1,-5 2.6,-8.5 M0,0 Q2.5,-3 5.2,-5'
					transform={`translate(${tuft.x.toFixed(1)} ${tuft.y.toFixed(1)}) scale(${(tuft.flip * tuft.scale).toFixed(2)} ${tuft.scale.toFixed(2)})`}
					stroke={GRASS[tuft.shade]}
					strokeWidth={1.1}
					strokeLinecap='round'
					fill='none'
				/>
			))}
			{flowers.map((flower, index) => (
				<g
					key={index}
					transform={`translate(${flower.x.toFixed(1)} ${flower.y.toFixed(1)}) scale(${flower.scale.toFixed(2)})`}
				>
					<g className='summer-flower' style={{ "--bloom-delay": `${flower.delay.toFixed(1)}s` } as CSSProperties}>
						<g transform={`rotate(${flower.lean.toFixed(1)})`}>
							<path d='M0,0 Q0.8,-4 0,-8' stroke='#4a8a45' strokeWidth={0.7} fill='none' strokeLinecap='round' />
							<path d='M0.2,-3 Q2.2,-4.2 2.8,-2.6 Q1.4,-2.2 0.2,-3 Z' fill='#56984e' />
							<g transform='translate(0 -8.4)'>
								<FlowerHead kind={flower.kind} />
							</g>
						</g>
					</g>
				</g>
			))}
			{specks.map((speck, index) => (
				<ellipse
					key={index}
					className='meadow-leaf'
					cx={speck.x}
					cy={speck.y}
					rx={speck.rx}
					ry={speck.ry}
					transform={`rotate(${speck.angle} ${speck.x} ${speck.y})`}
					fill={speck.color}
				/>
			))}
			{snowdrops.map((flower, index) => (
				<g key={index} transform={`translate(${flower.x} ${flower.y}) scale(${flower.scale})`}>
					<g className='snowdrop' style={{ "--bloom-delay": `${flower.delay}s` } as CSSProperties}>
						<path d='M0,0 C0,-5 0.5,-9 3,-11.5' stroke='#4f8a4a' strokeWidth={0.9} fill='none' strokeLinecap='round' />
						<path d='M-0.5,0 C-2.5,-3 -2.5,-6 -1.5,-8.5 C-0.8,-5.5 -0.3,-3 -0.5,0 Z' fill='#5d9a55' />
						<ellipse cx={3.6} cy={-8.6} rx={1.7} ry={2.7} fill='#fbfdff' />
						<circle cx={3.2} cy={-11.2} r={0.8} fill='#6aa85f' />
					</g>
				</g>
			))}
		</>
	);
}

/* ------------------------------------------------------------- meadows */

const hill = (ridge: string) => `${ridge} L1600,900 L0,900 Z`;
interface MeadowProps {
	season: Season;
}

/* the big light meadow above the river, with the upper row of trees */
export function BackMeadow({ season }: MeadowProps) {
	return (
		<>
			<path className='hill hill-back' d={hill(BACK_RIDGE)} fill='#9fd8a0' />
			<MeadowLitter {...BACK_LITTER} />
			{[150, 600, 1060, 1390].map((x) => (
				<Pine key={x} x={x} base={onBackRidge(x)} scale={0.45} color='#7fc084' />
			))}
			<Pine x={264} base={529} scale={0.8} color='#5aa473' />
			<Pine x={684} base={581} scale={0.9} color='#5aa473' />
			<Pine x={864} base={525} scale={0.8} color='#5aa473' />
			<Tree kind='apple' {...APPLE_TREE} tone='far' season={season} seed={101} />
			<Tree kind='birch' {...BIRCH_TREE} tone='far' season={season} seed={202} />
			{/* the household's plot, up at the top of the slope and left of the хати */}
			<WheatField season={season} />
			<Village />
			{/* the dead tree between the хати, with its nest */}
			<StorkTree season={season} />
			{/* nearer than the хата, so it stands in front of it — and in winter it is
			    the one the household dresses up */}
			<Pine x={1232} base={566} scale={0.85} color='#5aa473' festive />
			<Tree kind='maple' x={1525} base={onBackMeadow(1525)} scale={0.9} tone='far' season={season} seed={303} />
		</>
	);
}

/* drawn after the upper critters, so the hare and the hedgehog can hide in it */
export function UpperBush({ season }: MeadowProps) {
	return <Tree kind='bush' {...UPPER_BUSH} tone='far' season={season} seed={707} />;
}

export function MidMeadow() {
	return (
		<>
			<path className='hill hill-mid' d={hill(MID_RIDGE)} fill='#74c08a' />
			<MeadowLitter {...MID_LITTER} />
		</>
	);
}

interface FrontMeadowProps extends MeadowProps {
	/* whatever walks the meadow behind its trees */
	behindTrees?: ReactNode;
}

/* the meadow below the river, with the lower row of trees */
export function FrontMeadow({ season, behindTrees }: FrontMeadowProps) {
	return (
		<>
			<path className='hill hill-front' d={hill(FRONT_RIDGE)} fill='#4f9e6e' />
			<MeadowLitter {...FRONT_LITTER} />
			{behindTrees}
			{LOWER_PINES.map((pine) => (
				<Pine key={pine.x} {...pine} color='#3d8459' />
			))}
			{/* a weathered stump, rings and all */}
			<g transform={`translate(${STUMP.x} ${STUMP.base}) scale(${STUMP.scale})`}>
				<path
					d='M-9.5,0 C-10.5,-6 -10,-12 -9,-14.6 L9,-14.6 C10,-12 10.5,-6 9.5,0 C4,1.6 -4,1.6 -9.5,0 Z'
					fill='#7a5a3c'
				/>
				<path
					d='M-9,-14.6 C-9.6,-11 -9.2,-5 -8.4,-0.6 C-6.6,0 -4.6,0.4 -2.6,0.6 C-3.6,-4.4 -4,-9.6 -3.6,-14.6 Z'
					fill='#6a4c31'
				/>
				<ellipse cx={0} cy={-14.8} rx={9.2} ry={3.4} fill='#c4a271' />
				<ellipse cx={0} cy={-14.8} rx={6} ry={2.2} fill='none' stroke='#a8875a' strokeWidth={0.7} />
				<ellipse cx={0} cy={-14.8} rx={3} ry={1.1} fill='none' stroke='#a8875a' strokeWidth={0.6} />
				<path d='M-11.6,0.4 C-10.4,-2.4 -9.8,-3.6 -9.4,-4.6 C-8.6,-2.6 -8.4,-1 -8.6,0.6 Z' fill='#6a4c31' />
				<path d='M11.6,0.6 C10.4,-2 9.8,-3.4 9.4,-4.4 C8.6,-2.4 8.4,-0.8 8.6,0.8 Z' fill='#6a4c31' />
			</g>
			<Tree kind='bush' {...LOWER_BUSH} tone='near' season={season} seed={808} />
			<Tree kind='cherry' {...CHERRY_TREE} tone='near' season={season} seed={404} />
			<Tree kind='oak' {...OAK_TREE} tone='near' season={season} seed={505} />
			<Tree kind='rowan' {...ROWAN_TREE} tone='near' season={season} seed={606} />
		</>
	);
}
