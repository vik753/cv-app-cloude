import type { Season } from "@/widgets/scene/model/useDayNightCycle";
import { show, useCycleFrame } from "@/widgets/scene/model/useSceneClock";
import { lerp } from "@/widgets/scene/lib/choreography";
import { BANDS, BIND_LAG, FIELD, fieldRow, mownAt } from "@/widgets/scene/lib/landscape";
import { seededRandom } from "@/shared/lib";
import { useRef } from "react";

/* The household's plot of wheat at the top of the slope.

   Nothing on it appears from nowhere: what is sown in spring comes up as green
   shoots the same afternoon, stands higher and turns from green to gold across the
   summer day, is mown and bound through the autumn one, and lies bare under the
   snow. Height and colour are two CSS custom properties set on the crop once a
   frame — the stalks read them, so the whole field grows and ripens for the cost of
   a couple of style writes.

   The plot is laid out in rows of depth and bands of width. A band is the strip the
   mower takes with him as he works along it, so cutting one in autumn is a matter
   of hiding it. Neighbouring bands are cut from the same edge curves, so however
   the borders ripple, no gap ever opens between them. */

const ROWS = 8;
/* each row of a band is broken into this many clumps, and a clump leans as one: it
   keeps the number of things the browser has to animate down to something sensible */
const CLUMPS = 3;
const NEAR = FIELD.cropFrom / FIELD.depth;
const FAR = FIELD.cropTo / FIELD.depth;

/* A deterministic ripple. The edge of a sown plot is never dead straight, and
   because both bands that meet on a boundary read the same curve, their polygons
   always agree on where it runs. */
const ripple = (x: number, seed: number) =>
	Math.sin(x * 0.085 + seed) * 1.6 + Math.sin(x * 0.031 + seed * 2.3) * 2.3 + Math.sin(x * 0.17 + seed * 0.7) * 0.8;

const rowAt = (t: number) => fieldRow(t * FIELD.depth);
/* how far the ground wanders off the straight row, blending from the near edge's
   ripple to the far edge's as you go up the plot */
const wander = (x: number, t: number) => lerp(ripple(x, 1.2), ripple(x, 4.7), (t - NEAR) / (FAR - NEAR));
const groundAt = (x: number, t: number) => rowAt(t).y + wander(x, t);

/* the two ends of the plot are ragged; the boundaries inside it are not */
const boundaryX = (b: number, t: number) => {
	const row = rowAt(t);
	const x = row.from + ((row.to - row.from) * b) / BANDS;
	if (b === 0) return x + 4 + ripple(t * 260, 7.1) * 1.8;
	if (b === BANDS) return x - 4 + ripple(t * 260, 2.9) * 1.8;
	return x;
};

/* One stalk: a stem, a spindle of grain, and the awns standing off the top of it.
   Three of them make a tuft, written into a single path, so the crop costs one node
   per tuft rather than one per stalk. */
const stalk = (dx: number, dy: number, s: number) => {
	const p = (x: number, y: number) => `${(dx + x * s).toFixed(2)},${(dy + y * s).toFixed(2)}`;
	return (
		`M${p(-0.28, 0)} L${p(0.28, 0)} L${p(0.22, -4.2)} ` +
		`C${p(1, -4.6)} ${p(1.15, -6)} ${p(1, -7)} ` +
		`C${p(0.8, -8)} ${p(0.35, -8.8)} ${p(0, -9.6)} ` +
		`C${p(-0.35, -8.8)} ${p(-0.8, -8)} ${p(-1, -7)} ` +
		`C${p(-1.15, -6)} ${p(-1, -4.6)} ${p(-0.22, -4.2)} Z ` +
		`M${p(-0.15, -9.2)} L${p(0.55, -12.6)} L${p(0.15, -9.1)} Z ` +
		`M${p(0.1, -9.3)} L${p(-0.5, -12.8)} L${p(-0.2, -9.1)} Z ` +
		`M${p(0.34, -8.7)} L${p(1.3, -11.7)} L${p(0.6, -8.5)} Z ` +
		`M${p(-0.38, -8.7)} L${p(-1.2, -11.5)} L${p(-0.62, -8.5)} Z`
	);
};
const TUFT = `${stalk(-1.9, 0.4, 0.8)} ${stalk(0, 0, 1)} ${stalk(1.8, 0.5, 0.86)}`;

