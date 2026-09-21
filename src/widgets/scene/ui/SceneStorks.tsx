import type { Season } from "@/widgets/scene/model/useDayNightCycle";
import { set, show, TAU, useCycleFrame } from "@/widgets/scene/model/useSceneClock";
import { HOMESTEAD } from "@/widgets/scene/lib/landscape";
import { useRef } from "react";

/* A dead tree stands between the хати with a stork nest on its crown. The pair come
   back in spring, raise a chick through the summer — one of them always off after
   food and back again — and in autumn they leave with the first wedge going south.
   All of it by day; at night the family just sits up there. */

const TREE = { x: 1418, base: HOMESTEAD.near.base, scale: 1.05 };
/* where the nest sits, in scene coordinates */
const NEST = { x: TREE.x, y: TREE.base - 96 * TREE.scale };

interface Hop {
	f: number;
	x: number;
	y: number;
}

/* straight-line interpolation between timed points of a flight */
const flightAt = (track: Hop[], f: number) => {
	if (f < track[0].f || f > track[track.length - 1].f) return null;
	const i = track.findIndex((hop, index) => index < track.length - 1 && f >= hop.f && f < track[index + 1].f);
	if (i < 0) return null;
	const from = track[i];
	const to = track[i + 1];
	const t = (f - from.f) / (to.f - from.f);
	return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t, dx: to.x - from.x };
};

const OFF_RIGHT = 1760;

/* spring: they arrive, then the endless trips for food begin */
const ARRIVAL: Hop[] = [
	{ f: 0.1, x: OFF_RIGHT, y: 300 },
	{ f: 0.14, x: 1560, y: 372 },
	{ f: 0.168, x: NEST.x + 8, y: NEST.y - 10 },
];

/* out for food and back, twice over the day */
const ERRANDS: Hop[] = [
	{ f: 0.205, x: NEST.x + 6, y: NEST.y - 8 },
	{ f: 0.245, x: OFF_RIGHT, y: 330 },
	{ f: 0.3, x: OFF_RIGHT, y: 330 },
	{ f: 0.338, x: NEST.x + 8, y: NEST.y - 10 },
	{ f: 0.36, x: NEST.x + 8, y: NEST.y - 10 },
	{ f: 0.4, x: OFF_RIGHT, y: 344 },
	{ f: 0.45, x: OFF_RIGHT, y: 344 },
	{ f: 0.487, x: NEST.x + 8, y: NEST.y - 10 },
];

/* autumn: the whole family lifts off to join the wedge going over */
const DEPARTURE: Hop[] = [
	{ f: 0.3, x: NEST.x, y: NEST.y - 6 },
	{ f: 0.34, x: 1560, y: 300 },
	{ f: 0.38, x: OFF_RIGHT + 120, y: 250 },
];

function FlyingStork({ wing }: { wing: React.RefObject<SVGGElement | null> }) {
	return (
		<>
			<path d='M-9,1 L-19,3.2 M-9,1.6 L-19,3.8' stroke='#d8553a' strokeWidth={0.9} strokeLinecap='round' fill='none' />
			<path d='M-10,0 L-16.4,-1.8 L-15.2,2 Z' fill='#e9e9e4' />
			<path
				d='M-10,0 C-6,-3.2 2,-3.6 7,-2.2 L13.6,-1.2 C14.8,-0.7 14.8,0.7 13.6,1.2 L7,2.2 C2,3.2 -6,2.8 -10,0 Z'
				fill='#f7f7f4'
			/>
			<path
				d='M12,-0.9 C16,-2 20,-2.4 22.6,-2.6'
				stroke='#f7f7f4'
				strokeWidth={1.7}
				fill='none'
				strokeLinecap='round'
			/>
			<circle cx={23.2} cy={-2.8} r={1.5} fill='#f7f7f4' />
			<path d='M24.4,-3.2 L31.6,-2.2 L24.4,-1.4 Z' fill='#d8553a' />
			<circle cx={22.6} cy={-3.4} r={0.4} fill='#2a2a2a' />
			<g ref={wing}>
				<path d='M-2,-1 C1.6,-8.4 7.6,-11.6 12,-10.6 C8.4,-6.4 4,-2.4 1.6,-0.2 Z' fill='#fbfbf8' />
				<path d='M7.6,-10 C9.6,-10.4 11.2,-10.6 12,-10.6 C9.6,-8 7.6,-5.8 5.6,-4 Z' fill='#2f2f33' />
			</g>
		</>
	);
}

