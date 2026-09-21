import {
	APPLE_TREE,
	BIRCH_TREE,
	LOWER_BUSH,
	STUMP,
	STUMP_SEAT,
	HOMESTEAD,
	KENNEL,
	LOWER_COVER,
	UPPER_BUSH,
	lowerGround,
	upperGround,
	type Point,
} from "@/services/landscape";
import { SnowChildren, Snowman, YardChildren } from "@/components/SceneChildren";
import { FieldFolk } from "@/components/SceneFieldFolk";
import { Revellers } from "@/components/SceneRevellers";
import { HomesteadFence } from "@/components/SceneVillage";
import type { Season } from "@/hooks/useDayNightCycle";
import { ease, lerp, onRoute, presence, set, show, TAU, useCycleFrame, type Waypoint } from "@/hooks/useSceneClock";
import { useRef, type Ref, type RefObject } from "react";

/* The critters are choreographed against the day: 0 is dawn, 0.1–0.4 full day,
   0.5 dusk, 0.6–0.9 night, then dawn again. The clock is read straight off the
   sky's own CSS animation, so they can never drift out of step with it. Poses are
   written to the DOM every frame; React only renders the drawings once. */
type Mode =
	| "hidden"
	| "walk"
	| "run"
	| "trot"
	| "stand"
	| "look"
	| "sit"
	| "hop"
	| "gnaw"
	| "listen"
	| "crouch"
	| "pounce"
	| "dive"
	| "shake"
	| "forage"
	| "sniff"
	| "rest"
	| "sleep"
	| "mark"
	| "smoke"
	| "laugh";

interface Segment {
	until: number;
	mode: Mode;
	x: [number, number];
	/* depth below the ridge (lower meadow) or in front of the tree line (upper) */
	d?: [number, number];
	facing: 1 | -1;
	hops?: number;
}

const locate = (segments: Segment[], f: number) => {
	let start = 0;
	for (const segment of segments) {
		if (f < segment.until) return { segment, p: (f - start) / (segment.until - start) };
		start = segment.until;
	}
	return null;
};

/* Each lower critter is drawn twice, once behind the lower trees and once in front
   of them, and only one copy shows: the one behind whenever its paws stand further
   up the hill than the base of a tree it overlaps. That is what lets it slip behind
   a pine and come out on the other side. */
type Layer = "back" | "front";
const layerAt = (x: number, y: number, halfWidth: number): Layer =>
	LOWER_COVER.some((cover) => Math.abs(x - cover.x) < cover.reach + halfWidth && y < cover.base) ? "back" : "front";

/* four legs: near hind, far hind, near front, far front */
function legSwing(mode: Mode, seconds: number): [number, number, number, number] {
	const rate = mode === "run" ? 3.6 : mode === "trot" ? 2.8 : mode === "walk" ? 1.8 : 0;
	if (!rate) return [0, 0, 0, 0];
	const amp = mode === "run" ? 38 : mode === "trot" ? 28 : 22;
	const s = Math.sin(seconds * rate * TAU) * amp;
	return [s, -s, -s, s];
}

interface LimbProps {
	ref: Ref<SVGGElement>;
	x: number;
}

function WolfLeg({ ref, x, fill }: LimbProps & { fill: string }) {
	return (
		<g transform={`translate(${x} -14)`}>
			<g ref={ref}>
				<path d='M-2.2,0 L2.2,0 L1.5,13.4 L-1.5,13.4 Z' fill={fill} />
				<path d='M-1.8,12.6 L3.2,12.8 C3.8,13.8 3.1,14.4 2,14.4 L-1.8,14.4 Z' fill={fill} />
			</g>
		</g>
	);
}

function FoxLeg({ ref, x, far }: LimbProps & { far: boolean }) {
	return (
		<g transform={`translate(${x} -10)`}>
			<g ref={ref}>
				<path d='M-1.6,0 L1.6,0 L1.1,9.6 L-1.1,9.6 Z' className={far ? "fox-leg-far" : "fox-leg"} />
				<path
					d='M-1.3,9 L2.4,9.1 C2.9,9.9 2.4,10.4 1.6,10.4 L-1.3,10.4 Z'
					className={far ? "fox-leg-far" : "fox-leg"}
				/>
			</g>
		</g>
	);
}

/* One head for both poses: a broad muzzle, upright ears, amber eyes. */
function WolfHead({ ref, song }: { ref: Ref<SVGGElement>; song: Ref<SVGGElement> }) {
	return (
		<g ref={ref}>
			<path d='M1.4,-8.4 L3.6,-17.4 L8.2,-9.4 Z' fill='#5f6772' />
			<ellipse cx={5} cy={-4.6} rx={7.2} ry={6.2} className='wolf-fur' />
			<path d='M3.4,-8 L6.6,-18.4 L11.8,-7.6 Z' className='wolf-fur' />
			<path d='M5.4,-8.6 L7,-14.8 L9.8,-8.2 Z' fill='#4a5059' />
			<path
				d='M7.6,-6 C12.6,-6.6 19.4,-4.6 21.6,-2.4 C22.8,-1.2 22.2,0.8 20,1 L11,1.8 C8.4,1.4 7.2,-0.6 7.6,-2.8 Z'
				fill='#cdd3da'
			/>
			<ellipse cx={20.9} cy={-2.2} rx={1.9} ry={1.5} fill='#2b2b30' />
			<path
				d='M19.4,0.6 C17,1.9 13.6,1.9 11.6,0.9'
				stroke='#2b2b30'
				strokeWidth={0.6}
				fill='none'
				strokeLinecap='round'
			/>
			<g stroke='#4a5059' strokeWidth={0.4} strokeLinecap='round' opacity={0.6}>
				<path d='M10.6,-1.6 L5,-3.4 M11,-0.2 L5.2,-0.6 M11.2,1 L5.8,2.2' />
			</g>
			<ellipse cx={5.4} cy={-5.4} rx={2.1} ry={1.8} fill='#f0b53c' />
			<ellipse cx={6} cy={-5.4} rx={0.85} ry={1.5} fill='#2b2b30' />
			<circle cx={6.4} cy={-6} r={0.35} fill='#fbfdff' />
			<path
				d='M2.6,-8.4 C3.8,-9.4 6.6,-9.4 7.8,-8.2'
				stroke='#5f6772'
				strokeWidth={0.7}
				fill='none'
				strokeLinecap='round'
			/>
			<g ref={song} opacity={0} fill='none' stroke='#e8ecf6' strokeWidth={1.1} strokeLinecap='round'>
				<path d='M25,-6 q3,3 0,6' />
				<path d='M28.5,-8.5 q4.6,5.5 0,11' />
				<path d='M32,-11 q6.4,8 0,16' />
			</g>
		</g>
	);
}

/* ================================================================ wolf */

/* lower meadow at night: follows a scent trail in wide curves between the trees,
   slipping behind some and passing in front of others, stops to sniff the pine and
   the bush and to look around, then sits and howls at the moon, and bolts at dawn */
const WOLF: Waypoint<Mode>[] = [
	{ f: 0, x: LOWER_BUSH.x + 4, d: 74, mode: "hidden" },
	{ f: 0.612, x: LOWER_BUSH.x + 12, d: 80, mode: "walk" },
	{ f: 0.644, x: 502, d: 90, mode: "walk" },
	{ f: 0.662, x: 548, d: 94, mode: "sniff", facing: 1 },
	{ f: 0.678, x: 548, d: 94, mode: "walk" },
	{ f: 0.708, x: STUMP.x - 22, d: 100, mode: "walk" },
	/* up onto the stump, and there he stays for most of the night */
	{ f: 0.724, x: STUMP.x - 5, d: STUMP_SEAT, mode: "sit" },
	{ f: 0.902, x: STUMP.x - 5, d: STUMP_SEAT, mode: "sit" },
	{ f: 0.922, x: STUMP.x - 24, d: 100, mode: "walk" },
	{ f: 0.968, x: LOWER_BUSH.x + 14, d: 82, mode: "walk" },
	{ f: 0.99, x: LOWER_BUSH.x + 4, d: 74, mode: "hidden" },
	{ f: 1, x: LOWER_BUSH.x + 4, d: 74, mode: "hidden" },
];

/* three long howls while the moon sails past overhead */
const HOWLS: [number, number][] = [
	[0.744, 0.778],
	[0.802, 0.838],
	[0.86, 0.896],
];

