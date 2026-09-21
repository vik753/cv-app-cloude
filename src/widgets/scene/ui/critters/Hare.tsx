import { upperGround } from "@/widgets/scene/lib/landscape";
import { ease, lerp, presence } from "@/widgets/scene/lib/choreography";
import { set, show, useCycleFrame } from "@/widgets/scene/model/useSceneClock";
import { locate } from "@/widgets/scene/ui/critters/rig";
import { HARE } from "@/widgets/scene/ui/critters/routes";
import { useRef } from "react";

export function Hare() {
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
