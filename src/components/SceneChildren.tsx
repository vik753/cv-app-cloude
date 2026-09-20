import type { Season } from "@/hooks/useDayNightCycle";
import { onRoute, presence, set, show, TAU, useCycleFrame, type Waypoint } from "@/hooks/useSceneClock";
import { riverTopAt, upperGround } from "@/services/landscape";
import { useRef } from "react";

/* The household's three children. In the warm half of the year they tear about the
   yard; in winter they are down on the frozen river on skates. */

type KidMode = "hidden" | "run" | "stand" | "jump" | "glide";
type Outfit = "summer" | "autumn" | "winter";

interface KidLook {
	shirt: string;
	trim: string;
	hair: string;
	hat?: string;
	scarf?: string;
}

const LOOKS: KidLook[] = [
	{ shirt: "#f7f4ec", trim: "#c0392b", hair: "#6b4a2f", hat: "#c0392b", scarf: "#3d9bd4" },
	{ shirt: "#f2ede0", trim: "#3d7bb8", hair: "#3f2e22", hat: "#3d7bb8", scarf: "#d8a43a" },
	{ shirt: "#faf6ea", trim: "#4f8a4a", hair: "#a8763f", hat: "#4f8a4a", scarf: "#c0392b" },
];

interface KidProps {
	route: Waypoint<KidMode>[];
	look: KidLook;
	outfit: Outfit;
	ground: (x: number) => number;
	from: number;
	to: number;
	scale?: number;
}

