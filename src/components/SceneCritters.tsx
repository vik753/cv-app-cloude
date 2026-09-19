import { APPLE_TREE, BIRCH_TREE, LOWER_COVER, UPPER_BUSH, lowerGround, upperGround, type Point } from "@/services/landscape";
import type { Season } from "@/hooks/useDayNightCycle";
import { useEffect, useRef, type Ref, type RefObject } from "react";

/* The critters are choreographed against the day: 0 is dawn, 0.1–0.4 full day,
   0.5 dusk, 0.6–0.9 night, then dawn again. The clock is read straight off the
   sky's own CSS animation, so they can never drift out of step with it. Poses are
   written to the DOM every frame; React only renders the drawings once. */
const CYCLE_MS = 46_000;

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
	| "sniff";

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

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => t * t * (3 - 2 * t);
const TAU = Math.PI * 2;

function useCycleFrame(draw: (f: number, seconds: number) => void) {
	const drawRef = useRef(draw);
	useEffect(() => {
		drawRef.current = draw;
	});
	useEffect(() => {
		const clock = document.querySelector(".sky-day")?.getAnimations()[0];
		/* reduced motion: the sky is frozen at noon and the critters stay home */
		if (!clock) return;
		let frame = 0;
		const tick = () => {
			const t = Number(clock.currentTime ?? 0);
			drawRef.current((t % CYCLE_MS) / CYCLE_MS, t / 1000);
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, []);
}

const set = (ref: RefObject<SVGElement | null>, transform: string) => ref.current?.setAttribute("transform", transform);
const show = (ref: RefObject<SVGElement | null>, opacity: number) =>
	ref.current?.setAttribute("opacity", opacity.toFixed(3));

/* fade in/out over the first and last slice of a visible stretch */
const presence = (f: number, from: number, to: number, fade = 0.006) =>
	Math.max(0, Math.min(1, (f - from) / fade, (to - f) / fade));

/* A route: timed waypoints on the lower meadow. Between two waypoints the critter
   follows a Catmull-Rom curve through the neighbouring ones, so it arcs around the
   trees instead of marching in straight lines. Two identical waypoints in a row
   mean it stands still; `facing` pins which way it looks while it does. */
interface Waypoint {
	f: number;
	x: number;
	d: number;
	mode: Mode;
	facing?: 1 | -1;
}

const catmull = (a: number, b: number, c: number, d: number, t: number) =>
	0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (3 * b - a - 3 * c + d) * t * t * t);

const onRoute = (route: Waypoint[], f: number) => {
	const i = route.findIndex((point, index) => index < route.length - 1 && f >= point.f && f < route[index + 1].f);
	if (i < 0) return null;
	const from = route[i];
	const to = route[i + 1];
	const before = route[Math.max(0, i - 1)];
	const after = route[Math.min(route.length - 1, i + 2)];
	const p = (f - from.f) / (to.f - from.f);
	if (from.x === to.x && from.d === to.d) return { x: from.x, d: from.d, dx: 0, p, mode: from.mode, facing: from.facing };
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
				<path d='M-1.3,9 L2.4,9.1 C2.9,9.9 2.4,10.4 1.6,10.4 L-1.3,10.4 Z' className={far ? "fox-leg-far" : "fox-leg"} />
			</g>
		</g>
	);
}

/* ================================================================ wolf */

/* lower meadow at night: follows a scent trail in wide curves between the trees,
   slipping behind some and passing in front of others, stops to sniff the pine and
   the bush and to look around, then sits and howls at the moon, and bolts at dawn */
const WOLF: Waypoint[] = [
	{ f: 0.6, x: -70, d: 70, mode: "walk" },
	{ f: 0.612, x: 20, d: 62, mode: "walk" },
	{ f: 0.622, x: 120, d: 64, mode: "walk" },
	{ f: 0.632, x: 215, d: 60, mode: "walk" },
	{ f: 0.641, x: 300, d: 92, mode: "walk" },
	{ f: 0.644, x: 294, d: 92, mode: "sniff", facing: -1 },
	{ f: 0.656, x: 294, d: 92, mode: "walk" },
	{ f: 0.664, x: 350, d: 74, mode: "walk" },
	{ f: 0.671, x: 372, d: 58, mode: "look" },
	{ f: 0.683, x: 372, d: 58, mode: "walk" },
	{ f: 0.694, x: 440, d: 52, mode: "walk" },
	{ f: 0.702, x: 492, d: 70, mode: "walk" },
	{ f: 0.706, x: 478, d: 80, mode: "sniff", facing: -1 },
	{ f: 0.718, x: 478, d: 80, mode: "walk" },
	{ f: 0.73, x: 545, d: 102, mode: "walk" },
	{ f: 0.741, x: 600, d: 70, mode: "look" },
	{ f: 0.751, x: 600, d: 70, mode: "walk" },
	{ f: 0.763, x: 640, d: 40, mode: "sit", facing: 1 },
	{ f: 0.905, x: 640, d: 40, mode: "stand", facing: 1 },
	{ f: 0.912, x: 640, d: 40, mode: "run" },
	{ f: 0.928, x: 900, d: 62, mode: "run" },
	{ f: 0.944, x: 1180, d: 70, mode: "run" },
	{ f: 0.96, x: 1720, d: 84, mode: "hidden" },
];