interface Tuft {
	x: number;
	y: number;
	scale: number;
	tone: number;
}
interface Clump {
	tufts: Tuft[];
	delay: number;
}

/* green while it is coming up, gold once it has ripened; the crop eases between the
   two across the summer day */
const GREEN = ["#8fbf55", "#7fae4a", "#9acb62", "#76a544", "#87b950"];
const GOLD = ["#e0b855", "#d8a93f", "#e8c46a", "#cfa043", "#d9b14b"];
const BASE = ["#7aa94a", "#c9a14a"];

/* Just the sown part of the plot, which is what the stubble covers once it is cut.
   It is built from the same edge curves as the bands and pushed a little way out
   past them, so the worked ground follows the crop instead of framing it with a
   straight line. */
const CROP_PATH = (() => {
	const near: string[] = [];
	const far: string[] = [];
	for (let i = 0; i <= BANDS * 3; i += 1) {
		const nx = lerp(boundaryX(0, NEAR) - 5, boundaryX(BANDS, NEAR) + 5, i / (BANDS * 3));
		const fx = lerp(boundaryX(0, FAR) - 5, boundaryX(BANDS, FAR) + 5, i / (BANDS * 3));
		near.push(`${nx.toFixed(1)},${(groundAt(nx, NEAR) + 3.5).toFixed(1)}`);
		far.push(`${fx.toFixed(1)},${(groundAt(fx, FAR) - 3.5).toFixed(1)}`);
	}
	return `M${near.join(" L")} L${far.reverse().join(" L")} Z`;
})();

const BASES: string[] = [];
const CROP: Clump[][] = Array.from({ length: BANDS }, () => [] as Clump[]);
/* what the scythe leaves: the bottom of the same stalks, laid out on the same rows
   and drawn under the crop, so a band that is cut uncovers its own stubble */
const STUBBLE: Tuft[] = [];
{
	const random = seededRandom(4207);
	const EDGE = 5;
	for (let b = 0; b < BANDS; b += 1) {
		/* the band's ground: along the near edge, up its right side, back along the
		   far edge, both of them following the ripple */
		const near: string[] = [];
		const far: string[] = [];
		for (let i = 0; i <= EDGE; i += 1) {
			const nx = lerp(boundaryX(b, NEAR), boundaryX(b + 1, NEAR), i / EDGE);
			const fx = lerp(boundaryX(b, FAR), boundaryX(b + 1, FAR), i / EDGE);
			near.push(`${nx.toFixed(1)},${groundAt(nx, NEAR).toFixed(1)}`);
			far.push(`${fx.toFixed(1)},${groundAt(fx, FAR).toFixed(1)}`);
		}
		BASES.push(`M${near.join(" L")} L${far.reverse().join(" L")} Z`);

		/* and its stalks, a row at a time, with a thinner row below the near edge and
		   one above the far one, so the crop frays into the grass instead of stopping
		   on a line */
		for (let r = -1; r <= ROWS; r += 1) {
			const edge = r < 0 || r > ROWS - 1;
			const t = lerp(NEAR - 0.05, FAR + 0.05, (r + 1) / (ROWS + 1));
			const up = (t - NEAR) / (FAR - NEAR);
			const scale = 1.06 - up * 0.44;
			const from = boundaryX(b, t) - (edge ? 0 : 1.5);
			const span = boundaryX(b + 1, t) + (edge ? 0 : 1.5) - from;
			for (let c = 0; c < CLUMPS; c += 1) {
				const width = span / CLUMPS;
				const left = from + width * c;
				const count = Math.max(1, Math.round((width / (4.2 + up * 2.6)) * (edge ? 0.45 : 1)));
				const tufts: Tuft[] = [];
				for (let i = 0; i < count; i += 1) {
					const x = left + ((i + 0.5) * width) / count + (random() - 0.5) * 3;
					tufts.push({
						x,
						y: groundAt(x, t) + (random() - 0.5) * 1.6,
						scale: scale * (0.86 + random() * 0.3),
						tone: Math.floor(random() * GOLD.length),
					});
				}
				CROP[b].push({ tufts, delay: random() * 4.2 });
				if (!edge) tufts.forEach((tuft) => STUBBLE.push({ ...tuft, scale: tuft.scale * (0.16 + random() * 0.08) }));
			}
		}
	}
}

