import type { Season } from "@/hooks/useDayNightCycle";
import { onRoute, presence, set, show, TAU, useCycleFrame, type Waypoint } from "@/hooks/useSceneClock";
import { HOMESTEAD, upperGround } from "@/services/landscape";
import { useRef } from "react";

/* Two neighbours making their way from one хата to the other of an evening, arm in
   arm and in no hurry at all: one swinging a bottle, the other conducting, both
   singing and leaning on each other rather more than they would admit. */

type WalkMode = "hidden" | "walk";

const FROM = HOMESTEAD.near.x - 14 * HOMESTEAD.near.scale;
const TO = HOMESTEAD.far.x + 12 * HOMESTEAD.far.scale;

const ROUTE: Waypoint<WalkMode>[] = [
	{ f: 0, x: FROM, d: -24, mode: "hidden" },
	{ f: 0.42, x: FROM, d: -24, mode: "walk" },
	/* behind the fence, where the whole of them shows */
	{ f: 0.47, x: FROM + 70, d: -18, mode: "walk" },
	{ f: 0.53, x: TO - 60, d: -21, mode: "walk" },
	{ f: 0.585, x: TO, d: -18, mode: "walk" },
	{ f: 0.6, x: TO, d: -18, mode: "hidden" },
	{ f: 1, x: TO, d: -18, mode: "hidden" },
];

interface Costume {
	coat: string;
	coatDark: string;
	trim: string;
	trousers: string;
	hat?: string;
	hatBand?: string;
	hair: string;
}

/* neither of them is dressed like the one who smokes at the fence */
const COSTUMES: Record<"summer" | "coat" | "winter", [Costume, Costume]> = {
	summer: [
		{ coat: "#eef2f6", coatDark: "#d3dde6", trim: "#2f6f8f", trousers: "#2f4a63", hair: "#6b4a2f" },
		{ coat: "#f6efe0", coatDark: "#e2d6bf", trim: "#4f8a4a", trousers: "#6b4a2f", hair: "#3f2e22" },
	],
	coat: [
		{ coat: "#5c6b52", coatDark: "#47543f", trim: "#2f3b28", trousers: "#3b4636", hat: "#3b4636", hatBand: "#2f3b28", hair: "#6b4a2f" },
		{ coat: "#7a5c46", coatDark: "#644a38", trim: "#4a3729", trousers: "#4a3a2c", hat: "#4a3729", hatBand: "#3a2b21", hair: "#3f2e22" },
	],
	winter: [
		{ coat: "#d8c9a8", coatDark: "#bda884", trim: "#efe6d2", trousers: "#4a3a2c", hat: "#4a4440", hatBand: "#efe6d2", hair: "#6b4a2f" },
		{ coat: "#c9a97a", coatDark: "#ab8a5e", trim: "#efe6d2", trousers: "#3b3128", hat: "#6b4a2f", hatBand: "#efe6d2", hair: "#3f2e22" },
	],
};

interface FellowProps {
	dress: Costume;
	winter: boolean;
	summer: boolean;
	legNear: React.RefObject<SVGGElement | null>;
	legFar: React.RefObject<SVGGElement | null>;
	arm: React.RefObject<SVGGElement | null>;
	moustache: "droopy" | "beard";
	bottle?: boolean;
}

