import { lowerGround } from "@/widgets/scene/lib/landscape";
import { onRoute, presence, TAU } from "@/widgets/scene/lib/choreography";
import { set, show, useCycleFrame } from "@/widgets/scene/model/useSceneClock";
import { layerAt, legSwing, type Layer, type LimbProps } from "@/widgets/scene/ui/critters/rig";
import { WOLF } from "@/widgets/scene/ui/critters/routes";
import { useRef, type Ref } from "react";

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

/* three long howls while the moon sails past overhead */
const HOWLS: [number, number][] = [
	[0.744, 0.778],
	[0.802, 0.838],
	[0.86, 0.896],
];

export function Wolf({ layer }: { layer: Layer }) {
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