/* a sheaf: the cut stalks of one band, stood on end and tied round the middle, so
   it splays at the butt and again at the ears */
function Sheaf({ x, y, scale }: { x: number; y: number; scale: number }) {
	return (
		<g transform={`translate(${x} ${y}) scale(${scale})`}>
			<path d='M-4.4,0 C-3,-5 -3.4,-9.6 -4.8,-13.8 L-3,-14.2 C-2,-10 -1.8,-5.2 -2,0 Z' fill='#cfa043' />
			<path d='M-2.1,0 C-1.6,-5.4 -1,-9.6 -0.6,-14.6 L0.8,-14.6 C1.2,-9.6 1.8,-5.4 2.3,0 Z' fill='#e0b855' />
			<path d='M2,0 C1.8,-5.2 2,-10 3,-14.2 L4.8,-13.8 C3.4,-9.6 3,-5 4.4,0 Z' fill='#d8a93f' />
			<path d='M-2.7,-7.6 C-0.9,-8.4 0.9,-8.4 2.7,-7.6 L2.7,-5.7 C0.9,-6.5 -0.9,-6.5 -2.7,-5.7 Z' fill='#b98b33' />
		</g>
	);
}

/* a sunflower on the headland, head turned the way of the sun */
function Sunflower({ x, y, scale }: { x: number; y: number; scale: number }) {
	return (
		<g transform={`translate(${x} ${y}) scale(${scale})`}>
			<path d='M-0.5,0 C-0.9,-6 -0.6,-11 0.2,-15.4 L1.2,-15.3 C0.6,-11 0.4,-6 0.6,0 Z' fill='#4f8a3a' />
			<path d='M-0.6,-5.6 C-3.4,-7.4 -4.6,-9.4 -4.4,-11 C-2.4,-10.4 -0.8,-8.6 -0.2,-6.4 Z' fill='#56984e' />
			<path d='M0.4,-9.4 C3,-10.6 4.6,-12.4 4.6,-14 C2.6,-13.8 1.2,-12.4 0.4,-10.6 Z' fill='#4f8a3a' />
			<g transform='translate(0.8 -16.6)'>
				{Array.from({ length: 11 }, (_, i) => (
					<ellipse
						key={i}
						cx={0}
						cy={-3}
						rx={1.05}
						ry={2.3}
						fill={i % 2 ? "#f0c02a" : "#e8a81f"}
						transform={`rotate(${(i * 360) / 11})`}
					/>
				))}
				<circle cx={0} cy={0} r={1.9} fill='#6b4a2f' />
				<circle cx={0} cy={0} r={1.1} fill='#5a3b24' />
			</g>
		</g>
	);
}

/* a shrub on the headland; it goes dull in autumn and under the snow in winter */
function Shrub({ x, y, scale, leaf, dark }: { x: number; y: number; scale: number; leaf: string; dark: string }) {
	return (
		<g transform={`translate(${x} ${y}) scale(${scale})`}>
			<ellipse cx={-3.2} cy={-2.8} rx={4} ry={3.3} fill={dark} />
			<ellipse cx={3.2} cy={-3.2} rx={4.3} ry={3.6} fill={leaf} />
			<ellipse cx={0} cy={-5.4} rx={4.5} ry={3.9} fill={leaf} />
			<ellipse cx={-1.4} cy={-4} rx={2.6} ry={2.4} fill={dark} opacity={0.55} />
		</g>
	);
}

/* The headland round the plot: what grows on ground nobody ploughs. Depth is
   measured the way the rows are, so a negative one is out on the grass below it. */
const SUNFLOWERS: [number, number, number][] = [
	[872, 3, 1],
	[886, -2, 0.88],
	[901, 10, 0.8],
	[893, 22, 0.66],
	[1199, 1, 0.96],
	[1212, -3, 0.9],
	[1187, 9, 0.78],
	[1176, 24, 0.64],
	[1032, -4, 0.72],
	[963, -5, 0.68],
];
const SHRUBS: [number, number, number][] = [
	[866, -4, 1.1],
	[880, 16, 0.85],
	[906, 34, 0.7],
	[1218, -3, 1.05],
	[1203, 14, 0.84],
	[1166, 36, 0.68],
	[1082, 46, 0.72],
	[956, 47, 0.66],
];
const TURF: [number, number, number][] = [
	[884, -6, 0.62],
	[912, -5, 0.5],
	[948, -6, 0.56],
	[1004, -5, 0.48],
	[1064, -6, 0.58],
	[1116, -5, 0.5],
	[1160, -6, 0.6],
	[1206, -5, 0.54],
	[898, 26, 0.44],
	[1184, 30, 0.46],
	[1020, 47, 0.4],
	[1120, 46, 0.42],
];

