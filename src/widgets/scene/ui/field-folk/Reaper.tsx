import { set, show, useCycleFrame } from "@/widgets/scene/model/useSceneClock";
import { ease, lerp, onRoute, presence, TAU, type Waypoint } from "@/widgets/scene/lib/choreography";
import { bounds, upField, type WorkMode } from "@/widgets/scene/ui/field-folk/routes";
import { useRef } from "react";

/* --- the mower ---

   He works ahead of them with a scythe: a slow wind-up and then one quick stroke
   through the standing crop, over and over, stepping on a little with each. The
   blade sweeps round in the plane of the ground, which from the side is mostly a
   matter of it reaching out and drawing back in again — so the stroke is a small
   rotation of the arms and a large stretch of the snath, not a big swing of it. */
function Mower({
	root,
	bend,
	legNear,
	legFar,
	swing,
	sweep,
}: {
	root: React.RefObject<SVGGElement | null>;
	bend: React.RefObject<SVGGElement | null>;
	legNear: React.RefObject<SVGGElement | null>;
	legFar: React.RefObject<SVGGElement | null>;
	swing: React.RefObject<SVGGElement | null>;
	sweep: React.RefObject<SVGGElement | null>;
}) {
	const leg = (ref: React.RefObject<SVGGElement | null>, x: number, shade: number) => (
		<g transform={`translate(${x} -15)`}>
			<g ref={ref}>
				<path d='M-2,0 L2,0 L1.8,7.6 L-1.8,7.6 Z' fill='#4a5a6b' opacity={shade} />
				<path
					d='M-1.9,7 C-2.1,9.4 -1.9,11.6 -1.7,13 L1.9,13 C2.1,11.6 2.1,9.4 1.9,7 Z'
					fill='#3b2f26'
					opacity={shade}
				/>
				<path d='M-1.9,12.6 L1.9,12.6 L3,14.2 L-1.9,14.2 Z' fill='#2e231d' opacity={shade} />
			</g>
		</g>
	);

	return (
		<g ref={root} className='critter mower' opacity={0}>
			{leg(legFar, -2.2, 0.86)}
			{leg(legNear, 2.2, 1)}
			<g ref={bend}>
				{/* a long linen сорочка, belted, over the trousers */}
				<path d='M-5,-15.4 C-5.8,-21 -3.2,-26.4 0,-26.9 C3.2,-26.4 5.8,-21 5,-15.4 Z' fill='#f4efe4' />
				<path
					d='M-4.6,-25.4 C-2.2,-26.4 2.2,-26.4 4.6,-25.4 L3.9,-23.8 C1.9,-24.6 -1.9,-24.6 -3.9,-23.8 Z'
					fill='#b8402f'
				/>
				<path d='M-5.1,-18.4 C-2.4,-17.2 2.4,-17.2 5.1,-18.4 L5,-16.2 C2.4,-15 -2.4,-15 -5,-16.2 Z' fill='#7a5c38' />
				<g transform='translate(0 -26.9)'>
					<circle cx={0} cy={-3.4} r={3.2} fill='#e8b98f' />
					<circle cx={1.8} cy={-3.8} r={0.6} fill='#2a1c14' />
					<path
						d='M-0.6,-1.8 C0.6,-2.4 2.2,-2.2 3,-1.4 C2.5,-0.2 1.5,0.6 0.5,0.8 C1.3,-0.1 1.6,-0.8 1.3,-1.2 Z'
						fill='#4a3524'
					/>
					{/* a straw бриль against the sun */}
					<path d='M-5.6,-5.2 C-3,-6.6 3,-6.6 5.6,-5.2 L5.4,-3.9 C2.8,-5.1 -2.8,-5.1 -5.4,-3.9 Z' fill='#d9b96a' />
					<path d='M-3.2,-5.4 C-2.8,-9.4 2.8,-9.4 3.2,-5.4 C1,-6.4 -1,-6.4 -3.2,-5.4 Z' fill='#e0c478' />
				</g>
				<g ref={swing}>
					{/* both arms out to the snath, a shade off the shirt so they read */}
					<path d='M-2.6,-24.2 L2.8,-24.6 L7,-18.4 L4.6,-16.8 Z' fill='#e4dcc6' />
					<path d='M1.4,-21.4 L4,-21.8 L6.6,-17.8 L4.4,-16.6 Z' fill='#d6ccb2' />
					<circle cx={5.6} cy={-17} r={1.3} fill='#e8b98f' />
					<g transform='translate(5.6 -17)'>
						<g ref={sweep}>
							{/* the snath, and the blade lying along the ground at the end of it */}
							<path d='M-1.2,-1.2 L0.6,0.2 L11,15.4 L8.6,16.4 Z' fill='#9c7a4e' />
							<path d='M9.2,15 C16.4,12.4 24.6,12.8 30.8,15.4 C24.2,14.4 16.6,15 9.4,16.3 Z' fill='#d7dee6' />
							<path d='M9.4,16.3 C16.6,15 24.2,14.4 30.8,15.4 C23.8,16 16.2,16.9 9.6,17.9 Z' fill='#8d99a6' />
							<path d='M3,5 L5.2,3.8 L6.4,6 L4.2,7.2 Z' fill='#7a5c38' />
						</g>
					</g>
				</g>
			</g>
		</g>
	);
}