function Kid({ route, look, outfit, ground, from, to, scale = 0.95 }: KidProps) {
	const root = useRef<SVGGElement>(null);
	const body = useRef<SVGGElement>(null);
	const legNear = useRef<SVGGElement>(null);
	const legFar = useRef<SVGGElement>(null);
	const armNear = useRef<SVGGElement>(null);
	const armFar = useRef<SVGGElement>(null);
	const heading = useRef<1 | -1>(1);

	useCycleFrame((f, seconds) => {
		const at = onRoute(route, f);
		if (!at || at.mode === "hidden") {
			show(root, 0);
			return;
		}
		const { x, d, p, mode } = at;
		if (Math.abs(at.dx) > 0.05) heading.current = at.dx > 0 ? 1 : -1;
		show(root, presence(f, from, to, 0.004));

		let lift = 0;
		let tilt = 0;
		/* every branch below sets both, standing included */
		let legs: [number, number];
		let arms: [number, number];
		switch (mode) {
			case "run": {
				/* short legs, quick steps, arms pumping the other way */
				const step = seconds * 2.5 * TAU;
				const swing = Math.sin(step);
				legs = [swing * 34, -swing * 34];
				arms = [-swing * 30, swing * 30];
				lift = (Math.cos(step * 2) - 1) * 0.5;
				tilt = 6;
				break;
			}
			case "jump":
				lift = -Math.sin(p * Math.PI) * 7;
				legs = [-26, 18];
				arms = [-120, -130];
				tilt = -4;
				break;
			case "glide": {
				/* one long stroke and then the other, arms out for balance */
				const stroke = Math.sin(seconds * 0.75 * TAU);
				legs = [8 + stroke * 16, -6 - stroke * 22];
				arms = [-48 + stroke * 14, -54 - stroke * 12];
				tilt = 9 + stroke * 2;
				lift = -Math.abs(stroke) * 0.5;
				break;
			}
			default:
				legs = [4, -5];
				arms = [-8, 10];
		}
		set(root, `translate(${x.toFixed(1)} ${(ground(x) + d + lift).toFixed(1)}) scale(${heading.current * scale} ${scale})`);
		set(body, `rotate(${tilt.toFixed(1)} 0 -8)`);
		set(legNear, `rotate(${legs[0].toFixed(1)})`);
		set(legFar, `rotate(${legs[1].toFixed(1)})`);
		set(armNear, `rotate(${arms[0].toFixed(1)})`);
		set(armFar, `rotate(${arms[1].toFixed(1)})`);
	});

	const bare = outfit === "summer";
	const legFill = bare ? "#e8b98f" : outfit === "autumn" ? "#4a5a6b" : "#5a4535";
	const footFill = bare ? "#e8b98f" : outfit === "autumn" ? "#4a3a2c" : "#2e231d";
	const leg = (ref: React.RefObject<SVGGElement | null>, x: number, shade: number) => (
		<g transform={`translate(${x} -7.5)`}>
			<g ref={ref}>
				<path d='M-1.3,0 L1.3,0 L1.1,7.5 L-1.1,7.5 Z' fill={legFill} opacity={shade} />
				<path d='M-1.2,6.9 L1.6,6.9 L2.3,8.6 L-1.4,8.6 Z' fill={footFill} opacity={shade} />
				{outfit === "winter" ? <path d='M-1.4,4.6 L1.6,4.6 L1.7,7 L-1.5,7 Z' fill='#2e231d' opacity={shade} /> : null}
			</g>
		</g>
	);
	const arm = (ref: React.RefObject<SVGGElement | null>, x: number, shade: number) => (
		<g transform={`translate(${x} -13.6)`}>
			<g ref={ref}>
				<path d='M-1.1,0 L1.1,0 L0.9,5.6 L-0.9,5.6 Z' fill={outfit === "winter" ? "#c9a97a" : look.shirt} opacity={shade} />
				<circle cx={0} cy={6.4} r={1.2} fill={outfit === "winter" ? look.trim : "#e8b98f"} opacity={shade} />
			</g>
		</g>
	);

	return (
		<g ref={root} className='critter kid' opacity={0}>
			{leg(legFar, -1.6, 0.75)}
			{arm(armFar, -2.8, 0.75)}
			<g ref={body}>
				{outfit === "winter" ? (
					<>
						<path d='M-4,-6.4 C-4.6,-11 -2.6,-14.6 0,-15 C2.6,-14.6 4.6,-11 4,-6.4 Z' fill='#c9a97a' />
						<path d='M-4,-7.4 C-2,-6.4 2,-6.4 4,-7.4 L3.9,-5.8 C2,-4.8 -2,-4.8 -3.9,-5.8 Z' fill='#efe6d2' />
					</>
				) : (
					<>
						{/* a plain linen shirt, longer on the little ones in summer */}
						<path
							d={bare ? "M-4,-5.6 C-4.6,-10.6 -2.6,-14.6 0,-15 C2.6,-14.6 4.6,-10.6 4,-5.6 Z" : "M-3.8,-7.4 C-4.4,-11.2 -2.6,-14.6 0,-15 C2.6,-14.6 4.4,-11.2 3.8,-7.4 Z"}
							fill={look.shirt}
						/>
						<path d={bare ? "M-3.9,-8.2 L3.9,-8.2 L3.9,-6.8 L-3.9,-6.8 Z" : "M-3.8,-9 L3.8,-9 L3.8,-7.8 L-3.8,-7.8 Z"} fill={look.trim} />
						<path d='M-0.7,-14.4 L0.7,-14.4 L0.7,-9.4 L-0.7,-9.4 Z' fill={look.trim} opacity={0.8} />
					</>
				)}
				{leg(legNear, 1.6, 1)}
				<g transform='translate(0 -15)'>
					<circle cx={0} cy={-2.6} r={2.8} fill='#e8b98f' />
					{outfit === "winter" ? (
						<>
							<circle cx={-1.2} cy={-1.6} r={0.9} fill='#e88b7a' />
							<circle cx={2} cy={-1.6} r={0.9} fill='#e88b7a' />
							<path d='M-2.9,-3.6 C-2.6,-6.4 2.6,-6.6 2.9,-3.6 C1,-4.4 -1,-4.4 -2.9,-3.6 Z' fill={look.hat ?? "#c0392b"} />
							<circle cx={0} cy={-6.2} r={1} fill='#efe6d2' />
							<path d='M-3,-0.6 C-1,0.4 1.6,0.4 3,-0.6 L3.2,1.2 C1.4,2.2 -1.4,2.2 -3.2,1.2 Z' fill={look.scarf ?? "#3d9bd4"} />
							<path d='M2.4,0.8 L4.2,0.6 L4.6,3.6 L2.8,3.8 Z' fill={look.scarf ?? "#3d9bd4"} />
						</>
					) : (
						<path d='M-2.9,-3.4 C-2.4,-6.4 2.4,-6.6 2.9,-3.4 C1,-4.6 -1,-4.6 -2.9,-3.4 Z' fill={look.hair} />
					)}
					<circle cx={1.4} cy={-2.4} r={0.5} fill='#2a1c14' />
				</g>
				{arm(armNear, 2.6, 1)}
				{outfit === "winter" ? <path d='M2.2,-9 L4.4,-9.6 L5,-7.4 L2.8,-6.8 Z' fill={look.trim} opacity={0} /> : null}
			</g>
		</g>
	);
}

