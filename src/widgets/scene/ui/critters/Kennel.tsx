import { KENNEL } from "@/widgets/scene/lib/landscape";
import { onRoute } from "@/widgets/scene/lib/choreography";
import { set, show, useCycleFrame } from "@/widgets/scene/model/useSceneClock";
import { DOG } from "@/widgets/scene/ui/critters/routes";
import { useRef } from "react";

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