/* three long howls while the moon sails past overhead */
const HOWLS: [number, number][] = [
	[0.772, 0.8],
	[0.822, 0.85],
	[0.868, 0.894],
];

function Wolf({ layer }: { layer: Layer }) {
	const root = useRef<SVGGElement>(null);
	const body = useRef<SVGGElement>(null);
	const head = useRef<SVGGElement>(null);
	const tail = useRef<SVGGElement>(null);
	const song = useRef<SVGGElement>(null);
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
		/* sitting: the body tips back onto the haunches, forelegs stretch to the ground */
		const tilt = sitting ? -26 : mode === "run" ? Math.sin(seconds * 3.6 * TAU) * 3 : mode === "sniff" ? 5 : 0;
		set(body, `rotate(${tilt.toFixed(2)} -13 -14)`);
		set(legs[0], sitting ? "rotate(-78) scale(1 0.55)" : `rotate(${swing[0].toFixed(1)})`);
		set(legs[1], sitting ? "rotate(-72) scale(1 0.55)" : `rotate(${swing[1].toFixed(1)})`);
		set(legs[2], sitting ? "rotate(26) scale(1 1.78)" : `rotate(${swing[2].toFixed(1)})`);
		set(legs[3], sitting ? "rotate(22) scale(1 1.78)" : `rotate(${swing[3].toFixed(1)})`);

		const howl = HOWLS.find(([from, to]) => f >= from && f < to);
		let headAngle = 0;
		if (mode === "walk") headAngle = 20 + Math.sin(seconds * 2.4) * 8;
		/* nose to the bark, in short quick sniffs */
		else if (mode === "sniff") headAngle = 36 + Math.max(0, Math.sin(seconds * 13)) * 5;
		else if (mode === "look") headAngle = -8 + Math.sin(p * TAU * 1.5) * 6;
		else if (mode === "run") headAngle = 6;
		else if (sitting) {
			/* gazing at the moon, and throwing the head back to howl */
			const lift = howl ? Math.sin(Math.min(1, ((f - howl[0]) / (howl[1] - howl[0])) * 1.25) * Math.PI) : 0;
			headAngle = 26 - 28 - lift * 26;
		}
		set(head, `rotate(${headAngle.toFixed(1)})`);
		show(song, howl ? Math.sin(((f - howl[0]) / (howl[1] - howl[0])) * Math.PI) : 0);
		const wag =
			sitting ? 58 : mode === "run" ? 18 : mode === "sniff" ? 4 + Math.sin(seconds * 6) * 12 : 8 + Math.sin(seconds * 2) * 6;
		set(tail, `rotate(${wag.toFixed(1)})`);
	});

	return (
		<g ref={root} className='critter wolf' opacity={0}>
			<g ref={body}>
				<g transform='translate(-19 -20)'>
					<g ref={tail}>
						<path d='M0,0 C-6,1 -12,5 -15,12 C-15,14 -12,15 -10,12.5 C-8,8 -4,5 1,3 Z' className='wolf-fur' />
						<path d='M-15,12 C-15,14 -12,15 -10,12.5 C-11,12 -13,11.5 -14.2,10.4 Z' fill='#3f444c' />
					</g>
				</g>
				<WolfLeg ref={hindFar} x={-12} fill='#555c66' />
				<WolfLeg ref={foreFar} x={13} fill='#555c66' />
				<path
					d='M-21,-17 C-22,-24 -12,-27 -2,-26 C8,-26 16,-28 20,-23 C23,-18 21,-12 14,-12 L-14,-12 C-19,-12 -21,-14 -21,-17 Z'
					className='wolf-fur'
				/>
				<path d='M-3,-26 C6,-28.5 14,-29 19.5,-23.5 C12,-25.5 4,-24.5 -3,-24 Z' fill='#4f555e' />
				<path d='M-13,-12 C-4,-10.5 6,-10.5 13,-12 L12,-14 L-12,-14 Z' fill='#c3c8cf' />
				<WolfLeg ref={hindNear} x={-14} fill='#737a85' />
				<WolfLeg ref={foreNear} x={11} fill='#737a85' />
				<g transform='translate(16 -23)'>
					<g ref={head}>
						<path d='M4,-8 L6,-16 L10,-8.5 Z' fill='#4f555e' />
						<path
							d='M-3,1 C-3,-6 3,-10 9,-9 C12,-9 14,-7 16,-5 L24,-2.5 C25.2,-0.8 24.4,1.8 22,2 L13,3 C8,5 1,6 -3,1 Z'
							className='wolf-fur'
						/>
						<path d='M12,0.8 L22.5,1.2 L21.4,3 L12.6,3.4 Z' fill='#c3c8cf' />
						<circle cx={12} cy={-5} r={1.1} fill='#f4d36a' />
						<circle cx={24.2} cy={-1.4} r={1.2} fill='#222' />
						<g ref={song} opacity={0} fill='none' stroke='#e8ecf6' strokeWidth={1.1} strokeLinecap='round'>
							<path d='M28,-6 q3,3 0,6' />
							<path d='M31.5,-8.5 q4.6,5.5 0,11' />
							<path d='M35,-11 q6.4,8 0,16' />
						</g>
					</g>
				</g>
			</g>
		</g>
	);
}