function Wolf({ layer }: { layer: Layer }) {
	const root = useRef<SVGGElement>(null);
	const body = useRef<SVGGElement>(null);
	const head = useRef<SVGGElement>(null);
	const tail = useRef<SVGGElement>(null);
	const song = useRef<SVGGElement>(null);
	const walkRig = useRef<SVGGElement>(null);
	const seatRig = useRef<SVGGElement>(null);
	const seatHead = useRef<SVGGElement>(null);
	const seatSong = useRef<SVGGElement>(null);
	const seatTail = useRef<SVGGElement>(null);
	const hindNear = useRef<SVGGElement>(null);
	const hindFar = useRef<SVGGElement>(null);
	const foreNear = useRef<SVGGElement>(null);
	const foreFar = useRef<SVGGElement>(null);
	const heading = useRef<1 | -1>(1);

	useCycleFrame((f, seconds) => {
		const legs = [hindNear, hindFar, foreNear, foreFar];
		const at = onRoute(WOLF, f);
		if (!at || at.mode === "hidden") {
			show(root, 0);
			return;
		}
		const { x, d, p, mode } = at;
		if (Math.abs(at.dx) > 0.05) heading.current = at.dx > 0 ? 1 : -1;
		else if (at.facing) heading.current = at.facing;
		let facing = heading.current;
		if (mode === "look") facing = (p < 0.33 ? facing : p < 0.66 ? -facing : facing) as 1 | -1;
		const scale = 0.98 + d / 420;
		const y = lowerGround(x) + d;

		show(root, layerAt(x, y, 22 * scale) === layer ? presence(f, 0.6, 0.96, 0.004) : 0);
		set(root, `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${facing * scale} ${scale})`);

		const swing = legSwing(mode, seconds);
		const sitting = mode === "sit";
		const howl = HOWLS.find(([from, to]) => f >= from && f < to);
		/* how far the head is thrown back through a howl */
		const cry = howl ? Math.sin(Math.min(1, ((f - howl[0]) / (howl[1] - howl[0])) * 1.25) * Math.PI) : 0;

		/* Sitting up on the stump is a pose of its own, drawn separately: on his
		   haunches, upright, one hind leg crossed over the other. */
		show(walkRig, sitting ? 0 : 1);
		show(seatRig, sitting ? 1 : 0);
		if (sitting) {
			set(seatHead, `rotate(${(-16 - cry * 34).toFixed(1)})`);
			show(seatSong, cry);
			show(song, 0);
			set(seatTail, `rotate(${(Math.sin(seconds * 1.1) * 5).toFixed(1)})`);
			set(body, "");
			return;
		}

		const tilt = mode === "run" ? Math.sin(seconds * 3.6 * TAU) * 3 : mode === "sniff" ? 5 : 0;
		set(body, `rotate(${tilt.toFixed(2)} -13 -14)`);
		set(legs[0], `rotate(${swing[0].toFixed(1)})`);
		set(legs[1], `rotate(${swing[1].toFixed(1)})`);
		set(legs[2], `rotate(${swing[2].toFixed(1)})`);
		set(legs[3], `rotate(${swing[3].toFixed(1)})`);

		let headAngle = 0;
		if (mode === "walk") headAngle = 16 + Math.sin(seconds * 2.4) * 7;
		/* nose to the ground, in short quick sniffs */
		else if (mode === "sniff") headAngle = 34 + Math.max(0, Math.sin(seconds * 13)) * 5;
		else if (mode === "look") headAngle = -8 + Math.sin(p * TAU * 1.5) * 6;
		else if (mode === "run") headAngle = 6;
		set(head, `rotate(${headAngle.toFixed(1)})`);
		show(song, 0);
		const wag = mode === "run" ? 18 : mode === "sniff" ? 4 + Math.sin(seconds * 6) * 12 : 8 + Math.sin(seconds * 2) * 6;
		set(tail, `rotate(${wag.toFixed(1)})`);
	});

	return (
		<g ref={root} className='critter wolf' opacity={0}>
			{/* on all fours */}
			<g ref={walkRig}>
				<g ref={body}>
					<g transform='translate(-19.5 -20.5)'>
						<g ref={tail}>
							<path
								d='M0,0 C-7,1.4 -13.6,6 -16.6,13 C-16.6,15.6 -13,16.6 -10.6,13.4 C-8,9 -3.4,5.4 1.4,3.2 Z'
								className='wolf-fur'
							/>
							<path d='M-16.6,13 C-16.6,15.6 -13,16.6 -10.6,13.4 C-12,12.8 -14.4,12 -15.6,10.8 Z' fill='#cdd3da' />
						</g>
					</g>
					<WolfLeg ref={hindFar} x={-12} fill='#5f6772' />
					<WolfLeg ref={foreFar} x={13} fill='#5f6772' />
					<path
						d='M-20.5,-17 C-22.5,-24.5 -12,-28 -1,-27 C9,-26.4 17,-27.4 20.5,-23 C23.5,-19 21,-12 14,-12 L-13,-12 C-18.5,-12 -21,-14 -20.5,-17 Z'
						className='wolf-fur'
					/>
					<path d='M-2,-27 C7,-29.2 15,-29.6 20.4,-24 C13,-26.6 4,-25.8 -2,-25 Z' fill='#5f6772' />
					<path d='M-13,-12 C-4,-10.2 6,-10.2 13.6,-12 L12,-14.6 L-13,-14.6 Z' fill='#cdd3da' />
					<WolfLeg ref={hindNear} x={-14} fill='#7a828d' />
					<WolfLeg ref={foreNear} x={11} fill='#7a828d' />
					<g transform='translate(16.5 -23.5)'>
						<WolfHead ref={head} song={song} />
					</g>
				</g>
			</g>

			{/* and sitting up on the stump, one leg over the other */}
			<g ref={seatRig} opacity={0}>
				<g transform='translate(-6 -3)'>
					<g ref={seatTail}>
						<path d='M0,0 C-5,3.6 -8.4,9 -8,14 C-6,9.6 -3,5.6 1,3 Z' className='wolf-fur' />
						<path d='M-8,14 C-7.4,11.6 -6.4,9.4 -5.2,7.4 C-6.6,9.8 -7.6,12 -8,14 Z' fill='#cdd3da' />
					</g>
				</g>
				{/* the far hind leg hangs off the stump, the near one crosses it */}
				<path d='M-2.6,-6 C1.6,-4.6 6.6,-2 9.4,0.8 L5.6,3.8 C2.4,1.2 -1.6,-0.8 -4.2,-1.8 Z' fill='#5f6772' />
				<ellipse cx={8.6} cy={2.2} rx={3} ry={2} fill='#5f6772' />
				<ellipse cx={-2} cy={-4.6} rx={8.4} ry={5.4} className='wolf-fur' />
				<path d='M-6.6,-4.6 C-9.4,-14.6 -6.6,-24.6 0,-26.6 C6.6,-24.6 9.4,-14.6 6.6,-4.6 Z' className='wolf-fur' />
				<path d='M-2.4,-6.6 C-1.4,-14.6 -0.4,-20.2 0.6,-23.2 C3,-18.6 3.4,-10.6 2.8,-6 Z' fill='#cdd3da' />
				<path d='M-3.4,-8.6 C1.2,-7 6.4,-4.4 9.2,-1.6 L5.4,1.6 C2,-1.2 -2.2,-3.2 -5,-4.2 Z' fill='#7a828d' />
				<ellipse cx={8.4} cy={0} rx={3.2} ry={2.1} fill='#7a828d' />
				{/* front paws folded on his lap */}
				<path d='M1.6,-10.6 C4.4,-9.8 6,-8 6,-6.2 L1.4,-6 C0.4,-7.2 0.4,-9.4 1.6,-10.6 Z' fill='#7a828d' />
				<path d='M-4.6,-11 C-2.2,-10.2 -0.8,-8.6 -0.8,-7 L-5,-6.8 C-5.8,-8 -5.8,-9.8 -4.6,-11 Z' fill='#5f6772' />
				<g transform='translate(0 -26.4)'>
					<WolfHead ref={seatHead} song={seatSong} />
				</g>
			</g>
		</g>
	);
}

/* ================================================================= fox */

/* the same meadow by day: trots in from the right weaving between the trees,
   stops to sniff the pine, the oak and the cherry, and on the way freezes to listen
   for a mouse under the grass (or the snow), leaps and dives nose-first */
const FOX: Waypoint<Mode>[] = [
	{ f: 0.14, x: 1700, d: 60, mode: "trot" },
	{ f: 0.15, x: 1570, d: 74, mode: "trot" },
	{ f: 0.157, x: 1480, d: 86, mode: "trot" },
	{ f: 0.165, x: 1330, d: 66, mode: "trot" },
	{ f: 0.17, x: 1266, d: 46, mode: "sniff", facing: -1 },
	{ f: 0.182, x: 1266, d: 46, mode: "trot" },
	{ f: 0.19, x: 1160, d: 90, mode: "trot" },
	{ f: 0.196, x: 1060, d: 108, mode: "trot" },
	{ f: 0.199, x: 1036, d: 104, mode: "sniff", facing: -1 },
	{ f: 0.209, x: 1036, d: 104, mode: "trot" },
	{ f: 0.217, x: 930, d: 76, mode: "trot" },
	{ f: 0.221, x: 910, d: 70, mode: "listen", facing: -1 },
	{ f: 0.235, x: 910, d: 70, mode: "crouch", facing: -1 },
	{ f: 0.241, x: 910, d: 70, mode: "pounce", facing: -1 },
	{ f: 0.253, x: 850, d: 72, mode: "dive", facing: -1 },
	{ f: 0.265, x: 850, d: 72, mode: "shake", facing: -1 },
	{ f: 0.273, x: 850, d: 72, mode: "trot" },
	{ f: 0.283, x: 740, d: 96, mode: "trot" },
	{ f: 0.295, x: 600, d: 78, mode: "trot" },
	{ f: 0.304, x: 480, d: 90, mode: "trot" },
	{ f: 0.313, x: 400, d: 88, mode: "trot" },
	{ f: 0.322, x: 300, d: 58, mode: "trot" },
	{ f: 0.332, x: 180, d: 92, mode: "trot" },
	{ f: 0.336, x: 116, d: 96, mode: "sniff", facing: -1 },
	{ f: 0.347, x: 116, d: 96, mode: "trot" },
	{ f: 0.364, x: -90, d: 70, mode: "hidden" },
];

/* winter coat: thick and bushy; summer coat: lean, the tail almost thin */
const FOX_COAT: Record<Season, { tail: number; body: number }> = {
	summer: { tail: 0.78, body: 0.94 },
	autumn: { tail: 1.05, body: 1.02 },
	winter: { tail: 1.32, body: 1.12 },
	spring: { tail: 0.9, body: 0.98 },
};