export function StorkTree({ season }: { season: Season }) {
	const flier = useRef<SVGGElement>(null);
	const flierWing = useRef<SVGGElement>(null);
	const sitter = useRef<SVGGElement>(null);
	const sitterNeck = useRef<SVGGElement>(null);
	const mate = useRef<SVGGElement>(null);
	const chick = useRef<SVGGElement>(null);
	const heading = useRef<1 | -1>(-1);

	useCycleFrame((f, seconds) => {
		if (season === "winter") {
			show(flier, 0);
			show(sitter, 0);
			show(mate, 0);
			show(chick, 0);
			return;
		}

		const spring = season === "spring";
		const autumn = season === "autumn";
		const track = spring ? (f < 0.19 ? ARRIVAL : ERRANDS) : autumn && f >= 0.3 ? DEPARTURE : ERRANDS;
		const flight = flightAt(track, f);
		const gone = autumn && f >= 0.38;

		/* one of them is out after food; the other keeps the nest */
		show(flier, flight && !gone ? 1 : 0);
		if (flight) {
			if (Math.abs(flight.dx) > 0.5) heading.current = flight.dx > 0 ? 1 : -1;
			const scale = 0.72;
			set(flier, `translate(${flight.x.toFixed(1)} ${flight.y.toFixed(1)}) scale(${heading.current * scale} ${scale})`);
			set(flierWing, `rotate(${(Math.sin(seconds * 3.2 * TAU) * 26).toFixed(1)} 0 -1)`);
		}

		/* the sitter is there whenever it is not off flying with the rest */
		const nestKeeper = !gone && !(spring && f < 0.168);
		show(sitter, nestKeeper ? 1 : 0);
		show(mate, nestKeeper && (!flight || (autumn && f >= 0.3)) ? 1 : 0);
		/* a chick from late spring on, and bigger company after that */
		show(chick, !gone && ((spring && f > 0.33) || season === "summer" || (autumn && f < 0.3)) ? 1 : 0);

		/* head down to the chick just after a return, otherwise the odd bill-clatter */
		const feeding = flight === null && ((spring && f > 0.34) || season === "summer") && Math.sin(seconds * 0.4) > 0.3;
		const clatter = !feeding && Math.sin(seconds * 0.7) > 0.86;
		set(sitterNeck, `rotate(${feeding ? 54 : clatter ? -16 : -2 + Math.sin(seconds * 0.5) * 3} 2 -6)`);
	});

	return (
		<g className='storks'>
			{/* the dead tree: bare limbs, a couple of them broken off */}
			<g transform={`translate(${TREE.x} ${TREE.base}) scale(${TREE.scale})`}>
				<path d='M-4.6,0 C-3.4,-30 -2.6,-60 -2,-92 L2.4,-92 C2.6,-60 3.4,-30 4.6,0 Z' fill='#8a7a68' />
				<path d='M-4.6,0 C-3.4,-30 -2.6,-60 -2,-92 L0,-92 C-0.4,-60 -1,-30 -1.4,0 Z' fill='#6f6153' />
				<g stroke='#8a7a68' strokeWidth={3} strokeLinecap='round' fill='none'>
					<path d='M-2.4,-64 C-12,-70 -18,-78 -20,-86' />
					<path d='M2.6,-56 C12,-60 19,-66 22,-74' />
					<path d='M-2.2,-40 C-9,-44 -13,-50 -15,-56' />
					<path d='M2.4,-30 C9,-33 13,-38 15,-43' />
				</g>
				<g stroke='#8a7a68' strokeWidth={1.6} strokeLinecap='round' fill='none'>
					<path d='M-20,-86 L-26,-92 M-20,-86 L-24,-80 M22,-74 L28,-79 M22,-74 L26,-68 M-15,-56 L-20,-60 M15,-43 L20,-46' />
				</g>
				{/* the nest, built up over many years */}
				<g transform='translate(0 -92)'>
					<path d='M-16,2 C-16,-6 16,-6 16,2 C10,5 -10,5 -16,2 Z' fill='#7a6349' />
					<g stroke='#5e4c37' strokeWidth={0.9} strokeLinecap='round'>
						<path d='M-14,-1 L-4,-2.6 M-8,1.4 L4,-0.6 M-2,2 L12,-1.4 M-13,-3.4 L0,-4 M2,-3.6 L14,-1.6' />
					</g>
					<g stroke='#8a7159' strokeWidth={0.8} strokeLinecap='round'>
						<path d='M-18,0.4 L-12,-2 M16.4,0 L11,-2.6 M-6,-5 L2,-5.2' />
					</g>
					<g className='snow-cap' fill='#fbfdff'>
						<path d='M-15.4,-2.6 C-9,-5.6 9,-5.6 15.4,-2.6 C9,-4.6 -9,-4.6 -15.4,-2.6 Z' />
					</g>
				</g>
			</g>

			{/* the one that keeps the nest, and the chick in it */}
			<g ref={sitter} opacity={0} transform={`translate(${NEST.x - 5} ${NEST.y})`}>
				<path d='M-1,0 L-1.4,7 M2,0 L2.4,7' stroke='#d8553a' strokeWidth={1} strokeLinecap='round' fill='none' />
				<ellipse cx={0.6} cy={-3.4} rx={6.4} ry={4.2} fill='#f7f7f4' />
				<path d='M-5.4,-4.6 C-2.6,-6.4 2.6,-6.4 5.4,-4.4 C2.6,-3 -2.4,-3 -5.4,-4.6 Z' fill='#e4e4df' />
				<path d='M-6.4,-2.6 C-4,-1 -1,-0.4 1.6,-0.6 C-1,0.8 -4.4,0.4 -6.4,-1 Z' fill='#2f2f33' />
				<g ref={sitterNeck}>
					<path
						d='M3,-6 C6.4,-8.4 7.4,-12.6 6.6,-16'
						stroke='#f7f7f4'
						strokeWidth={2}
						fill='none'
						strokeLinecap='round'
					/>
					<circle cx={6.4} cy={-16.8} r={1.7} fill='#f7f7f4' />
					<path d='M7.6,-17.4 L15,-16.6 L7.6,-15.6 Z' fill='#d8553a' />
					<circle cx={5.8} cy={-17.4} r={0.45} fill='#2a2a2a' />
				</g>
			</g>
			<g ref={mate} opacity={0} transform={`translate(${NEST.x + 8} ${NEST.y + 1})`}>
				<ellipse cx={0} cy={-3} rx={5.6} ry={3.6} fill='#f2f2ee' />
				<path d='M-5,-3.8 C-2.4,-5.2 2.4,-5.2 5,-3.6 C2.4,-2.4 -2.4,-2.4 -5,-3.8 Z' fill='#e4e4df' />
				<path d='M-5.6,-2 C-3.4,-0.8 -0.8,-0.4 1.4,-0.6 C-0.8,0.6 -3.8,0.2 -5.6,-0.6 Z' fill='#2f2f33' />
				<path
					d='M2.6,-5 C5.4,-7 6.4,-10 5.8,-12.6'
					stroke='#f2f2ee'
					strokeWidth={1.8}
					fill='none'
					strokeLinecap='round'
				/>
				<circle cx={5.6} cy={-13.2} r={1.5} fill='#f2f2ee' />
				<path d='M6.6,-13.8 L13,-13 L6.6,-12.2 Z' fill='#d8553a' />
			</g>
			{/* off to one side, where it is not hidden behind its parent */}
			<g ref={chick} opacity={0} transform={`translate(${NEST.x - 12} ${NEST.y + 2})`}>
				<ellipse cx={0} cy={-2.6} rx={3.4} ry={2.6} fill='#fbfbf8' />
				<circle cx={2} cy={-5.4} r={1.9} fill='#fbfbf8' />
				<path d='M3.2,-5.8 L7.4,-5.2 L3.2,-4.6 Z' fill='#e08b6a' />
				<circle cx={1.6} cy={-6} r={0.4} fill='#2a2a2a' />
			</g>

			<g ref={flier} opacity={0}>
				<FlyingStork wing={flierWing} />
			</g>
		</g>
	);
}

