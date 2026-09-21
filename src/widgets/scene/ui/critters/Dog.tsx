import { HOMESTEAD, upperGround, type Point } from "@/widgets/scene/lib/landscape";
import { ease, lerp, onRoute, presence, TAU } from "@/widgets/scene/lib/choreography";
import { set, show, useCycleFrame } from "@/widgets/scene/model/useSceneClock";
import { legSwing } from "@/widgets/scene/ui/critters/rig";
import { DOG } from "@/widgets/scene/ui/critters/routes";
import { useRef, type RefObject } from "react";

/* thrown from the near хата's window at the offending corner */
const SLIPPER = {
	from: [HOMESTEAD.near.x + 2, HOMESTEAD.near.base - 9 * HOMESTEAD.near.scale] as Point,
	to: [1356, upperGround(1356) + 24] as Point,
	start: 0.3,
	land: 0.316,
	gone: 0.36,
};

export function Dog() {
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