function Fox({ season, layer }: { season: Season; layer: Layer }) {
	const root = useRef<SVGGElement>(null);
	const body = useRef<SVGGElement>(null);
	const coat = useRef<SVGGElement>(null);
	const head = useRef<SVGGElement>(null);
	const tail = useRef<SVGGElement>(null);
	const puff = useRef<SVGGElement>(null);
	const hindNear = useRef<SVGGElement>(null);
	const hindFar = useRef<SVGGElement>(null);
	const foreNear = useRef<SVGGElement>(null);
	const foreFar = useRef<SVGGElement>(null);
	const heading = useRef<1 | -1>(-1);

	useCycleFrame((f, seconds) => {
		const legs = [hindNear, hindFar, foreNear, foreFar];
		const at = onRoute(FOX, f);
		if (!at || at.mode === "hidden") {
			show(root, 0);
			show(puff, 0);
			return;
		}
		const { x, d, p, mode } = at;
		if (Math.abs(at.dx) > 0.05) heading.current = at.dx > 0 ? 1 : -1;
		else if (at.facing) heading.current = at.facing;
		const facing = heading.current;
		const scale = 0.96 + d / 500;
		const y = lowerGround(x) + d;
		const here = layerAt(x, y, 18 * scale) === layer;
		show(root, here ? presence(f, 0.14, 0.364, 0.004) : 0);

		let lift = 0;
		let tilt = 0;
		let headAngle = 0;
		let legs4 = legSwing(mode, seconds);
		switch (mode) {
			case "trot":
				lift = Math.abs(Math.sin(seconds * 2.8 * TAU)) * -1.2;
				headAngle = 4;
				break;
			case "sniff":
				/* muzzle down along the trunk, tail swishing */
				tilt = 6;
				headAngle = 32 + Math.max(0, Math.sin(seconds * 15)) * 6;
				break;
			case "listen":
				/* head cocked, first one way then the other */
				headAngle = 20 + Math.sin(p * TAU) * 12;
				break;
			case "crouch":
				tilt = -10 * ease(p);
				lift = 2.5 * ease(p);
				headAngle = 18;
				legs4 = [30, 30, -20, -20];
				break;
			case "pounce":
				/* a high arc that ends straight down, nose first */
				lift = -Math.sin(p * Math.PI) * 40;
				tilt = lerp(-38, 72, ease(p));
				headAngle = lerp(-10, 20, p);
				legs4 = [lerp(40, 60, p), lerp(46, 64, p), lerp(-60, -30, p), lerp(-54, -26, p)];
				break;
			case "dive":
				tilt = 74;
				lift = 6;
				headAngle = 20;
				legs4 = [60, 64, -20, -16];
				break;
			case "shake":
				tilt = Math.sin(p * TAU * 5) * 5 * (1 - p);
				headAngle = Math.sin(p * TAU * 5) * 10;
				break;
		}
		set(root, `translate(${x.toFixed(1)} ${(y + lift).toFixed(1)}) scale(${facing * scale} ${scale})`);
		set(body, `rotate(${tilt.toFixed(1)} 0 -10)`);
		legs.forEach((ref, index) => set(ref, `rotate(${legs4[index].toFixed(1)})`));
		set(head, `rotate(${headAngle.toFixed(1)})`);

		const fur = FOX_COAT[season];
		set(coat, `translate(0 -9) scale(1 ${fur.body}) translate(0 9)`);
		const flick =
			mode === "pounce"
				? -30
				: mode === "dive"
					? -44 + Math.sin(seconds * 14) * 10
					: mode === "sniff"
						? -8 + Math.sin(seconds * 5) * 14
						: Math.sin(seconds * 2.8 * TAU) * 5;
		set(tail, `rotate(${flick.toFixed(1)}) scale(${fur.tail})`);

		/* where the nose went in: a burst of snow in winter, grass bits the rest of the year */
		if (here && (mode === "dive" || mode === "shake")) {
			const t = mode === "dive" ? p * 0.6 : 0.6 + p * 0.4;
			const groundX = x + 30 * facing * scale;
			set(puff, `translate(${groundX.toFixed(1)} ${y.toFixed(1)}) scale(${(0.4 + t * 1.1).toFixed(2)})`);
			show(puff, Math.sin(Math.min(1, t) * Math.PI) * 0.95);
		} else show(puff, 0);
	});

	return (
		<>
			<g ref={root} className='critter fox' opacity={0}>
				<g ref={body}>
					<g transform='translate(-15 -14)'>
						<g ref={tail}>
							<path d='M0,0 C-8,-2 -16,0 -21,5 C-24,8 -22,11.5 -18,10.5 C-12,8.5 -6,5.5 1,3 Z' className='fox-fur' />
							<path d='M-18,10.5 C-22,11.5 -24,8 -21,5 C-20.4,7.4 -19,9.4 -16,9.9 Z' fill='#f7f2ea' />
						</g>
					</g>
					<FoxLeg ref={hindFar} x={-9} far />
					<FoxLeg ref={foreFar} x={11} far />
					<g ref={coat}>
						<path
							d='M-16,-13 C-17,-19 -9,-21 -1,-20 C7,-20 13,-20.5 16,-16 C18,-12 16,-9 10,-9 L-11,-9 C-15,-9 -16,-11 -16,-13 Z'
							className='fox-fur'
						/>
						<path d='M9,-9.3 C13.5,-10 17,-13 16,-16.4 C14,-13.4 12,-11.4 8.4,-10.4 Z' fill='#f7f2ea' />
						<path d='M-10,-9.2 C-3,-8 4,-8 9,-9.2 L8,-10.4 L-9,-10.4 Z' fill='#f1e3d3' opacity={0.8} />
					</g>
					<FoxLeg ref={hindNear} x={-11} far={false} />
					<FoxLeg ref={foreNear} x={9} far={false} />
					<g transform='translate(13 -17)'>
						<g ref={head}>
							<path d='M1.6,-5.6 L2.6,-13.4 L7,-6.4 Z' className='fox-fur' />
							<path d='M2.4,-7 L2.8,-11.6 L5.4,-7.2 Z' fill='#3a2a22' />
							<path
								d='M-2,1 C-2,-5 3,-8 8,-7 L18,-2.2 C19.2,-1 18.2,1 16,1 L8,2 C4,4 -1,4 -2,1 Z'
								className='fox-fur'
							/>
							<path d='M3.4,1 C7.6,3 12.6,2.2 16.4,1 L9,0 Z' fill='#f7f2ea' />
							<circle cx={9} cy={-3.4} r={0.85} fill='#222' />
							<circle cx={18.4} cy={-1.6} r={0.95} fill='#222' />
						</g>
					</g>
				</g>
			</g>
			<g ref={puff} opacity={0} className={`fox-puff fox-puff-${season}`}>
				<circle cx={-6} cy={-5} r={4} />
				<circle cx={0} cy={-9} r={5} />
				<circle cx={6} cy={-5} r={4} />
				<circle cx={-10} cy={-12} r={2} />
				<circle cx={9} cy={-13} r={2.2} />
				<circle cx={2} cy={-17} r={1.6} />
			</g>
		</>
	);
}

/* ================================================================ hare */

/* upper meadow at night: bursts out of the bush, hops to the birch in stops and
   starts, gnaws its bark for most of the night and hops home before dawn */
const HARE: Segment[] = [
	{ until: 0.614, mode: "hidden", x: [UPPER_BUSH.x + 8, UPPER_BUSH.x + 8], facing: -1 },
	{ until: 0.63, mode: "hop", x: [UPPER_BUSH.x + 8, UPPER_BUSH.x - 38], facing: -1, hops: 3 },
	{ until: 0.648, mode: "look", x: [UPPER_BUSH.x - 38, UPPER_BUSH.x - 38], facing: -1 },
	{ until: 0.664, mode: "hop", x: [UPPER_BUSH.x - 38, BIRCH_TREE.x + 14], facing: -1, hops: 3 },
	{ until: 0.858, mode: "gnaw", x: [BIRCH_TREE.x + 14, BIRCH_TREE.x + 14], facing: -1 },
	{ until: 0.872, mode: "look", x: [BIRCH_TREE.x + 14, BIRCH_TREE.x + 14], facing: 1 },
	{ until: 0.894, mode: "hop", x: [BIRCH_TREE.x + 14, UPPER_BUSH.x + 10], facing: 1, hops: 5 },
	{ until: 1, mode: "hidden", x: [UPPER_BUSH.x + 10, UPPER_BUSH.x + 10], facing: 1 },
];

