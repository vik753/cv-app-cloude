import type { Season } from "@/widgets/scene/model/useDayNightCycle";
import { lowerGround } from "@/widgets/scene/lib/landscape";
import { ease, lerp, onRoute, presence, TAU } from "@/widgets/scene/lib/choreography";
import { set, show, useCycleFrame } from "@/widgets/scene/model/useSceneClock";
import { layerAt, legSwing, type Layer, type LimbProps } from "@/widgets/scene/ui/critters/rig";
import { FOX } from "@/widgets/scene/ui/critters/routes";
import { useRef } from "react";

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

/* winter coat: thick and bushy; summer coat: lean, the tail almost thin */
const FOX_COAT: Record<Season, { tail: number; body: number }> = {
	summer: { tail: 0.78, body: 0.94 },
	autumn: { tail: 1.05, body: 1.02 },
	winter: { tail: 1.32, body: 1.12 },
	spring: { tail: 0.9, body: 0.98 },
};

export function Fox({ season, layer }: { season: Season; layer: Layer }) {
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