/* --- out on the open grass to the left of the хати: one chases, one runs off,
   the smallest hops about --- */
const yardGround = (x: number) => upperGround(x);

const CHASER: Waypoint<KidMode>[] = [
	{ f: 0, x: 960, d: 16, mode: "hidden" },
	{ f: 0.13, x: 960, d: 16, mode: "run" },
	{ f: 0.176, x: 1150, d: 24, mode: "stand" },
	{ f: 0.196, x: 1150, d: 24, mode: "run" },
	{ f: 0.242, x: 980, d: 19, mode: "run" },
	{ f: 0.286, x: 1140, d: 27, mode: "stand" },
	{ f: 0.304, x: 1140, d: 27, mode: "run" },
	{ f: 0.352, x: 966, d: 18, mode: "stand" },
	{ f: 0.386, x: 966, d: 18, mode: "hidden" },
	{ f: 1, x: 966, d: 18, mode: "hidden" },
];

const RUNAWAY: Waypoint<KidMode>[] = [
	{ f: 0, x: 1020, d: 26, mode: "hidden" },
	{ f: 0.132, x: 1020, d: 26, mode: "run" },
	{ f: 0.17, x: 1166, d: 18, mode: "run" },
	{ f: 0.214, x: 1010, d: 28, mode: "jump" },
	{ f: 0.232, x: 1010, d: 28, mode: "run" },
	{ f: 0.278, x: 1162, d: 22, mode: "run" },
	{ f: 0.33, x: 996, d: 26, mode: "run" },
	{ f: 0.364, x: 1040, d: 20, mode: "stand" },
	{ f: 0.388, x: 1040, d: 20, mode: "hidden" },
	{ f: 1, x: 1040, d: 20, mode: "hidden" },
];

const LITTLE_ONE: Waypoint<KidMode>[] = [
	{ f: 0, x: 1086, d: 22, mode: "hidden" },
	{ f: 0.14, x: 1086, d: 22, mode: "run" },
	{ f: 0.172, x: 1014, d: 24, mode: "jump" },
	{ f: 0.19, x: 1014, d: 24, mode: "stand" },
	{ f: 0.216, x: 1014, d: 24, mode: "run" },
	{ f: 0.254, x: 1104, d: 17, mode: "jump" },
	{ f: 0.272, x: 1104, d: 17, mode: "run" },
	{ f: 0.318, x: 1046, d: 25, mode: "stand" },
	{ f: 0.348, x: 1046, d: 25, mode: "run" },
	{ f: 0.38, x: 1090, d: 21, mode: "hidden" },
	{ f: 1, x: 1090, d: 21, mode: "hidden" },
];

export function YardChildren({ season }: { season: Season }) {
	const outfit: Outfit = season === "summer" ? "summer" : "autumn";
	return (
		<g className='children'>
			<Kid route={CHASER} look={LOOKS[0]} outfit={outfit} ground={yardGround} from={0.13} to={0.386} />
			<Kid route={RUNAWAY} look={LOOKS[1]} outfit={outfit} ground={yardGround} from={0.132} to={0.388} scale={1} />
			<Kid route={LITTLE_ONE} look={LOOKS[2]} outfit={outfit} ground={yardGround} from={0.14} to={0.38} scale={0.82} />
		</g>
	);
}

/* --- winter: first they roll a snowman on the grass, then go down to the ice --- */

const SNOWMAN = { x: 1062, base: upperGround(1062) + 22 };

/* each part is rolled up and set in place in turn */
const BUILD: [number, number][] = [
	[0.142, 0.17],
	[0.176, 0.202],
	[0.208, 0.232],
	[0.236, 0.252],
];