function Hare() {
	const root = useRef<SVGGElement>(null);
	const body = useRef<SVGGElement>(null);
	const head = useRef<SVGGElement>(null);
	const ears = useRef<SVGGElement>(null);
	const hind = useRef<SVGGElement>(null);
	const front = useRef<SVGGElement>(null);
	/* how much bark is gone: grows while she gnaws, and a birch doesn't heal overnight */
	const bark = useRef(0);

	useCycleFrame((f, seconds) => {
		const at = locate(HARE, f);
		if (f > 0.664 && f < 0.858) bark.current = Math.max(bark.current, Math.min(1, (f - 0.664) / 0.12));
		document.getElementById("birch-gnaw")?.setAttribute("opacity", bark.current.toFixed(2));
		if (!at || at.segment.mode === "hidden") {
			show(root, 0);
			return;
		}
		const { segment, p } = at;
		let x = lerp(segment.x[0], segment.x[1], p);
		let lift = 0;
		let tilt = 0;
		let headAngle = 0;
		let earAngle = 0;
		let hindAngle = 0;
		let frontAngle = 0;
		switch (segment.mode) {
			case "hop": {
				/* each hop: push off with the big hind legs, fly, land on the forepaws */
				const hops = segment.hops ?? 3;
				const q = (p * hops) % 1;
				x = lerp(segment.x[0], segment.x[1], (Math.floor(p * hops) + ease(q)) / hops);
				lift = -Math.sin(q * Math.PI) * 9;
				tilt = lerp(-14, 16, q);
				earAngle = 24;
				hindAngle = q < 0.5 ? -40 : 10;
				frontAngle = q < 0.5 ? 30 : -30;
				break;
			}
			case "look":
				headAngle = -6;
				earAngle = Math.sin(seconds * 9) > 0.7 ? -12 : 0;
				break;
			case "gnaw":
				/* up on the haunches against the trunk, head bobbing at the bark */
				tilt = -38;
				lift = -1;
				headAngle = 38 + Math.sin(seconds * 11) * 7;
				earAngle = 16 + Math.sin(seconds * 3) * 6;
				hindAngle = 12;
				frontAngle = -54;
				break;
		}
		show(root, presence(f, 0.614, 0.894, 0.004));
		set(
			root,
			`translate(${x.toFixed(1)} ${(upperGround(x) + 3 + lift).toFixed(1)}) scale(${segment.facing * 0.95} 0.95)`,
		);
		set(body, `rotate(${tilt.toFixed(1)} -4 -4)`);
		set(head, `rotate(${headAngle.toFixed(1)})`);
		set(ears, `rotate(${earAngle.toFixed(1)})`);
		set(hind, `rotate(${hindAngle.toFixed(1)})`);
		set(front, `rotate(${frontAngle.toFixed(1)})`);
	});

	return (
		<g ref={root} className='critter hare' opacity={0}>
			{/* a white hare on white snow: its shadow and outline are what give it away */}
			<ellipse className='hare-shadow' cx={-1} cy={0.6} rx={10} ry={1.8} />
			<g ref={body}>
				<circle cx={-9.6} cy={-9.4} r={2.2} fill='#f6f6f4' />
				<path
					d='M-9,-8 C-11,-14 -4,-17 2,-16 C7,-15 10,-12 9,-8 C8,-5 4,-4 0,-4 L-6,-4 C-9,-4 -10,-6 -9,-8 Z'
					className='hare-fur'
				/>
				<g transform='translate(-5 -5)'>
					<g ref={hind}>
						<path
							d='M-3,-3.4 C-6.6,0 -5,4.4 -1,5 L7,5 C8.2,5 8.2,3.8 7,3.4 L0.6,2.6 C2.4,0 1.4,-3.6 -3,-3.4 Z'
							className='hare-fur'
						/>
					</g>
				</g>
				<g transform='translate(6 -6)'>
					<g ref={front}>
						<path d='M-1,0 L1,0 L0.8,6 L1.8,6.2 L1.8,6.8 L-0.9,6.8 Z' className='hare-fur-dark' />
					</g>
				</g>
				<g transform='translate(8 -13)'>
					<g ref={head}>
						<g transform='translate(1.4 -3.6)'>
							<g ref={ears}>
								<path d='M-1.4,0 C-3.6,-6 -3.4,-12 -1.4,-14 C0.4,-12 0.8,-6 0.6,0 Z' className='hare-fur-dark' />
								<path d='M0.4,0 C-1,-6 -0.4,-12 1.8,-14 C3.4,-12 3,-6 2.4,0 Z' className='hare-fur' />
								<path d='M1.8,-14 C3.4,-12 3.3,-10.4 3,-9.8 C2.2,-11 1.5,-12 0.9,-12.2 Z' fill='#2c2622' />
							</g>
						</g>
						<path d='M-2,1 C-3,-3 1,-6 5,-5 C8,-4 9.2,-1 8,1 C6,3 1,3 -2,1 Z' className='hare-fur' />
						<circle cx={4.8} cy={-2.2} r={0.85} fill='#2a211c' />
						<circle cx={8.4} cy={-0.4} r={0.55} fill='#c98a8a' />
					</g>
				</g>
			</g>
		</g>
	);
}

/* ============================================================ hedgehog */

/* same night: scurries out of the bush, past the hare to the apple tree, spikes a
   fallen apple on its back and trundles home with it. Asleep in the bush all winter. */
const HEDGEHOG: Segment[] = [
	{ until: 0.606, mode: "hidden", x: [UPPER_BUSH.x + 4, UPPER_BUSH.x + 4], facing: -1 },
	{ until: 0.7, mode: "walk", x: [UPPER_BUSH.x + 4, APPLE_TREE.x + 14], facing: -1 },
	{ until: 0.742, mode: "forage", x: [APPLE_TREE.x + 14, APPLE_TREE.x + 8], facing: -1 },
	{ until: 0.752, mode: "stand", x: [APPLE_TREE.x + 8, APPLE_TREE.x + 8], facing: 1 },
	{ until: 0.872, mode: "walk", x: [APPLE_TREE.x + 8, UPPER_BUSH.x + 12], facing: 1 },
	{ until: 1, mode: "hidden", x: [UPPER_BUSH.x + 12, UPPER_BUSH.x + 12], facing: 1 },
];
const PICKUP = 0.728;

/* where the apples land under the tree, in tree-local offsets */
const FALLEN: { dx: number; from: [number, number]; drop: number }[] = [
	{ dx: 10, from: [6, -47], drop: 0.3 },
	{ dx: -8, from: [-12, -40], drop: 0.21 },
	{ dx: 20, from: [14, -37], drop: 0.47 },
];

function Hedgehog({ season }: { season: Season }) {
	const root = useRef<SVGGElement>(null);
	const body = useRef<SVGGElement>(null);
	const carried = useRef<SVGGElement>(null);
	const feet = useRef<SVGGElement>(null);
	const zzz = useRef<SVGGElement>(null);
	const apples = [useRef<SVGGElement>(null), useRef<SVGGElement>(null), useRef<SVGGElement>(null)];
	const falling = [useRef<SVGGElement>(null), useRef<SVGGElement>(null), useRef<SVGGElement>(null)];

	useCycleFrame((f, seconds) => {
		/* late summer drops one apple; autumn drops more */
		const fruiting = season === "summer" || season === "autumn";
		FALLEN.forEach((apple, index) => {
			const active = fruiting && (season === "autumn" || index === 0);
			const drop = season === "autumn" && index === 0 ? 0 : apple.drop;
			const groundY = APPLE_TREE.base + 1.5;
			const groundX = APPLE_TREE.x + apple.dx;
			const picked = index === 0 && f >= PICKUP;
			show(apples[index], active && f >= drop + 0.012 && !picked ? 1 : 0);
			const t = (f - drop) / 0.012;
			if (active && drop > 0 && t >= 0 && t < 1) {
				const sx = APPLE_TREE.x + apple.from[0] * APPLE_TREE.scale;
				const sy = APPLE_TREE.base + apple.from[1] * APPLE_TREE.scale;
				set(falling[index], `translate(${lerp(sx, groundX, t).toFixed(1)} ${lerp(sy, groundY - 2, t * t).toFixed(1)})`);
				show(falling[index], 1);
			} else show(falling[index], 0);
		});

		/* winter: hibernating, snoring in the bush at night */
		show(zzz, season === "winter" ? presence(f, 0.58, 0.95, 0.02) : 0);
		if (season === "winter") {
			show(root, 0);
			return;
		}

		const at = locate(HEDGEHOG, f);
		if (!at || at.segment.mode === "hidden") {
			show(root, 0);
			return;
		}
		const { segment, p } = at;
		const x = lerp(segment.x[0], segment.x[1], p);
		const scurry = segment.mode === "walk";
		const bob = scurry ? Math.abs(Math.sin(seconds * 7 * TAU)) * -0.6 : 0;
		const sniff = segment.mode === "forage" ? Math.max(0, Math.sin(p * TAU * 3)) * 16 : 0;
		show(root, presence(f, 0.606, 0.872, 0.004));
		set(
			root,
			`translate(${x.toFixed(1)} ${(upperGround(x) + 6 + bob).toFixed(1)}) scale(${segment.facing * 0.74} 0.74)`,
		);
		set(body, `rotate(${sniff.toFixed(1)} 6 0)`);
		set(feet, scurry ? `translate(${(Math.sin(seconds * 7 * TAU) * 1.2).toFixed(2)} 0)` : "");
		show(carried, fruiting && f >= PICKUP ? 1 : 0);
	});

	return (
		<>
			{FALLEN.map((_, index) => (
				<g key={index}>
					<g
						ref={apples[index]}
						opacity={0}
						transform={`translate(${APPLE_TREE.x + FALLEN[index].dx} ${APPLE_TREE.base + 1.5})`}
					>
						<circle r={2.5} fill='#d8433a' />
						<circle cx={-0.8} cy={-0.8} r={0.7} fill='#f08a7d' />
					</g>
					<g ref={falling[index]} opacity={0}>
						<circle r={2.5} fill='#d8433a' />
					</g>
				</g>
			))}
			<g ref={root} className='critter hedgehog' opacity={0}>
				<g ref={feet} stroke='#4a3a2e' strokeWidth={1.6} strokeLinecap='round'>
					<path d='M-5,-1 L-5.4,0.6 M-1.5,-1 L-1.8,0.6 M2.5,-1 L2.2,0.6 M6,-1 L5.8,0.6' />
				</g>
				<g ref={body}>
					<path
						d='M-10,-1 L-11,-4.4 L-8.6,-5.2 L-9.6,-8.6 L-6.4,-8.4 L-6.6,-11.6 L-3.2,-10.6 L-2.2,-13.6 L0,-11.4 L2.2,-13.6 L3.2,-10.4 L5.6,-11.4 L5.6,-8 L8,-7.6 L7,-4.6 L8.8,-3.6 L6.6,-1 Z'
						fill='#6b5646'
					/>
					<path
						d='M-7,-3 L-5,-7 M-3,-4 L-1,-9.4 M1,-4 L3,-9 M4,-3 L5.6,-6'
						stroke='#9a846e'
						strokeWidth={0.9}
						strokeLinecap='round'
					/>
					<path d='M5.2,-6.4 C8.4,-6.4 11.4,-4.2 12.4,-2 C12.6,-0.8 11.6,-0.4 10.4,-0.4 L5,-1 Z' fill='#d9c3a0' />
					<circle cx={8.2} cy={-4} r={0.7} fill='#231b16' />
					<circle cx={12.4} cy={-1.8} r={0.8} fill='#231b16' />
					<g ref={carried} opacity={0} transform='translate(-1.2 -14.4)'>
						<circle r={3.4} fill='#d8433a' />
						<circle cx={-1.1} cy={-1.1} r={0.9} fill='#f08a7d' />
						<path d='M0,-3.2 L0.6,-5' stroke='#5a3d25' strokeWidth={0.7} strokeLinecap='round' />
					</g>
				</g>
			</g>
			<g
				ref={zzz}
				opacity={0}
				className='hedgehog-zzz'
				transform={`translate(${UPPER_BUSH.x + 6} ${UPPER_BUSH.base - 20})`}
			>
				<text x={0} y={0}>
					z
				</text>
				<text x={4} y={-6}>
					z
				</text>
				<text x={9} y={-13}>
					Z
				</text>
			</g>
		</>
	);
}