/* --- the wedge going over in autumn, high in the sky --- */
const WEDGE = [
	{ x: 0, y: 0 },
	{ x: -26, y: -13 },
	{ x: -52, y: -26 },
	{ x: -24, y: 14 },
	{ x: -48, y: 28 },
	{ x: -74, y: 42 },
];

export function StorkWedge() {
	return (
		<div className='stork-wedge' aria-hidden='true'>
			{WEDGE.map((bird, index) => (
				<svg
					key={index}
					className='wedge-bird'
					viewBox='-20 -14 56 28'
					style={{ left: `${bird.x}px`, top: `${bird.y}px`, animationDelay: `${(index * 0.13).toFixed(2)}s` }}
				>
					<path d='M-8,0 C-4,-2.6 2,-3 6,-1.8 L12,-1 C13,-0.6 13,0.6 12,1 L6,1.8 C2,3 -4,2.6 -8,0 Z' fill='#f7f7f4' />
					<path
						d='M10.6,-0.8 C13.6,-1.6 16,-2 18,-2.2'
						stroke='#f7f7f4'
						strokeWidth={1.4}
						fill='none'
						strokeLinecap='round'
					/>
					<path d='M19,-2.6 L25,-2 L19,-1.4 Z' fill='#d8553a' />
					<path
						d='M-7,1 L-15,2.6 M-7,1.4 L-15,3'
						stroke='#d8553a'
						strokeWidth={0.7}
						strokeLinecap='round'
						fill='none'
					/>
					<path className='wedge-wing' d='M-1,-1 C2,-7 7,-9.6 10.6,-8.8 C7.4,-5.2 3.6,-2 1.6,-0.2 Z' fill='#fbfbf8' />
					<path
						className='wedge-wing'
						d='M6.6,-8.2 C8.4,-8.6 9.8,-8.8 10.6,-8.8 C8.4,-6.6 6.6,-4.6 4.8,-3.2 Z'
						fill='#2f2f33'
					/>
				</svg>
			))}
		</div>
	);
}