export function Snowman() {
	const foot = useRef<SVGGElement>(null);
	const belly = useRef<SVGGElement>(null);
	const head = useRef<SVGGElement>(null);
	const trimmings = useRef<SVGGElement>(null);

	useCycleFrame((f) => {
		[foot, belly, head, trimmings].forEach((ref, index) => {
			const [from, to] = BUILD[index];
			/* rises into place as it is set down, and stands there for the rest of the day */
			const t = Math.max(0, Math.min(1, (f - from) / (to - from)));
			show(ref, f < from ? 0 : 1);
			set(ref, `translate(0 ${((1 - t) * 4).toFixed(2)}) scale(${(0.6 + t * 0.4).toFixed(3)})`);
		});
	});

	return (
		<g className='snowman' transform={`translate(${SNOWMAN.x} ${SNOWMAN.base})`}>
			<g ref={foot} opacity={0}>
				<ellipse cx={0} cy={-6} rx={7.6} ry={6.4} fill='#fbfdff' />
				<ellipse cx={0} cy={-1.6} rx={7.4} ry={2} fill='#dfe9f2' />
			</g>
			<g ref={belly} opacity={0}>
				<circle cx={0} cy={-16} r={5.4} fill='#fbfdff' />
				<circle cx={0} cy={-17.6} r={0.9} fill='#3a3a3a' />
				<circle cx={0} cy={-14.6} r={0.9} fill='#3a3a3a' />
			</g>
			<g ref={head} opacity={0}>
				<circle cx={0} cy={-24.4} r={3.9} fill='#fbfdff' />
				<circle cx={-1.5} cy={-25.4} r={0.7} fill='#2a2a2a' />
				<circle cx={1.5} cy={-25.4} r={0.7} fill='#2a2a2a' />
				<path d='M0.4,-24 L4.6,-22.8 L0.4,-22.2 Z' fill='#e08a2a' />
				<path d='M-2,-21.6 C-0.8,-20.8 0.8,-20.8 2,-21.6' stroke='#2a2a2a' strokeWidth={0.6} fill='none' strokeLinecap='round' />
			</g>
			<g ref={trimmings} opacity={0}>
				{/* twig arms, a bucket for a hat and a scarf like the children's */}
				<path d='M-5,-17.4 L-11,-21 M-11,-21 L-13,-23.4 M-11,-21 L-13.4,-20.2' stroke='#6b4a2f' strokeWidth={0.8} fill='none' strokeLinecap='round' />
				<path d='M5,-17.4 L11.4,-20 M11.4,-20 L13.6,-22.2 M11.4,-20 L13.8,-19.4' stroke='#6b4a2f' strokeWidth={0.8} fill='none' strokeLinecap='round' />
				<path d='M-3.6,-27.6 L3.6,-27.6 L2.8,-33.4 L-2.8,-33.4 Z' fill='#7f8a94' />
				<path d='M-4.4,-27.8 L4.4,-27.8 L4.4,-26.6 L-4.4,-26.6 Z' fill='#697580' />
				<path d='M-3.8,-21.2 C-1.4,-20 1.4,-20 3.8,-21.2 L4,-19.2 C1.4,-18 -1.4,-18 -4,-19.2 Z' fill='#c0392b' />
				<path d='M3,-19.6 L5,-19.8 L5.6,-15.6 L3.6,-15.4 Z' fill='#c0392b' />
			</g>
		</g>
	);
}

const ROLLER_ONE: Waypoint<KidMode>[] = [
	{ f: 0, x: 1000, d: 22, mode: "hidden" },
	{ f: 0.125, x: 1000, d: 22, mode: "run" },
	{ f: 0.148, x: 1046, d: 24, mode: "stand" },
	{ f: 0.176, x: 1046, d: 24, mode: "run" },
	{ f: 0.206, x: 1006, d: 20, mode: "stand" },
	{ f: 0.224, x: 1006, d: 20, mode: "run" },
	{ f: 0.25, x: 1044, d: 26, mode: "stand" },
	{ f: 0.27, x: 1044, d: 26, mode: "hidden" },
	{ f: 1, x: 1044, d: 26, mode: "hidden" },
];