/* ================================================================= dog */

/* The yard dog. Through the day it lies in its kennel with its muzzle out, then
   does the rounds of the хати, sniffing the corners; at one of them it lifts a leg,
   a slipper comes flying out of the window, and it bolts back home. At night it
   sleeps. */
const DOG: Waypoint<Mode>[] = [
	{ f: 0, x: KENNEL.x + 4, d: 20, mode: "rest" },
	{ f: 0.16, x: KENNEL.x + 4, d: 20, mode: "walk" },
	{ f: 0.186, x: 1252, d: 24, mode: "sniff" },
	{ f: 0.212, x: 1252, d: 24, mode: "walk" },
	{ f: 0.246, x: 1404, d: 26, mode: "sniff" },
	{ f: 0.27, x: 1404, d: 26, mode: "walk" },
	{ f: 0.29, x: 1336, d: 22, mode: "mark" },
	{ f: 0.319, x: 1336, d: 22, mode: "run" },
	{ f: 0.347, x: KENNEL.x + 4, d: 20, mode: "rest" },
	{ f: 0.55, x: KENNEL.x + 4, d: 20, mode: "sleep" },
	{ f: 1, x: KENNEL.x + 4, d: 20, mode: "sleep" },
];

/* thrown from the near хата's window at the offending corner */
const SLIPPER = {
	from: [HOMESTEAD.near.x + 2, HOMESTEAD.near.base - 9 * HOMESTEAD.near.scale] as Point,
	to: [1356, upperGround(1356) + 24] as Point,
	start: 0.3,
	land: 0.316,
	gone: 0.36,
};

/* whether the dog is in its kennel at this point of the day */
const dogIsHome = (f: number) => {
	const at = onRoute(DOG, f);
	return at?.mode === "rest" || at?.mode === "sleep";
};

export function Kennel() {
	const muzzle = useRef<SVGGElement>(null);
	const dozing = useRef<SVGGElement>(null);
	const asleep = useRef<SVGGElement>(null);
	const awake = useRef<SVGGElement>(null);
	const head = useRef<SVGGElement>(null);

	useCycleFrame((f, seconds) => {
		const home = dogIsHome(f);
		show(muzzle, home ? 1 : 0);
		if (!home) return;
		const sleeping = onRoute(DOG, f)?.mode === "sleep";
		show(dozing, sleeping ? 1 : 0);
		show(asleep, sleeping ? 1 : 0);
		show(awake, sleeping ? 0 : 1);
		/* breathing, and an ear-twitch now and then while it is awake */
		const breath = Math.sin(seconds * (sleeping ? 0.9 : 1.6)) * 0.03;
		const tilt = sleeping ? 0 : Math.sin(seconds * 0.7) > 0.9 ? 3 : 0;
		set(head, `translate(0 ${(-breath * 2).toFixed(2)}) rotate(${tilt} 0 -2) scale(1 ${(1 + breath).toFixed(3)})`);
	});

	return (
		<g transform={`translate(${KENNEL.x} ${KENNEL.base}) scale(${KENNEL.scale})`}>
			<path d='M-15,0 L-15,-17 L15,-17 L15,0 Z' fill='#9a7248' />
			<g stroke='#7d5a38' strokeWidth={0.8}>
				<path d='M-8,-16.4 L-8,-0.4 M0,-16.4 L0,-0.4 M8,-16.4 L8,-0.4' />
			</g>
			<path d='M-18,-16.6 L0,-29 L18,-16.6 Z' fill='#7d5a38' />
			<path d='M-18,-16.6 L18,-16.6 L18,-14.8 L-18,-14.8 Z' fill='#654a2e' />
			<path d='M-8.4,0 L-8.4,-8.4 C-8.4,-13.4 8.4,-13.4 8.4,-8.4 L8.4,0 Z' fill='#3a2a1c' />
			{/* asleep in there, dreaming away */}
			<g ref={dozing} opacity={0} className='sleep-zzz' transform='translate(6 -31)'>
				<text x={0} y={0}>
					z
				</text>
				<text x={4} y={-6}>
					z
				</text>
				<text x={9} y={-13}>
					Z
				</text>
			</g>

			{/* At home: the whole face fills the doorway, chin down on its front paws —
			    long ears, wide eyes, a broad snout. */}
			<g ref={muzzle} opacity={0}>
				<g ref={head}>
					<path d='M-6,-10.4 C-9.4,-10.2 -10.4,-6 -9,-2 C-7.6,-4.6 -6.6,-7.4 -6.2,-9 Z' fill='#8a4f2c' />
					<path d='M6,-10.4 C9.4,-10.2 10.4,-6 9,-2 C7.6,-4.6 6.6,-7.4 6.2,-9 Z' fill='#8a4f2c' />
					<path d='M-6.6,-3.4 C-7.6,-8.4 -5,-12.4 0,-12.6 C5,-12.4 7.6,-8.4 6.6,-3.4 Z' fill='#a9663c' />
					<path d='M-2.6,-11.6 C-1.4,-12.2 1.4,-12.2 2.6,-11.6 C1.4,-10.8 -1.4,-10.8 -2.6,-11.6 Z' fill='#8a4f2c' />
					<path
						d='M-4.6,-9.6 C-3.8,-10.4 -2.4,-10.4 -1.6,-9.8'
						stroke='#8a4f2c'
						strokeWidth={0.7}
						fill='none'
						strokeLinecap='round'
					/>
					<path
						d='M1.6,-9.8 C2.4,-10.4 3.8,-10.4 4.6,-9.6'
						stroke='#8a4f2c'
						strokeWidth={0.7}
						fill='none'
						strokeLinecap='round'
					/>
					<g ref={awake} opacity={0}>
						<circle cx={-2.9} cy={-8.2} r={1.9} fill='#f6f1e8' />
						<circle cx={2.9} cy={-8.2} r={1.9} fill='#f6f1e8' />
						<circle cx={-2.6} cy={-8} r={1.05} fill='#2a1c14' />
						<circle cx={3.2} cy={-8} r={1.05} fill='#2a1c14' />
						<circle cx={-2.2} cy={-8.5} r={0.35} fill='#fbfdff' />
						<circle cx={3.6} cy={-8.5} r={0.35} fill='#fbfdff' />
					</g>
					<g ref={asleep} opacity={0} stroke='#2a1c14' strokeWidth={0.75} fill='none' strokeLinecap='round'>
						<path d='M-4.2,-8.4 C-3.4,-7.4 -2,-7.4 -1.4,-8.4 M1.4,-8.4 C2,-7.4 3.4,-7.4 4.2,-8.4' />
					</g>
					{/* snout, nose and jowls resting low in the opening */}
					<path
						d='M-3.8,-5.6 C-3.8,-8.4 3.8,-8.4 3.8,-5.6 C3.8,-2.4 2,-1 0,-1 C-2,-1 -3.8,-2.4 -3.8,-5.6 Z'
						fill='#ddb389'
					/>
					<path
						d='M-1.8,-6.8 C-1.8,-8.2 1.8,-8.2 1.8,-6.8 C1.8,-5.6 0.9,-5 0,-5 C-0.9,-5 -1.8,-5.6 -1.8,-6.8 Z'
						fill='#2a1c14'
					/>
					<path d='M0,-4.9 L0,-3.4' stroke='#2a1c14' strokeWidth={0.6} strokeLinecap='round' />
					<path
						d='M0,-3.4 C-0.7,-2.5 -2,-2.6 -2.5,-3.4 M0,-3.4 C0.7,-2.5 2,-2.6 2.5,-3.4'
						stroke='#2a1c14'
						strokeWidth={0.6}
						fill='none'
						strokeLinecap='round'
					/>
				</g>
				{/* the front paws his chin is resting on */}
				<path d='M-6.2,0 L-6.2,-2.4 C-6.2,-3.8 -1.4,-3.8 -1.4,-2.4 L-1.4,0 Z' fill='#a9663c' />
				<path d='M1.4,0 L1.4,-2.4 C1.4,-3.8 6.2,-3.8 6.2,-2.4 L6.2,0 Z' fill='#b87046' />
				<g stroke='#8a4f2c' strokeWidth={0.5} strokeLinecap='round'>
					<path d='M-4.6,-0.2 L-4.6,-2 M-3,-0.2 L-3,-2 M3,-0.2 L3,-2 M4.6,-0.2 L4.6,-2' />
				</g>
			</g>
		</g>
	);
}

