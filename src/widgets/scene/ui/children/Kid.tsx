import { set, show, useCycleFrame } from "@/widgets/scene/model/useSceneClock";
import { onRoute, presence, TAU, type Waypoint } from "@/widgets/scene/lib/choreography";
import type { KidLook, Outfit } from "@/widgets/scene/ui/children/looks";
import type { KidMode } from "@/widgets/scene/ui/children/routes";
import { useRef } from "react";

interface KidProps {
	route: Waypoint<KidMode>[];
	look: KidLook;
	outfit: Outfit;
	ground: (x: number) => number;
	from: number;
	to: number;
	/* a number, or — for the walk down off the meadow — one read off the route's depth */
	scale?: number | ((at: { x: number; d: number }) => number);
}

export function Kid({ route, look, outfit, ground, from, to, scale = 0.95 }: KidProps) {
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
		const s = typeof scale === "function" ? scale(at) : scale;
		set(
			root,
			`translate(${x.toFixed(1)} ${(ground(x) + d + lift).toFixed(1)}) scale(${(heading.current * s).toFixed(3)} ${s.toFixed(3)})`,
		);
		set(body, `rotate(${tilt.toFixed(1)} 0 -8)`);
		set(legNear, `rotate(${legs[0].toFixed(1)})`);
		set(legFar, `rotate(${legs[1].toFixed(1)})`);
		set(armNear, `rotate(${arms[0].toFixed(1)})`);
		set(armFar, `rotate(${arms[1].toFixed(1)})`);
	});

	const bare = outfit === "summer";
	const girl = look.girl === true;
	const coat = look.coat ?? "#c9a97a";
	/* she wears thick coloured stockings once the warm weather goes */
	const legFill = bare ? "#e8b98f" : girl ? "#6b4a63" : outfit === "autumn" ? "#4a5a6b" : "#5a4535";
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
				<path d='M-1.1,0 L1.1,0 L0.9,5.6 L-0.9,5.6 Z' fill={outfit === "winter" ? coat : look.shirt} opacity={shade} />
				<circle cx={0} cy={6.4} r={1.2} fill={outfit === "winter" ? look.trim : "#e8b98f"} opacity={shade} />
			</g>
		</g>
	);

	return (
		<g ref={root} className='critter kid' opacity={0}>
			{leg(legFar, -1.6, 0.75)}
			{arm(armFar, -2.8, 0.75)}
			<g ref={body}>
				{girl ? (
					/* the same bell all year round: a dress in the warm months, and once the
					   snow comes a coat cut just as wide, so she is a girl at a glance */
					<>
						<path
							d={
								outfit === "winter"
									? "M0,-15 C2.6,-14.6 4.2,-11 5.4,-4.6 C2.7,-3.3 -2.7,-3.3 -5.4,-4.6 C-4.2,-11 -2.6,-14.6 0,-15 Z"
									: "M0,-15 C2.6,-14.6 4,-10.6 5.8,-4 C2.9,-2.6 -2.9,-2.6 -5.8,-4 C-4,-10.6 -2.6,-14.6 0,-15 Z"
							}
							fill={outfit === "winter" ? coat : look.shirt}
						/>
						{/* embroidery at the waist and round the hem */}
						<path
							d='M-3.5,-9.8 C-1.2,-9.2 1.2,-9.2 3.5,-9.8 L3.7,-8.4 C1.2,-7.8 -1.2,-7.8 -3.7,-8.4 Z'
							fill={look.trim}
						/>
						<path
							d={
								outfit === "winter"
									? "M-5.4,-4.6 C-2.7,-3.3 2.7,-3.3 5.4,-4.6 L5.2,-5.9 C2.6,-4.7 -2.6,-4.7 -5.2,-5.9 Z"
									: "M-5.8,-4 C-2.9,-2.6 2.9,-2.6 5.8,-4 L5.6,-5.4 C2.8,-4.1 -2.8,-4.1 -5.6,-5.4 Z"
							}
							fill={look.trim}
							opacity={0.9}
						/>
					</>
				) : outfit === "winter" ? (
					<>
						<path d='M-4,-6.4 C-4.6,-11 -2.6,-14.6 0,-15 C2.6,-14.6 4.6,-11 4,-6.4 Z' fill={coat} />
						<path d='M-4,-7.4 C-2,-6.4 2,-6.4 4,-7.4 L3.9,-5.8 C2,-4.8 -2,-4.8 -3.9,-5.8 Z' fill='#efe6d2' />
					</>
				) : (
					<>
						{/* a plain linen shirt, longer on the little ones in summer */}
						<path
							d={
								bare
									? "M-4,-5.6 C-4.6,-10.6 -2.6,-14.6 0,-15 C2.6,-14.6 4.6,-10.6 4,-5.6 Z"
									: "M-3.8,-7.4 C-4.4,-11.2 -2.6,-14.6 0,-15 C2.6,-14.6 4.4,-11.2 3.8,-7.4 Z"
							}
							fill={look.shirt}
						/>
						<path
							d={bare ? "M-3.9,-8.2 L3.9,-8.2 L3.9,-6.8 L-3.9,-6.8 Z" : "M-3.8,-9 L3.8,-9 L3.8,-7.8 L-3.8,-7.8 Z"}
							fill={look.trim}
						/>
						<path d='M-0.7,-14.4 L0.7,-14.4 L0.7,-9.4 L-0.7,-9.4 Z' fill={look.trim} opacity={0.8} />
					</>
				)}
				{leg(legNear, 1.6, 1)}
				<g transform='translate(0 -15)'>
					{/* her hair goes down her back, and still shows under the hat in winter */}
					{girl ? (
						<path
							d={
								outfit === "winter"
									? "M-2.7,-2.4 C-4,-0.2 -3.9,2.4 -3,3.9 L-1.2,3.3 C-2,1.7 -2.2,-0.5 -1.6,-2.2 Z"
									: "M-3.3,-4.2 C-4.7,-1.6 -4.5,2.2 -3.4,4 L-1.3,3.4 C-2.3,1.6 -2.5,-1.2 -1.8,-3.6 Z"
							}
							fill={look.hair}
						/>
					) : null}
					<circle cx={0} cy={-2.6} r={2.8} fill='#e8b98f' />
					{outfit === "winter" ? (
						<>
							<circle cx={-1.2} cy={-1.6} r={0.9} fill='#e88b7a' />
							<circle cx={2} cy={-1.6} r={0.9} fill='#e88b7a' />
							<path
								d='M-2.9,-3.6 C-2.6,-6.4 2.6,-6.6 2.9,-3.6 C1,-4.4 -1,-4.4 -2.9,-3.6 Z'
								fill={look.hat ?? "#c0392b"}
							/>
							<circle cx={0} cy={-6.2} r={1} fill='#efe6d2' />
							<path
								d='M-3,-0.6 C-1,0.4 1.6,0.4 3,-0.6 L3.2,1.2 C1.4,2.2 -1.4,2.2 -3.2,1.2 Z'
								fill={look.scarf ?? "#3d9bd4"}
							/>
							<path d='M2.4,0.8 L4.2,0.6 L4.6,3.6 L2.8,3.8 Z' fill={look.scarf ?? "#3d9bd4"} />
						</>
					) : (
						<path d='M-2.9,-3.4 C-2.4,-6.4 2.4,-6.6 2.9,-3.4 C1,-4.6 -1,-4.6 -2.9,-3.4 Z' fill={look.hair} />
					)}
					{/* the ribbon; in winter the hat has the place it would take */}
					{girl && outfit !== "winter" ? (
						<g fill={look.bow ?? look.trim}>
							<path d='M-2.4,-4.6 L-4.6,-5.7 L-4.4,-3.2 Z' />
							<circle cx={-2.3} cy={-4.4} r={0.7} />
						</g>
					) : null}
					<circle cx={1.4} cy={-2.4} r={0.5} fill='#2a1c14' />
				</g>
				{arm(armNear, 2.6, 1)}
				{outfit === "winter" ? <path d='M2.2,-9 L4.4,-9.6 L5,-7.4 L2.8,-6.8 Z' fill={look.trim} opacity={0} /> : null}
			</g>
		</g>
	);
}
