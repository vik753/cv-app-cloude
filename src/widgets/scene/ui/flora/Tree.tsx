import type { Season } from "@/widgets/scene/lib/season";
import type { Point } from "@/widgets/scene/lib/landscape";
import { between } from "@/widgets/scene/ui/flora/planting";
import { seededRandom } from "@/shared/lib";
import type { CSSProperties } from "react";

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

export function Tree({ kind, x, base, scale, tone, season, seed }: TreeProps) {
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