function Dog() {
	const root = useRef<SVGGElement>(null);
	const body = useRef<SVGGElement>(null);
	const head = useRef<SVGGElement>(null);
	const tail = useRef<SVGGElement>(null);
	const drops = useRef<SVGGElement>(null);
	const slipper = useRef<SVGGElement>(null);
	const hindNear = useRef<SVGGElement>(null);
	const hindFar = useRef<SVGGElement>(null);
	const foreNear = useRef<SVGGElement>(null);
	const foreFar = useRef<SVGGElement>(null);
	const heading = useRef<1 | -1>(1);

	useCycleFrame((f, seconds) => {
		/* the slipper: an arc out of the window, then it just lies there */
		if (f >= SLIPPER.start && f < SLIPPER.gone) {
			const flying = Math.min(1, (f - SLIPPER.start) / (SLIPPER.land - SLIPPER.start));
			const x = lerp(SLIPPER.from[0], SLIPPER.to[0], flying);
			const y = lerp(SLIPPER.from[1], SLIPPER.to[1], flying) - Math.sin(flying * Math.PI) * 26;
			set(slipper, `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(flying * 520).toFixed(0)})`);
			show(slipper, presence(f, SLIPPER.start, SLIPPER.gone, 0.004));
		} else show(slipper, 0);

		const at = onRoute(DOG, f);
		if (!at || at.mode === "hidden") {
			show(root, 0);
			return;
		}
		const { x, d, p, mode } = at;
		if (Math.abs(at.dx) > 0.05) heading.current = at.dx > 0 ? 1 : -1;
		const facing = heading.current;
		/* home: the walking dog is put away entirely and the kennel shows a muzzle in
		   the doorway instead, so no legs stick out below the walls */
		if (mode === "rest" || mode === "sleep") {
			show(root, 0);
			return;
		}
		show(root, 1);
		set(root, `translate(${x.toFixed(1)} ${(upperGround(x) + d).toFixed(1)}) scale(${facing * 0.8} 0.8)`);

		const swing = legSwing(mode, seconds);
		let legs = swing;
		let tilt = 0;
		let headAngle = 0;
		switch (mode) {
			case "sniff":
				headAngle = 42 + Math.max(0, Math.sin(seconds * 12)) * 6;
				break;
			case "mark":
				/* one hind leg up against the corner */
				headAngle = 8;
				legs = [ease(Math.min(1, p * 6)) * -72, 6, 0, 0];
				break;
			case "run":
				tilt = Math.sin(seconds * 3.6 * TAU) * 4;
				headAngle = -6;
				break;
			case "walk":
				headAngle = 6 + Math.sin(seconds * 2.2) * 4;
				break;
		}
		set(body, `rotate(${tilt.toFixed(1)} -8 -8)`);
		set(hindNear, `rotate(${legs[0].toFixed(1)})`);
		set(hindFar, `rotate(${legs[1].toFixed(1)})`);
		set(foreNear, `rotate(${legs[2].toFixed(1)})`);
		set(foreFar, `rotate(${legs[3].toFixed(1)})`);
		set(head, `rotate(${headAngle.toFixed(1)})`);
		/* a wag when it is pleased with itself, a droop when the slipper lands */
		const wag =
			mode === "run" ? 26 : mode === "sniff" ? -14 + Math.sin(seconds * 7) * 16 : -20 + Math.sin(seconds * 4) * 12;
		set(tail, `rotate(${wag.toFixed(1)})`);
		show(drops, mode === "mark" && p > 0.35 && p < 0.8 ? 0.8 : 0);
	});

	const leg = (ref: RefObject<SVGGElement | null>, x: number, fill: string) => (
		<g transform={`translate(${x} -8)`}>
			<g ref={ref}>
				<path d='M-1.7,0 L1.7,0 L1.2,8.4 L-1.2,8.4 Z' fill={fill} />
				<path d='M-1.4,7.8 L2.4,7.9 C2.9,8.7 2.4,9.2 1.6,9.2 L-1.4,9.2 Z' fill={fill} />
			</g>
		</g>
	);

	return (
		<>
			<g ref={root} className='critter dog' opacity={0}>
				<g ref={body}>
					<g transform='translate(-12.4 -13.4)'>
						<g ref={tail}>
							<path d='M0,0 C-5.4,-2 -8.8,-6.2 -7.8,-10.6 C-6,-7 -3.2,-4.4 -0.4,-3 Z' fill='#9c5c34' />
							<path d='M-7.8,-10.6 C-7.2,-9.4 -6.4,-8.2 -5.4,-7.2 C-6,-8.4 -6.4,-9.6 -6.6,-10.6 Z' fill='#ddb389' />
						</g>
					</g>
					{leg(hindFar, -7, "#8a4f2c")}
					{leg(foreFar, 8, "#8a4f2c")}
					{/* a deeper chest and a rounder rump, to carry the head */}
					<path
						d='M-12.4,-9 C-14,-15.6 -6,-19.2 2,-18.6 C9.6,-18.2 13.8,-15.4 13.8,-11.2 C13.8,-8.2 10.4,-7 6,-7 L-8,-7 C-11.4,-7 -12.6,-8 -12.4,-9 Z'
						fill='#a9663c'
					/>
					<path d='M-9,-7.4 C-3,-6 4.4,-6 9.4,-7.8 L8.2,-9.6 L-8.2,-9.6 Z' fill='#ddb389' />
					{leg(hindNear, -9, "#a9663c")}
					{leg(foreNear, 6, "#a9663c")}
					<g transform='translate(11.4 -16)'>
						<g ref={head}>
							{/* the far ear, then the skull, the long near ear over it */}
							<path
								d='M0.6,-5.4 C-2.4,-6 -4.6,-3.2 -4.2,0.8 C-3.8,3.4 -2.4,5 -0.6,5.6 C-1.4,2.4 -1.2,-1.6 0.6,-4.6 Z'
								fill='#7a4527'
							/>
							<ellipse cx={3} cy={-2.6} rx={5.8} ry={5.2} fill='#a9663c' />
							{/* broad snout, dark nose, a hint of jowl */}
							<path
								d='M6.2,-4 C10.4,-4.2 14.8,-2.6 15.9,-0.8 C16.5,0.4 15.7,1.5 14.2,1.6 L7.8,2.2 C6,1.7 5.3,0.2 5.6,-1.6 Z'
								fill='#ddb389'
							/>
							<ellipse cx={15.1} cy={-0.2} rx={1.6} ry={1.3} fill='#2a1c14' />
							<path
								d='M13.6,1.4 C12,2.3 9.8,2.3 8.4,1.5'
								stroke='#2a1c14'
								strokeWidth={0.6}
								fill='none'
								strokeLinecap='round'
							/>
							{/* the same wide eye as in the doorway, brow and all */}
							<circle cx={4.6} cy={-4} r={1.9} fill='#f6f1e8' />
							<circle cx={5.1} cy={-3.8} r={1.1} fill='#2a1c14' />
							<circle cx={5.5} cy={-4.3} r={0.36} fill='#fbfdff' />
							<path
								d='M2.8,-6.4 C3.8,-7.2 5.4,-7.2 6.4,-6.4'
								stroke='#8a4f2c'
								strokeWidth={0.7}
								fill='none'
								strokeLinecap='round'
							/>
							<path
								d='M1.4,-6.2 C-1.8,-6.8 -4,-3.4 -3.4,1 C-2.8,4.4 -1,6.4 1.2,7 C0,3.4 0.2,-1.6 1.4,-5.2 Z'
								fill='#8a4f2c'
							/>
						</g>
					</g>
				</g>
				<g ref={drops} opacity={0} fill='#cfe0ec'>
					<circle cx={-13} cy={-3.4} r={0.7} />
					<circle cx={-15.4} cy={-1.8} r={0.6} />
					<circle cx={-17.2} cy={-0.4} r={0.5} />
				</g>
			</g>
			<g ref={slipper} opacity={0}>
				<path d='M-5,0 C-5.6,-2.6 -3.4,-3.6 -0.6,-3.4 L4.2,-3 C5.8,-2.8 6,-0.4 4.4,0 Z' fill='#a8493f' />
				<path d='M-4.6,-2.2 C-3,-3 -0.6,-3 1,-2.4 L0.6,-1 C-1,-1.4 -3,-1.4 -4.4,-0.8 Z' fill='#e8d9c2' />
			</g>
		</>
	);
}

/* ============================================================= cossack */

/* The householder comes out on a summer afternoon while the dog is doing its
   rounds: he crosses the yard to the fence, stands there with his pipe, and when
   the slipper finds its mark he has a good laugh and goes back inside. */
const DOOR_X = HOMESTEAD.near.x - 15.5 * HOMESTEAD.near.scale;
const COSSACK: Waypoint<Mode>[] = [
	{ f: 0, x: DOOR_X, d: -28, mode: "hidden" },
	{ f: 0.168, x: DOOR_X, d: -28, mode: "walk" },
	/* across the yard to the fence, standing clear above it */
	{ f: 0.196, x: 1402, d: -16, mode: "smoke" },
	{ f: 0.316, x: 1402, d: -16, mode: "laugh" },
	{ f: 0.346, x: 1402, d: -16, mode: "walk" },
	{ f: 0.374, x: DOOR_X, d: -28, mode: "hidden" },
	{ f: 1, x: DOOR_X, d: -28, mode: "hidden" },
];