export function Reaper({ route, ground }: { route: Waypoint<WorkMode>[]; ground: (x: number) => number }) {
	const root = useRef<SVGGElement>(null);
	const bend = useRef<SVGGElement>(null);
	const legNear = useRef<SVGGElement>(null);
	const legFar = useRef<SVGGElement>(null);
	const swing = useRef<SVGGElement>(null);
	const sweep = useRef<SVGGElement>(null);
	const heading = useRef<1 | -1>(-1);
	const [from, to] = bounds(route);

	useCycleFrame((f, seconds) => {
		const at = onRoute(route, f);
		if (!at || at.mode === "hidden") {
			show(root, 0);
			return;
		}
		const { x, d, mode } = at;
		if (Math.abs(at.dx) > 0.05) heading.current = at.dx > 0 ? 1 : -1;
		show(root, presence(f, from, to, 0.005));

		/* every branch below sets all four */
		let stoop: number;
		let arc: number;
		let reach: number;
		let legs: [number, number];
		if (mode === "mow") {
			/* one stroke in three of the cycle, then the long swing back */
			const phase = (seconds * 0.5) % 1;
			const cutting = phase < 0.34;
			const p = ease(cutting ? phase / 0.34 : (phase - 0.34) / 0.66);
			arc = cutting ? lerp(20, -16, p) : lerp(-16, 20, p);
			reach = 0.5 + Math.sin(Math.PI * p) * (cutting ? 0.78 : 0.26);
			stoop = 20 + (cutting ? lerp(-5, 7, p) : lerp(7, -5, p));
			/* and half a step on with every stroke */
			legs = [7 + Math.sin(phase * TAU) * 7, -8 - Math.sin(phase * TAU) * 6];
		} else if (mode === "walk") {
			const step = Math.sin(seconds * 1.3 * TAU);
			legs = [step * 17, -step * 17];
			arc = -30;
			reach = 0.46;
			stoop = 2;
		} else {
			legs = [4, -5];
			arc = -34;
			reach = 0.4;
			stoop = 3;
		}
		const s = upField(0.9)(at);
		set(
			root,
			`translate(${x.toFixed(1)} ${(ground(x) + d).toFixed(1)}) scale(${(heading.current * s).toFixed(3)} ${s.toFixed(3)})`,
		);
		set(bend, `rotate(${stoop.toFixed(1)} 0 -17)`);
		set(legNear, `rotate(${legs[0].toFixed(1)})`);
		set(legFar, `rotate(${legs[1].toFixed(1)})`);
		set(swing, `rotate(${arc.toFixed(1)} 2 -22)`);
		set(sweep, `scale(${reach.toFixed(3)} 1)`);
	});

	return <Mower root={root} bend={bend} legNear={legNear} legFar={legFar} swing={swing} sweep={sweep} />;
}
