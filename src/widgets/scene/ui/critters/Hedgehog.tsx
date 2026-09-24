import type { Season } from "@/widgets/scene/lib/season";
import { APPLE_TREE, UPPER_BUSH, upperGround } from "@/widgets/scene/lib/landscape";
import { lerp, presence, TAU } from "@/widgets/scene/lib/choreography";
import { set, show, useCycleFrame } from "@/widgets/scene/model/useSceneClock";
import { locate, type Segment } from "@/widgets/scene/ui/critters/rig";
import { useRef } from "react";

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

export function Hedgehog({ season }: { season: Season }) {
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