function Cossack({ season }: { season: Season }) {
	const root = useRef<SVGGElement>(null);
	const body = useRef<SVGGElement>(null);
	const torso = useRef<SVGGElement>(null);
	const head = useRef<SVGGElement>(null);
	const arm = useRef<SVGGElement>(null);
	const armFar = useRef<SVGGElement>(null);
	const hipNear = useRef<SVGGElement>(null);
	const hipFar = useRef<SVGGElement>(null);
	const ankleNear = useRef<SVGGElement>(null);
	const ankleFar = useRef<SVGGElement>(null);
	const laughMouth = useRef<SVGGElement>(null);
	const calmMouth = useRef<SVGGElement>(null);
	const puffs = useRef<SVGGElement>(null);
	const ember = useRef<SVGGElement>(null);
	const puff1 = useRef<SVGGElement>(null);
	const puff2 = useRef<SVGGElement>(null);
	const puff3 = useRef<SVGGElement>(null);
	const heading = useRef<1 | -1>(1);
	const winter = season === "winter";

	useCycleFrame((f, seconds) => {
		const at = onRoute(COSSACK, f);
		if (!at || at.mode === "hidden") {
			show(root, 0);
			return;
		}
		const { x, d, p, mode } = at;
		if (Math.abs(at.dx) > 0.05) heading.current = at.dx > 0 ? 1 : -1;
		show(root, presence(f, 0.168, 0.374, 0.004));
		/* A walk, not a wobble: the hips swing in opposite phase, each ankle pushes off
		   and lands, the body rises twice per stride and sways a little, and the free
		   arm counters the legs. `gait` eases all of it in as he sets off and out again
		   as he stops, so nothing snaps between standing and walking. */
		const walking = mode === "walk";
		const gait = walking ? Math.min(1, p / 0.18, (1 - p) / 0.18) : 0;
		const step = seconds * 1.05 * TAU;
		const swing = Math.sin(step) * 21 * gait;
		const bob = (Math.cos(step * 2) - 1) * 0.42 * gait;
		const sway = Math.sin(step) * 1.4 * gait;
		set(
			root,
			`translate(${x.toFixed(1)} ${(upperGround(x) + d + bob).toFixed(1)}) scale(${heading.current * 0.92} 0.92)`,
		);

		/* standing: weight on one leg, the other a touch forward */
		const restNear = -5 * (1 - gait);
		const restFar = 6 * (1 - gait);
		set(hipNear, `rotate(${(swing + restNear).toFixed(1)})`);
		set(hipFar, `rotate(${(-swing + restFar).toFixed(1)})`);
		/* the trailing foot rolls off the ground, the leading one reaches flat */
		set(ankleNear, `rotate(${(Math.max(0, Math.sin(step)) * -16 * gait).toFixed(1)})`);
		set(ankleFar, `rotate(${(Math.max(0, -Math.sin(step)) * -16 * gait).toFixed(1)})`);
		set(armFar, `rotate(${(-swing * 0.75 - 6).toFixed(1)})`);

		const laughing = mode === "laugh";
		const shake = laughing ? Math.sin(seconds * 9 * TAU) * 3.5 : 0;
		set(body, `rotate(${(laughing ? -7 + shake : 0).toFixed(1)} 0 -12)`);
		set(torso, `rotate(${(sway + gait * 2.5).toFixed(2)} 0 -13)`);
		set(head, `rotate(${(laughing ? -16 + shake : Math.sin(seconds * 0.7) * 2).toFixed(1)} 0 -2)`);
		/* Smoking in full: the pipe comes up to his mouth, he draws on it, takes it
		   away, and only then does the smoke come out — from his mouth, not the bowl. */
		const smoking = mode === "smoke" && p > 0.05;
		const puffCycle = 4.6;
		const beat = smoking && !laughing ? (seconds % puffCycle) / puffCycle : -1;
		const atMouth = beat >= 0.05 && beat < 0.3 ? Math.min(1, (beat - 0.05) / 0.06, (0.3 - beat) / 0.06) : 0;
		/* his hand comes up to the bowl for the draw, and the tobacco glows while he pulls */
		set(arm, `rotate(${(laughing ? 34 : -6 - ease(atMouth) * 30).toFixed(1)})`);
		show(ember, atMouth * 0.9);
		show(laughMouth, laughing ? 1 : 0);
		show(calmMouth, laughing ? 0 : 1);
		show(puffs, smoking ? 1 : 0);
		/* three puffs let go one after another once the pipe is back down */
		[puff1, puff2, puff3].forEach((ref, index) => {
			const t = (beat - 0.34 - index * 0.045) / 0.26;
			if (beat < 0 || t < 0 || t > 1) {
				show(ref, 0);
				return;
			}
			set(ref, `translate(${(t * 7).toFixed(2)} ${(-t * 15).toFixed(2)}) scale(${(0.5 + t * 2).toFixed(2)})`);
			show(ref, Math.sin(t * Math.PI) * 0.5);
		});
	});

	return (
		<g ref={root} className='critter cossack' opacity={0}>
			<g ref={body}>
				{/* Full шаровари, gathered in under the knee, over tall boots; each leg
				    swings from its own hip and the far one is darker, so they read apart
				    as they cross. */}
				<g transform='translate(-3.2 -13)'>
					<g ref={hipFar}>
						<path
							d='M-3,0 C-5.8,1.6 -7,4.6 -5.6,7.4 C-3.6,8.6 1.6,8.6 3.8,7.4 C4.6,4.8 4.2,1.8 2.8,0 Z'
							fill='#9c2e27'
						/>
						<path d='M-5.4,7 C-3.4,8.4 1.6,8.4 3.6,7 L3.4,8.8 C1.4,9.8 -3.2,9.8 -5,8.8 Z' fill='#7f251f' />
						<path d='M-2.8,8.4 C-3,10 -3,11.6 -2.8,12.6 L2.8,12.6 C3,11.6 3,10 2.8,8.4 Z' fill='#1f1a18' />
						<g ref={ankleFar} transform='translate(0 12.4)'>
							<path d='M-2.8,-0.4 L2.8,-0.4 L4,1.6 L-2.8,1.6 Z' fill='#1f1a18' />
						</g>
					</g>
				</g>
				<path d='M-7.4,-13.8 C-8,-11.4 -7.6,-9.6 -6.8,-8.6 L6.8,-8.6 C7.6,-9.6 8,-11.4 7.4,-13.8 Z' fill='#c0392b' />
				<g transform='translate(3.2 -13)'>
					<g ref={hipNear}>
						<path
							d='M-2.8,0 C-4.2,1.8 -4.6,4.8 -3.8,7.4 C-1.6,8.6 3.6,8.6 5.6,7.4 C7,4.6 5.8,1.6 3,0 Z'
							fill='#c0392b'
						/>
						<path
							d='M-2.8,0 C-4.2,1.8 -4.6,4.8 -3.8,7.4 C-3,7.8 -2,8.1 -0.8,8.3 C-1.8,5.6 -1.8,2.6 -1,0 Z'
							fill='#a5312a'
						/>
						<path d='M-3.6,7 C-1.4,8.4 3.6,8.4 5.4,7 L5.2,8.8 C3.2,9.8 -1.6,9.8 -3.4,8.8 Z' fill='#a5312a' />
						<path d='M-2.9,8.4 C-3.1,10 -3.1,11.6 -2.9,12.6 L2.9,12.6 C3.1,11.6 3.1,10 2.9,8.4 Z' fill='#2e231d' />
						<path d='M-2.9,8.4 C-3.1,10 -3.1,11.6 -2.9,12.6 L-1.5,12.6 C-1.7,11.4 -1.7,9.8 -1.5,8.4 Z' fill='#453730' />
						<g ref={ankleNear} transform='translate(0 12.4)'>
							<path d='M-2.9,-0.4 L2.9,-0.4 L4.4,1.8 L-2.9,1.8 Z' fill='#2e231d' />
						</g>
					</g>
				</g>

				{/* shirt, sash, arms and head ride the torso, which sways with the stride */}
				<g ref={torso}>
					{/* the free arm, swinging against the legs */}
					<g transform='translate(-5 -21)'>
						<g ref={armFar}>
							<path d='M-1.4,0 C-2.8,2.6 -3,5.6 -2.4,8 L0.8,7.6 C0.4,5.2 0.6,2.6 1.4,0.6 Z' fill='#e8e2d4' />
							<path d='M-2.6,6.4 L0.8,6 L0.9,7.4 L-2.5,7.8 Z' fill='#c0392b' />
							<path d='M-2.4,7.6 L0.8,7.4 C1.4,8.6 0.8,9.6 -0.4,9.6 C-1.6,9.6 -2.4,8.8 -2.4,7.6 Z' fill='#e8b98f' />
						</g>
					</g>

					{winter ? (
						/* winter: a sheepskin coat over everything, fleece at the collar and hem */
						<>
							<path d='M-8.6,-6.4 C-9.6,-14 -6.4,-23 0,-23.7 C6.4,-23 9.6,-14 8.6,-6.4 Z' fill='#c9a97a' />
							<path
								d='M-0.9,-23.6 C-0.6,-17 -0.5,-11 -0.7,-6.5 L0.9,-6.5 C0.7,-11 0.8,-17 1.1,-23.6 Z'
								fill='#b08f62'
							/>
							<path
								d='M-8.6,-8.2 C-4.4,-6.4 4.4,-6.4 8.6,-8.2 L8.5,-5.6 C4.4,-3.8 -4.4,-3.8 -8.5,-5.6 Z'
								fill='#efe6d2'
							/>
							<path d='M-5,-23.4 C-2.2,-24.8 2.2,-24.8 5,-23.4 C3.6,-21.2 -3.6,-21.2 -5,-23.4 Z' fill='#efe6d2' />
							<path d='M-8.2,-14.6 C-4,-13.4 4,-13.4 8.2,-14.6 L8.1,-12.2 C4,-11 -4,-11 -8.1,-12.2 Z' fill='#8a5a33' />
						</>
					) : (
						<>
							{/* the embroidered shirt */}
							<path d='M-7.4,-12.6 C-8.4,-19 -5.6,-23.4 0,-23.9 C5.6,-23.4 8.4,-19 7.4,-12.6 Z' fill='#f7f4ec' />
							<g stroke='#c0392b' strokeWidth={0.75} strokeLinecap='round' fill='none'>
								<path d='M-1.9,-22.8 L-1.9,-14 M1.9,-22.8 L1.9,-14' />
								<path d='M-1,-21.2 L0,-20.1 L1,-21.2 M-1,-19 L0,-17.9 L1,-19 M-1,-16.8 L0,-15.7 L1,-16.8' />
							</g>
							<path
								d='M-3.4,-23.7 C-1.4,-24.5 1.4,-24.5 3.4,-23.7 L2.6,-22 C1,-22.6 -1,-22.6 -2.6,-22 Z'
								fill='#c0392b'
							/>

							{/* the sash, with its ends hanging down the front */}
							<path d='M-7.7,-15 C-4,-13.7 4,-13.7 7.7,-15 L7.6,-11.5 C4,-10.2 -4,-10.2 -7.6,-11.5 Z' fill='#3d9bd4' />
							<path d='M-2.6,-11.9 L0.2,-11.8 L0.5,-5.6 C0.5,-4.8 -1.5,-4.8 -1.5,-5.6 Z' fill='#3690c6' />
							<path d='M0.6,-11.8 L3.4,-12 L3.6,-3.6 C3.6,-2.8 1.6,-2.8 1.6,-3.6 Z' fill='#4aa9e0' />
						</>
					)}

					{/* the arm with the pipe */}
					<g transform='translate(5.6 -21)'>
						<g ref={arm}>
							<path d='M-1.6,0 C1.4,0.6 3,3.4 3.4,6.4 L0.4,7 C0,4.6 -1,2.6 -2.6,1.6 Z' fill='#f7f4ec' />
							<path d='M0.2,5.2 L3.5,4.8 L3.6,6.2 L0.3,6.6 Z' fill='#c0392b' />
							<path d='M2.4,5.6 L5.6,6.4 C6.4,6.6 6.4,7.8 5.4,7.8 L2.2,7.4 Z' fill='#e8b98f' />
						</g>
					</g>

					{/* head: the fur hat with its red crown hanging over, and the moustache */}
					<g transform='translate(0 -23.8)'>
						<g ref={head}>
							<ellipse cx={0} cy={-3.6} rx={4.4} ry={5} fill='#e8b98f' />
							<path
								d='M1.2,-12.6 C3.6,-11.9 5,-10 5,-7.6 C5,-5.2 4.2,-3.2 3.2,-2 C4,-5 4,-8.4 2.5,-10.8 C2.1,-11.6 1.6,-12.2 1.2,-12.6 Z'
								fill='#c0392b'
							/>
							<path
								d='M-5.2,-6.6 C-5.6,-11 -3,-13.2 0,-13.2 C3,-13.2 5.6,-11 5.2,-6.6 C2.6,-8 -2.6,-8 -5.2,-6.6 Z'
								fill='#241f1e'
							/>
							<path d='M-5.2,-7.4 C-2.6,-8.8 2.6,-8.8 5.2,-7.4 L5,-5.6 C2.4,-7 -2.4,-7 -5,-5.6 Z' fill='#161211' />
							<circle cx={2.2} cy={-4} r={0.7} fill='#2a1c14' />
							{/* The pipe stays in his teeth: the stem at his lips, the bowl forward
							    and upright, the way one is actually smoked. His hand only comes up
							    to it for a draw. */}
							<path
								d='M3,-1.5 C4.8,-1.1 6.2,-0.5 7.4,0.3'
								stroke='#5a3d2b'
								strokeWidth={0.9}
								fill='none'
								strokeLinecap='round'
							/>
							<path d='M7,-0.5 L10,-0.5 L9.5,2.8 C9.3,3.7 7.7,3.7 7.5,2.8 Z' fill='#5a3d2b' />
							<path d='M7,-0.5 L10,-0.5 L9.9,0.3 L7.1,0.3 Z' fill='#7a573c' />
							<g ref={ember} opacity={0}>
								<ellipse cx={8.5} cy={-0.2} rx={1.2} ry={0.5} fill='#ff7a2a' />
							</g>
							<g ref={calmMouth} opacity={0}>
								<path
									d='M-0.6,-1 C0.8,-1.4 2.2,-1 3,-0.2'
									stroke='#7a5a44'
									strokeWidth={0.7}
									fill='none'
									strokeLinecap='round'
								/>
							</g>
							<g ref={laughMouth} opacity={0}>
								<path d='M-0.4,-1.2 C1.2,-1.6 3,-1 3.4,0.4 C2.4,1.4 0.4,1 -0.4,-1.2 Z' fill='#5c3a30' />
							</g>
							<path
								d='M-1.4,-1.8 C0.6,-2.6 3,-2.2 4.4,-1 C3.6,0.8 2.2,2.4 0.4,3 C1.8,1.4 2.4,0 2,-0.8 C0.8,-1.4 -0.4,-1.4 -1.4,-1.8 Z'
								fill='#4a3327'
							/>
							<path
								d='M-1.4,-1.8 C-3,-2.4 -4.6,-2 -5.4,-1 C-4.6,0.6 -3.4,2.2 -1.8,2.8 C-2.8,1.2 -3.2,0 -2.8,-0.8 C-2.2,-1.4 -1.4,-1.4 -1.4,-1.8 Z'
								fill='#4a3327'
							/>
						</g>
					</g>
				</g>
			</g>
			{/* the smoke leaves his mouth, so it starts there */}
			<g ref={puffs} opacity={0} fill='#e6e9ef'>
				<g ref={puff1} opacity={0} transform='translate(0 0)'>
					<circle cx={5.4} cy={-25.4} r={1.3} />
				</g>
				<g ref={puff2} opacity={0} transform='translate(0 0)'>
					<circle cx={5.4} cy={-25.4} r={1.1} />
				</g>
				<g ref={puff3} opacity={0} transform='translate(0 0)'>
					<circle cx={5.4} cy={-25.4} r={1} />
				</g>
			</g>
		</g>
	);
}