function Fellow({ dress, winter, summer, legNear, legFar, arm, moustache, bottle = false }: FellowProps) {
	const hem = summer ? -13.4 : -8.6;
	const leg = (ref: React.RefObject<SVGGElement | null>, x: number, shade: string) => (
		<g transform={`translate(${x} -13)`}>
			<g ref={ref}>
				<path d='M-2.2,0 L2.2,0 L1.9,7.4 L-1.9,7.4 Z' fill={shade} />
				<path d='M-2.1,6.8 C-2.3,9 -2.1,11 -1.9,12.4 L2.1,12.4 C2.3,11 2.3,9 2.1,6.8 Z' fill='#2e231d' />
				<path d='M-2.1,12 L2.1,12 L3.2,13.8 L-2.1,13.8 Z' fill='#2e231d' />
			</g>
		</g>
	);

	return (
		<>
			{leg(legFar, -2.4, dress.coatDark)}
			{leg(legNear, 2.4, dress.trousers)}
			{/* shirt in summer, a coat the rest of the year */}
			<path d={`M-6,${hem} C-7.2,-18.6 -4.6,-23.4 0,-23.9 C4.6,-23.4 7.2,-18.6 6,${hem} Z`} fill={dress.coat} />
			<path d={`M-0.8,-23.7 C-0.6,-18 -0.5,${hem + 1} -0.6,${hem} L0.8,${hem} C0.7,${hem + 1} 0.7,-18 0.9,-23.7 Z`} fill={dress.coatDark} />
			{summer ? (
				<>
					<path d='M-4.4,-23.4 C-2,-24.4 2,-24.4 4.4,-23.4 L3.6,-21.8 C1.6,-22.6 -1.6,-22.6 -3.6,-21.8 Z' fill={dress.trim} />
					<path d='M-6.2,-14.6 C-3,-13.4 3,-13.4 6.2,-14.6 L6.1,-12.4 C3,-11.2 -3,-11.2 -6.1,-12.4 Z' fill={dress.trim} />
				</>
			) : (
				<path d={`M-6.1,${hem - 1.6} C-3,${hem - 0.2} 3,${hem - 0.2} 6.1,${hem - 1.6} L6,${hem + 0.8} C3,${hem + 2.2} -3,${hem + 2.2} -6,${hem + 0.8} Z`} fill={dress.trim} />
			)}

			{/* the outer arm: one of them keeps time with it, the other has the bottle */}
			<g transform='translate(4.6 -21)'>
				<g ref={arm}>
					<path d='M-1.4,0 C1.2,0.8 2.6,3.4 3,6.2 L0,6.8 C-0.4,4.4 -1.2,2.4 -2.6,1.4 Z' fill={dress.coat} />
					<circle cx={1.6} cy={7.4} r={1.4} fill='#e8b98f' />
					{bottle ? (
						<g transform='translate(1.6 7.4) rotate(24)'>
							<path d='M-1.2,-0.6 L1.2,-0.6 L1.2,5.4 C1.2,6.4 -1.2,6.4 -1.2,5.4 Z' fill='#2f5d3a' />
							<path d='M-0.5,-3.4 L0.5,-3.4 L0.5,-0.6 L-0.5,-0.6 Z' fill='#2f5d3a' />
							<path d='M-0.6,-4.2 L0.6,-4.2 L0.6,-3.2 L-0.6,-3.2 Z' fill='#b08f62' />
							<path d='M-1.1,1.6 L1.1,1.6 L1.1,3.4 L-1.1,3.4 Z' fill='#e8dcc0' />
						</g>
					) : null}
				</g>
			</g>

			<g transform='translate(0 -23.9)'>
				<ellipse cx={0} cy={-3.4} rx={4.1} ry={4.6} fill='#e8b98f' />
				<circle cx={-1.8} cy={-2} r={0.9} fill='#e08b7a' opacity={winter ? 0.9 : 0.45} />
				<circle cx={1.8} cy={-2} r={0.9} fill='#e08b7a' opacity={winter ? 0.9 : 0.45} />
				{winter || !summer ? (
					<>
						<path d='M-4.6,-5.6 C-4.8,-9.4 -2.2,-11.2 0,-11.2 C2.2,-11.2 4.8,-9.4 4.6,-5.6 C2.4,-6.8 -2.4,-6.8 -4.6,-5.6 Z' fill={dress.hat ?? "#3b3128"} />
						<path d='M-4.7,-6.4 C-2.4,-7.6 2.4,-7.6 4.7,-6.4 L4.6,-4.8 C2.2,-6 -2.2,-6 -4.6,-4.8 Z' fill={dress.hatBand ?? "#2f271f"} />
					</>
				) : (
					<path d='M-4.2,-5.4 C-3.6,-8.4 3.6,-8.6 4.2,-5.4 C2.2,-6.6 -2.2,-6.6 -4.2,-5.4 Z' fill={dress.hair} />
				)}
				<circle cx={1.9} cy={-3.6} r={0.6} fill='#2a1c14' />
				{/* mouths open — they are singing */}
				<ellipse cx={1.6} cy={-0.4} rx={1.1} ry={0.9} fill='#5c3a30' />
				{moustache === "droopy" ? (
					<path
						d='M-1,-1.6 C0.8,-2.4 3,-2 4.2,-0.9 C3.4,0.8 2,2.2 0.4,2.8 C1.6,1.2 2.2,0 1.8,-0.7 C0.7,-1.3 -0.2,-1.3 -1,-1.6 Z'
						fill={dress.hair}
					/>
				) : (
					<path d='M-2.6,-1 C-1.2,-1.8 1.6,-1.8 3.2,-0.8 C3.4,1.6 2,3.4 0.2,3.6 C-1.6,3.4 -2.8,1.4 -2.6,-1 Z' fill={dress.hair} />
				)}
			</g>
		</>
	);
}

