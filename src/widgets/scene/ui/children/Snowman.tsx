import { set, show, useCycleFrame } from "@/widgets/scene/model/useSceneClock";
import { upperGround } from "@/widgets/scene/lib/landscape";
import { useRef } from "react";

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
				<path
					d='M-2,-21.6 C-0.8,-20.8 0.8,-20.8 2,-21.6'
					stroke='#2a2a2a'
					strokeWidth={0.6}
					fill='none'
					strokeLinecap='round'
				/>
			</g>
			<g ref={trimmings} opacity={0}>
				{/* twig arms, a bucket for a hat and a scarf like the children's */}
				<path
					d='M-5,-17.4 L-11,-21 M-11,-21 L-13,-23.4 M-11,-21 L-13.4,-20.2'
					stroke='#6b4a2f'
					strokeWidth={0.8}
					fill='none'
					strokeLinecap='round'
				/>
				<path
					d='M5,-17.4 L11.4,-20 M11.4,-20 L13.6,-22.2 M11.4,-20 L13.8,-19.4'
					stroke='#6b4a2f'
					strokeWidth={0.8}
					fill='none'
					strokeLinecap='round'
				/>
				<path d='M-3.6,-27.6 L3.6,-27.6 L2.8,-33.4 L-2.8,-33.4 Z' fill='#7f8a94' />
				<path d='M-4.4,-27.8 L4.4,-27.8 L4.4,-26.6 L-4.4,-26.6 Z' fill='#697580' />
				<path d='M-3.8,-21.2 C-1.4,-20 1.4,-20 3.8,-21.2 L4,-19.2 C1.4,-18 -1.4,-18 -4,-19.2 Z' fill='#c0392b' />
				<path d='M3,-19.6 L5,-19.8 L5.6,-15.6 L3.6,-15.4 Z' fill='#c0392b' />
			</g>
		</g>
	);
}