/* ============================================================== tracks */

/* Winter only: every walker leaves prints in the snow as it goes. The winter day is
   one cycle, so what's pressed in today stays until the thaw at the spring dawn. */
interface Print {
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
const LOWER_PRINTS = [...WOLF_PRINTS, ...FOX_PRINTS].sort((a, b) => a.f - b.f);

/* hare: at every landing the long hind feet come down ahead of the small forefeet */
const HARE_PRINTS: Print[] = (() => {
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

function Tracks({ prints }: { prints: Print[] }) {
	const group = useRef<SVGGElement>(null);
	const shown = useRef(-1);

	useCycleFrame((f) => {
		/* prints are in the order they were made, so only a count needs tracking */
		let count = 0;
		while (count < prints.length && prints[count].f <= f) count += 1;
		if (count === shown.current || !group.current) return;
		Array.from(group.current.children).forEach((print, index) =>
			print.setAttribute("opacity", index < count ? "1" : "0"),
		);
		shown.current = count;
	});

	return (
		<g ref={group} className='tracks'>
			{prints.map((print, index) => (
				<ellipse key={index} cx={print.x.toFixed(1)} cy={print.y.toFixed(1)} rx={print.rx} ry={print.ry} opacity={0} />
			))}
		</g>
	);
}

/* ============================================================== layers */

interface CritterProps {
	season: Season;
}

/* on the upper meadow, between the trees and the bush they hide in */
export function UpperCritters({ season }: CritterProps) {
	return (
		<g className={`critters critters-${season}`}>
			{/* up at the field, in front of it: the margin they work from is nearer
			    than anything growing on the plot */}
			<FieldFolk season={season} />
			{season === "winter" ? <Tracks prints={HARE_PRINTS} /> : null}
			<Hare />
			<Hedgehog season={season} />
			{/* he comes out for a smoke whatever the season, and walks behind the fence */}
			<Cossack season={season} />
			{/* of an evening, two neighbours wander from one хата to the other */}
			<Revellers season={season} />
			<HomesteadFence />
			{/* in the warm seasons the children play out here; in winter they are on the river */}
			{season === "winter" ? (
				<>
					{/* the snowman first: they play round it all afternoon, and always on
					    the near side of it */}
					<Snowman />
					<SnowChildren />
				</>
			) : (
				<YardChildren season={season} />
			)}
			<Dog />
			{/* drawn last, so the dog resting inside shows only its muzzle */}
			<Kennel />
		</g>
	);
}

/* on the lower meadow: rendered once behind its trees and once in front of them */
export function LowerCritters({ season, layer }: CritterProps & { layer: Layer }) {
	return (
		<g className={`critters critters-${season}`}>
			{/* tracks lie under everything, so they go with the back layer only */}
			{season === "winter" && layer === "back" ? <Tracks prints={LOWER_PRINTS} /> : null}
			<Fox season={season} layer={layer} />
			<Wolf layer={layer} />
		</g>
	);
}