export function Revellers({ season }: { season: Season }) {
	const root = useRef<SVGGElement>(null);
	const pair = useRef<SVGGElement>(null);
	const notes = useRef<SVGGElement>(null);
	const leftNear = useRef<SVGGElement>(null);
	const leftFar = useRef<SVGGElement>(null);
	const rightNear = useRef<SVGGElement>(null);
	const rightFar = useRef<SVGGElement>(null);
	const waving = useRef<SVGGElement>(null);
	const holding = useRef<SVGGElement>(null);

	useCycleFrame((f, seconds) => {
		const at = onRoute(ROUTE, f);
		if (!at || at.mode === "hidden") {
			show(root, 0);
			return;
		}
		show(root, presence(f, 0.42, 0.6, 0.006));
		const { x, d } = at;
		set(root, `translate(${x.toFixed(1)} ${(upperGround(x) + d).toFixed(1)}) scale(0.92)`);

		/* The pair lurches as one: a long slow roll from side to side, a shorter one
		   on top of it, and a step that never quite lands when it should. */
		const roll = Math.sin(seconds * 0.42 * TAU) * 7 + Math.sin(seconds * 0.73 * TAU) * 3.5;
		const bob = Math.abs(Math.sin(seconds * 0.9 * TAU)) * -1.1;
		set(pair, `translate(${(roll * 0.25).toFixed(2)} ${bob.toFixed(2)}) rotate(${roll.toFixed(2)} 0 -12)`);

		const step = seconds * 0.9 * TAU;
		const drag = Math.sin(step) * 15 + Math.sin(step * 0.5) * 5;
		set(leftNear, `rotate(${drag.toFixed(1)})`);
		set(leftFar, `rotate(${(-drag * 0.8).toFixed(1)})`);
		set(rightNear, `rotate(${(-drag * 0.9).toFixed(1)})`);
		set(rightFar, `rotate(${(drag * 0.7).toFixed(1)})`);
		/* one keeps the beat, the other lifts the bottle now and then */
		set(waving, `rotate(${(-40 + Math.sin(seconds * 1.6 * TAU) * 46).toFixed(1)})`);
		set(holding, `rotate(${(-8 + Math.max(0, Math.sin(seconds * 0.35 * TAU)) * -54).toFixed(1)})`);
		show(notes, 1);
	});

	const dress = season === "winter" ? COSTUMES.winter : season === "summer" ? COSTUMES.summer : COSTUMES.coat;
	const summer = season === "summer";
	const winter = season === "winter";

	return (
		<g ref={root} className='critter revellers' opacity={0}>
			<g ref={pair}>
				<g transform='translate(-7 0)'>
					<Fellow dress={dress[0]} winter={winter} summer={summer} legNear={leftNear} legFar={leftFar} arm={waving} moustache='droopy' />
				</g>
				<g transform='translate(7 0)'>
					<Fellow
						dress={dress[1]}
						winter={winter}
						summer={summer}
						legNear={rightNear}
						legFar={rightFar}
						arm={holding}
						moustache='beard'
						bottle
					/>
				</g>
				{/* the arms across each other's shoulders, which is what keeps them upright */}
				<path d='M-7,-21.4 C-3,-23.4 3,-23.4 7,-21.4 L7,-19.4 C3,-21.2 -3,-21.2 -7,-19.4 Z' fill={dress[0].coatDark} />
				<g ref={notes} className='song-notes' opacity={0} fill='#f1ece0'>
					<g className='song-note' style={{ "--note-delay": "0s" } as React.CSSProperties}>
						<path d='M-9,-27 L-9,-32.4 L-6.4,-33.2 L-6.4,-31.6 L-7.8,-31.2 L-7.8,-27.4 C-7.8,-26.4 -9.6,-26.2 -9.6,-27.2 C-9.6,-27.8 -9.3,-27 -9,-27 Z' />
					</g>
					<g className='song-note' style={{ "--note-delay": "1.4s" } as React.CSSProperties}>
						<path d='M3,-29 L3,-34.4 L5.6,-35.2 L5.6,-33.6 L4.2,-33.2 L4.2,-29.4 C4.2,-28.4 2.4,-28.2 2.4,-29.2 C2.4,-29.8 2.7,-29 3,-29 Z' />
					</g>
					<g className='song-note' style={{ "--note-delay": "2.6s" } as React.CSSProperties}>
						<path d='M-2,-31 L-2,-35.8 L0.4,-36.6 L0.4,-35.2 L-0.9,-34.8 L-0.9,-31.4 C-0.9,-30.5 -2.6,-30.3 -2.6,-31.2 C-2.6,-31.8 -2.3,-31 -2,-31 Z' />
					</g>
				</g>
			</g>
		</g>
	);
}