const ROLLER_TWO: Waypoint<KidMode>[] = [
	{ f: 0, x: 1120, d: 26, mode: "hidden" },
	{ f: 0.128, x: 1120, d: 26, mode: "run" },
	{ f: 0.164, x: 1080, d: 21, mode: "stand" },
	{ f: 0.19, x: 1080, d: 21, mode: "run" },
	{ f: 0.214, x: 1124, d: 27, mode: "jump" },
	{ f: 0.232, x: 1124, d: 27, mode: "run" },
	{ f: 0.252, x: 1082, d: 24, mode: "stand" },
	{ f: 0.272, x: 1082, d: 24, mode: "hidden" },
	{ f: 1, x: 1082, d: 24, mode: "hidden" },
];

const ROLLER_THREE: Waypoint<KidMode>[] = [
	{ f: 0, x: 1062, d: 30, mode: "hidden" },
	{ f: 0.132, x: 1062, d: 30, mode: "run" },
	{ f: 0.158, x: 1020, d: 28, mode: "jump" },
	{ f: 0.176, x: 1020, d: 28, mode: "run" },
	{ f: 0.212, x: 1100, d: 30, mode: "stand" },
	{ f: 0.236, x: 1100, d: 30, mode: "run" },
	{ f: 0.262, x: 1058, d: 29, mode: "stand" },
	{ f: 0.276, x: 1058, d: 29, mode: "hidden" },
	{ f: 1, x: 1058, d: 29, mode: "hidden" },
];

export function SnowChildren() {
	return (
		<g className='children'>
			<Kid route={ROLLER_ONE} look={LOOKS[0]} outfit='winter' ground={yardGround} from={0.125} to={0.27} />
			<Kid route={ROLLER_TWO} look={LOOKS[1]} outfit='winter' ground={yardGround} from={0.128} to={0.272} scale={1} />
			<Kid route={ROLLER_THREE} look={LOOKS[2]} outfit='winter' ground={yardGround} from={0.132} to={0.276} scale={0.82} />
		</g>
	);
}

/* --- and then, out on the ice --- */
const iceGround = (x: number) => riverTopAt(x) + 26;

const SKATER_ONE: Waypoint<KidMode>[] = [
	{ f: 0, x: 240, d: 0, mode: "hidden" },
	{ f: 0.285, x: 240, d: 0, mode: "glide" },
	{ f: 0.318, x: 760, d: 4, mode: "glide" },
	{ f: 0.346, x: 420, d: -6, mode: "glide" },
	{ f: 0.378, x: 900, d: 2, mode: "glide" },
	{ f: 0.4, x: 1020, d: -2, mode: "hidden" },
	{ f: 1, x: 1020, d: -2, mode: "hidden" },
];

const SKATER_TWO: Waypoint<KidMode>[] = [
	{ f: 0, x: 900, d: -4, mode: "hidden" },
	{ f: 0.29, x: 900, d: -4, mode: "glide" },
	{ f: 0.324, x: 420, d: 3, mode: "glide" },
	{ f: 0.356, x: 880, d: -5, mode: "glide" },
	{ f: 0.386, x: 520, d: 2, mode: "glide" },
	{ f: 0.4, x: 430, d: 2, mode: "hidden" },
	{ f: 1, x: 430, d: 2, mode: "hidden" },
];

const SKATER_THREE: Waypoint<KidMode>[] = [
	{ f: 0, x: 560, d: 6, mode: "hidden" },
	{ f: 0.295, x: 560, d: 6, mode: "glide" },
	{ f: 0.33, x: 1080, d: -3, mode: "glide" },
	{ f: 0.35, x: 1080, d: -3, mode: "stand" },
	{ f: 0.372, x: 620, d: 5, mode: "glide" },
	{ f: 0.39, x: 300, d: 1, mode: "hidden" },
	{ f: 1, x: 300, d: 1, mode: "hidden" },
];

export function IceChildren() {
	return (
		<g className='children children-ice'>
			<Kid route={SKATER_ONE} look={LOOKS[0]} outfit='winter' ground={iceGround} from={0.285} to={0.4} scale={1.35} />
			<Kid route={SKATER_TWO} look={LOOKS[1]} outfit='winter' ground={iceGround} from={0.29} to={0.4} scale={1.45} />
			<Kid route={SKATER_THREE} look={LOOKS[2]} outfit='winter' ground={iceGround} from={0.295} to={0.39} scale={1.15} />
		</g>
	);
}