/* ================================================================= fox */

/* the same meadow by day: trots in from the right weaving between the trees,
   stops to sniff the pine, the oak and the cherry, and on the way freezes to listen
   for a mouse under the grass (or the snow), leaps and dives nose-first */
const FOX: Waypoint[] = [
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
							<path d='M-2,1 C-2,-5 3,-8 8,-7 L18,-2.2 C19.2,-1 18.2,1 16,1 L8,2 C4,4 -1,4 -2,1 Z' className='fox-fur' />
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
		set(root, `translate(${x.toFixed(1)} ${(upperGround(x) + 3 + lift).toFixed(1)}) scale(${segment.facing * 0.95} 0.95)`);
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
				<path d='M-9,-8 C-11,-14 -4,-17 2,-16 C7,-15 10,-12 9,-8 C8,-5 4,-4 0,-4 L-6,-4 C-9,-4 -10,-6 -9,-8 Z' className='hare-fur' />
				<g transform='translate(-5 -5)'>
					<g ref={hind}>
						<path d='M-3,-3.4 C-6.6,0 -5,4.4 -1,5 L7,5 C8.2,5 8.2,3.8 7,3.4 L0.6,2.6 C2.4,0 1.4,-3.6 -3,-3.4 Z' className='hare-fur' />
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
		set(root, `translate(${x.toFixed(1)} ${(upperGround(x) + 6 + bob).toFixed(1)}) scale(${segment.facing * 0.74} 0.74)`);
		set(body, `rotate(${sniff.toFixed(1)} 6 0)`);
		set(feet, scurry ? `translate(${(Math.sin(seconds * 7 * TAU) * 1.2).toFixed(2)} 0)` : "");
		show(carried, fruiting && f >= PICKUP ? 1 : 0);
	});

	return (
		<>
			{FALLEN.map((_, index) => (
				<g key={index}>
					<g ref={apples[index]} opacity={0} transform={`translate(${APPLE_TREE.x + FALLEN[index].dx} ${APPLE_TREE.base + 1.5})`}>
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
					<path d='M-7,-3 L-5,-7 M-3,-4 L-1,-9.4 M1,-4 L3,-9 M4,-3 L5.6,-6' stroke='#9a846e' strokeWidth={0.9} strokeLinecap='round' />
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
			<g ref={zzz} opacity={0} className='hedgehog-zzz' transform={`translate(${UPPER_BUSH.x + 6} ${UPPER_BUSH.base - 20})`}>
				<text x={0} y={0}>z</text>
				<text x={4} y={-6}>z</text>
				<text x={9} y={-13}>Z</text>
			</g>
		</>
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
const printsAlong = (route: Waypoint[], stride: number, spread: number, size: number, depthScale: number): Print[] => {
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
		Array.from(group.current.children).forEach((print, index) => print.setAttribute("opacity", index < count ? "1" : "0"));
		shown.current = count;
	});

	return (
		<g ref={group} className='tracks'>
			{prints.map((print, index) => (
				<ellipse
					key={index}
					cx={print.x.toFixed(1)}
					cy={print.y.toFixed(1)}
					rx={print.rx}
					ry={print.ry}
					opacity={0}
				/>
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
			{season === "winter" ? <Tracks prints={HARE_PRINTS} /> : null}
			<Hare />
			<Hedgehog season={season} />
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