/* towards evening the bound sheaves are carted off */
const CARTED = 0.55;

/* how tall the crop stands, and how far it has turned from green to gold */
const growth = (season: Season, f: number): [number, number] => {
	if (season === "spring") return [Math.max(0, Math.min(0.2, (f - 0.24) * 0.5)), 0];
	if (season === "summer")
		return [Math.min(1, 0.2 + Math.max(0, f - 0.04) * 1.6), Math.max(0, Math.min(1, (f - 0.3) / 0.3))];
	return [1, 1];
};

const mix = (from: string, to: string, t: number) => {
	const channel = (at: number) =>
		Math.round(lerp(parseInt(from.slice(at, at + 2), 16), parseInt(to.slice(at, at + 2), 16), t))
			.toString(16)
			.padStart(2, "0");
	return `#${channel(1)}${channel(3)}${channel(5)}`;
};

interface FieldProps {
	season: Season;
}

export function WheatField({ season }: FieldProps) {
	/* the variables go on the whole field, so the headland's sunflowers come up with
	   the crop rather than only the crop itself */
	const field = useRef<SVGGElement>(null);
	const bands = useRef<(SVGGElement | null)[]>([]);
	const sheaves = useRef<(SVGGElement | null)[]>([]);
	const ripeness = useRef(-1);
	const height = useRef(-1);
	const autumn = season === "autumn";
	const sown = season !== "winter";

	useCycleFrame((f) => {
		const [grow, ripe] = growth(season, f);
		/* both are quantised, so the colours are only mixed when they actually move */
		const shade = Math.round(ripe * 48);
		if (field.current && shade !== ripeness.current) {
			ripeness.current = shade;
			const t = shade / 48;
			GOLD.forEach((gold, i) => field.current?.style.setProperty(`--ear-${i}`, mix(GREEN[i], gold, t)));
			field.current.style.setProperty("--field-base", mix(BASE[0], BASE[1], t));
		}
		const tall = Math.round(grow * 100);
		if (field.current && tall !== height.current) {
			height.current = tall;
			field.current.style.setProperty("--grow", (tall / 100).toFixed(2));
			/* the flat ground of the crop comes in with it, so bare soil shows between
			   the shoots while they are still short */
			field.current.style.setProperty("--field-cover", Math.min(1, (tall / 100) * 1.2).toFixed(2));
		}

		for (let b = 0; b < BANDS; b += 1) {
			const standing = { current: bands.current[b] };
			const sheaf = { current: sheaves.current[b] };
			if (!autumn) {
				show(standing, 1);
				show(sheaf, 0);
				continue;
			}
			const mown = mownAt(b);
			show(standing, f < mown ? 1 : 0);
			/* the sheaf stands once the women have come along and bound it */
			show(sheaf, f < mown + BIND_LAG ? 0 : Math.max(0, Math.min(1, (CARTED + 0.04 - f) / 0.04)));
		}
	});

	/* Ploughed earth in spring and the pale stubble the scythe leaves in autumn. In
	   summer the soil only shows under the crop while it is still coming up. */
	const soil = season === "winter" ? "#e6eef5" : season === "spring" ? "#6b4f38" : autumn ? "#c6ae7e" : "#8a6b44";
	const furrow = season === "winter" ? "#d8e4ee" : autumn ? "#a38a58" : "#5b4230";
	/* the worked ground is the same shape the year round: only what is sown on it
	   changes, so the plot never seems to grow or shrink between seasons */
	const furrowFrom = FIELD.cropFrom + 2;
	const furrowTo = FIELD.cropTo - 2;
	const leaf = season === "winter" ? "#e8eef4" : autumn ? "#9c8a3e" : season === "spring" ? "#5aa85c" : "#4f8a4a";
	const leafDark = season === "winter" ? "#d5e1ec" : autumn ? "#7c6b2e" : season === "spring" ? "#47944c" : "#3f7a3f";

	return (
		<g className='wheat-field' ref={field}>
			<path className='field-soil' d={CROP_PATH} fill={soil} />
			{Array.from({ length: 7 }, (_, i) => {
				const row = fieldRow(furrowFrom + (i * (furrowTo - furrowFrom)) / 6);
				return (
					<path
						key={i}
						d={`M${row.from + 4},${row.y} L${row.to - 4},${row.y}`}
						stroke={furrow}
						strokeWidth={0.7}
						opacity={0.35}
					/>
				);
			})}
			{autumn
				? STUBBLE.map((tuft, i) => (
						<g
							key={i}
							transform={`translate(${tuft.x.toFixed(1)} ${tuft.y.toFixed(1)}) scale(${tuft.scale.toFixed(2)})`}
						>
							<path d={TUFT} fill='#b39a62' />
						</g>
					))
				: null}

			{/* the headland behind the plot, so the crop has something to end against */}
			{SHRUBS.filter(([, depth]) => depth > 12).map(([x, depth, scale]) => (
				<Shrub key={x} x={x} y={FIELD.nearY - depth} scale={scale} leaf={leaf} dark={leafDark} />
			))}

			{sown ? (
				<g className='field-crop'>
					{CROP.map((clumps, b) => (
						<g
							key={b}
							ref={(node) => {
								bands.current[b] = node;
							}}
						>
							<path className='field-base' d={BASES[b]} fill='var(--field-base)' />
							{clumps.map((clump, c) => (
								/* the placing is an attribute on the outer group, and the lean and the
								   growth a CSS transform on the inner one, because a CSS transform
								   would otherwise win over the attribute and drop the clump on the
								   origin */
								<g key={c} className='wheat-tuft' style={{ animationDelay: `${clump.delay.toFixed(2)}s` }}>
									{clump.tufts.map((tuft, i) => (
										<g
											key={i}
											transform={`translate(${tuft.x.toFixed(1)} ${tuft.y.toFixed(1)}) scale(${tuft.scale.toFixed(2)})`}
										>
											<path d={TUFT} fill={`var(--ear-${tuft.tone})`} />
										</g>
									))}
								</g>
							))}
						</g>
					))}
				</g>
			) : null}

			{/* one sheaf stands where each band fell, set a little way into the stubble
			    and not quite in line with its neighbours */}
			{autumn
				? Array.from({ length: BANDS }, (_, b) => {
						const depth = FIELD.cropFrom + 7 + (b % 3) * 5;
						const row = fieldRow(depth);
						const span = (row.to - row.from) / BANDS;
						return (
							<g
								key={b}
								opacity={0}
								ref={(node) => {
									sheaves.current[b] = node;
								}}
							>
								<Sheaf x={row.from + span * (b + 0.42 + (b % 2) * 0.22)} y={row.y} scale={1.15 - depth / 220} />
							</g>
						);
					})
				: null}

			{/* and the headland in front of it */}
			{SHRUBS.filter(([, depth]) => depth <= 12).map(([x, depth, scale]) => (
				<Shrub key={x} x={x} y={FIELD.nearY - depth} scale={scale} leaf={leaf} dark={leafDark} />
			))}
			{TURF.map(([x, depth]) => (
				<path
					key={`${x}-${depth}`}
					className='grass'
					d='M0,0 Q-1.5,-4 -4,-7 M0,0 Q-0.5,-5 -0.8,-9.5 M0,0 Q1,-5 2.6,-8.5 M0,0 Q2.5,-3 5.2,-5'
					transform={`translate(${x} ${FIELD.nearY - depth}) scale(0.55)`}
					stroke='#4c9a58'
					strokeWidth={1.1}
					strokeLinecap='round'
					fill='none'
				/>
			))}
			{/* the sunflowers come up with the crop and stand through the harvest */}
			{season === "summer" || autumn ? (
				<g className='field-grown'>
					{SUNFLOWERS.map(([x, depth, scale]) => (
						<Sunflower key={x} x={x} y={FIELD.nearY - depth} scale={scale} />
					))}
				</g>
			) : null}
		</g>
	);
}
