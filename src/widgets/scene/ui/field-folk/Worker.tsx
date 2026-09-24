import type { Season } from "@/widgets/scene/lib/season";
import { set, show, useCycleFrame } from "@/widgets/scene/model/useSceneClock";
import { onRoute, presence, TAU, type Waypoint } from "@/widgets/scene/lib/choreography";
import type { Dress } from "@/widgets/scene/ui/field-folk/dress";
import { upField, type WorkMode } from "@/widgets/scene/ui/field-folk/routes";
import { useRef } from "react";

/* the wreath's flowers, and the ribbons hanging from the back of it */
const WREATH = [
	{ x: -2.6, y: -5.2, fill: "#c0392b" },
	{ x: -1.3, y: -6.1, fill: "#e0b855" },
	{ x: 0, y: -6.4, fill: "#f2f2f2" },
	{ x: 1.3, y: -6.1, fill: "#3d7bb8" },
	{ x: 2.6, y: -5.2, fill: "#c0392b" },
];

interface WomanProps {
	dress: Dress;
	/* a basket of seed in spring, a sickle at the harvest */
	tool: "basket" | "sickle" | "none";
	coat: boolean;
	root: React.RefObject<SVGGElement | null>;
	bend: React.RefObject<SVGGElement | null>;
	legNear: React.RefObject<SVGGElement | null>;
	legFar: React.RefObject<SVGGElement | null>;
	armNear: React.RefObject<SVGGElement | null>;
	armFar: React.RefObject<SVGGElement | null>;
}

function Woman({ dress, tool, coat, root, bend, legNear, legFar, armNear, armFar }: WomanProps) {
	const leg = (ref: React.RefObject<SVGGElement | null>, x: number, shade: number) => (
		<g transform={`translate(${x} -13)`}>
			<g ref={ref}>
				<path d='M-1.7,0 L1.7,0 L1.5,7 L-1.5,7 Z' fill='#f0e8d8' opacity={shade} />
				<path
					d='M-1.6,6.4 C-1.8,8.6 -1.6,10.6 -1.4,12 L1.7,12 C1.9,10.6 1.9,8.6 1.7,6.4 Z'
					fill='#9c2f2a'
					opacity={shade}
				/>
				<path d='M-1.6,11.6 L1.7,11.6 L2.6,13 L-1.6,13 Z' fill='#5c2420' opacity={shade} />
			</g>
		</g>
	);

	const arm = (
		ref: React.RefObject<SVGGElement | null>,
		x: number,
		shade: number,
		holds: "basket" | "sickle" | "none",
	) => (
		<g transform={`translate(${x} -25)`}>
			<g ref={ref}>
				{/* the sleeve is a shade off the body of the coat, or the whole of her
				    reads as one flat slab at this size */}
				<path
					d='M-1.1,0 L1.1,0 L0.95,5.8 L-0.95,5.8 Z'
					fill={coat ? dress.sheepskinDark : dress.blouse}
					opacity={shade}
				/>
				<path
					d={coat ? "M-1,4.3 L1,4.3 L0.95,5.8 L-0.95,5.8 Z" : "M-1.08,1.3 L1.08,1.3 L1.05,2.6 L-1.05,2.6 Z"}
					fill={coat ? "#efe6d2" : dress.trim}
					opacity={shade}
				/>
				<circle cx={0} cy={6.6} r={1.15} fill='#e8b98f' opacity={shade} />
				{holds === "basket" ? (
					<g transform='translate(0 7.8)' opacity={shade}>
						<path d='M-2.4,-0.6 L2.4,-0.6 L1.9,3.4 L-1.9,3.4 Z' fill='#b08f62' />
						<path d='M-2.5,-0.9 L2.5,-0.9 L2.5,0.1 L-2.5,0.1 Z' fill='#8f7049' />
						<path d='M-1.7,-0.9 C-1.5,-2.6 1.5,-2.6 1.7,-0.9' stroke='#8f7049' strokeWidth={0.5} fill='none' />
						<path d='M-1.7,0.4 L1.7,0.4 L1.5,2 L-1.5,2 Z' fill='#e0b855' />
					</g>
				) : null}
				{holds === "sickle" ? (
					<g transform='translate(0.6 7.2) rotate(-18)' opacity={shade}>
						<path d='M-0.5,-0.8 L0.5,-0.8 L0.5,1.8 L-0.5,1.8 Z' fill='#8f7049' />
						<path d='M0.2,-1 C3.2,-1.6 5.6,-3.8 5.8,-6.8 C4.6,-4.2 2.4,-2.6 0.2,-2.2 Z' fill='#c3ccd6' />
					</g>
				) : null}
			</g>
		</g>
	);

	return (
		<g ref={root} className='critter woman' opacity={0}>
			{leg(legFar, -1.9, 0.86)}
			{leg(legNear, 1.9, 1)}
			{coat ? (
				/* a sheepskin over everything, long enough to hide the плахта */
				<>
					<path
						d='M0,-19.8 C3.8,-19.4 5.6,-14.4 6.8,-7.6 C3.4,-6.1 -3.4,-6.1 -6.8,-7.6 C-5.6,-14.4 -3.8,-19.4 0,-19.8 Z'
						fill={dress.sheepskin}
					/>
					<path
						d='M-6.8,-7.6 C-3.4,-6.1 3.4,-6.1 6.8,-7.6 L6.6,-9.6 C3.3,-8.1 -3.3,-8.1 -6.6,-9.6 Z'
						fill={dress.sheepskinDark}
					/>
					<path
						d='M-0.8,-19.6 C-0.6,-14 -0.5,-10.4 -0.6,-7.2 L0.8,-7.2 C0.7,-10.4 0.7,-14 0.9,-19.6 Z'
						fill={dress.sheepskinDark}
					/>
				</>
			) : (
				<>
					{/* плахта, with the apron over the front of it */}
					<path
						d='M0,-19.4 C3.6,-19 5.4,-14.6 6.6,-8.2 C3.3,-6.7 -3.3,-6.7 -6.6,-8.2 C-5.4,-14.6 -3.6,-19 0,-19.4 Z'
						fill={dress.skirt}
					/>
					<path
						d='M-6.6,-8.2 C-3.3,-6.7 3.3,-6.7 6.6,-8.2 L6.4,-10.1 C3.2,-8.6 -3.2,-8.6 -6.4,-10.1 Z'
						fill={dress.skirtTrim}
					/>
					<path d='M-2.8,-18.4 C-1,-18 1,-18 2.8,-18.4 L3.4,-8.6 C1.1,-7.5 -1.1,-7.5 -3.4,-8.6 Z' fill={dress.apron} />
					<path
						d='M-3.36,-9.8 C-1.1,-8.7 1.1,-8.7 3.36,-9.8 L3.4,-8.6 C1.1,-7.5 -1.1,-7.5 -3.4,-8.6 Z'
						fill={dress.trim}
					/>
				</>
			)}

			{/* everything above the waist bends over the work */}
			<g ref={bend}>
				{arm(armFar, -2.9, 0.86, tool === "basket" ? "basket" : "none")}
				{coat ? (
					<>
						<path
							d='M-3.7,-19.6 C-4.3,-23.6 -2.4,-26.6 0,-27 C2.4,-26.6 4.3,-23.6 3.7,-19.6 Z'
							fill={dress.sheepskin}
						/>
						{/* the seam down the front, and the fleece turned out at the collar */}
						<path
							d='M-0.7,-26.6 C-0.5,-23.6 -0.5,-21.4 -0.6,-19.4 L0.7,-19.4 C0.6,-21.4 0.6,-23.6 0.8,-26.6 Z'
							fill={dress.sheepskinDark}
						/>
						<path
							d='M-3,-25.4 C-1.6,-26.2 1.6,-26.2 3,-25.4 L2.8,-23.8 C1.5,-24.6 -1.5,-24.6 -2.8,-23.8 Z'
							fill='#efe6d2'
						/>
					</>
				) : (
					<>
						<path d='M-3.5,-18.8 C-4.1,-23.4 -2.3,-26.4 0,-26.8 C2.3,-26.4 4.1,-23.4 3.5,-18.8 Z' fill={dress.blouse} />
						{/* керсетка over the вишиванка, so the sleeves stay white */}
						<path
							d='M-3.3,-18.8 C-3.7,-22 -2.5,-24.2 -1.3,-25.1 L1.3,-25.1 C2.5,-24.2 3.7,-22 3.3,-18.8 Z'
							fill={dress.bodice}
						/>
						<path
							d='M-2,-25.4 C-0.7,-25.9 0.7,-25.9 2,-25.4 L2.1,-24.3 C0.7,-24.8 -0.7,-24.8 -2.1,-24.3 Z'
							fill={dress.trim}
						/>
					</>
				)}

				<g transform='translate(0 -26.8)'>
					{/* her braid and the wreath's ribbons, down her back: drawn before the
					    face so her head covers where they are tied */}
					{dress.head === "wreath" && !coat ? (
						<>
							<path d='M-3,-3.6 C-4.4,-0.6 -4.2,3.4 -3.2,5.6 L-1.5,5 C-2.4,2.8 -2.6,-0.4 -2,-2.8 Z' fill={dress.hair} />
							<path d='M-3.4,5 L-1.6,4.4 L-1.2,6.2 L-3,6.8 Z' fill={dress.trim} />
							<path
								d='M-3.4,-4.6 C-4.2,-1.6 -4.3,1.6 -3.8,4 L-2.9,3.8 C-3.3,1.4 -3.2,-1.6 -2.5,-4.2 Z'
								fill='#c0392b'
							/>
							<path
								d='M-2.6,-5.2 C-3.4,-2.4 -3.5,0.4 -3,2.6 L-2.1,2.4 C-2.5,0.2 -2.4,-2.4 -1.7,-4.8 Z'
								fill='#3d7bb8'
							/>
						</>
					) : null}
					<circle cx={0} cy={-3.2} r={3} fill='#e8b98f' />
					{dress.head === "wreath" && !coat ? (
						<>
							<path d='M-3,-3.8 C-2.6,-7 2.6,-7.2 3,-3.8 C1,-5 -1,-5 -3,-3.8 Z' fill={dress.hair} />
							{WREATH.map((flower) => (
								<circle key={flower.x} cx={flower.x} cy={flower.y} r={0.85} fill={flower.fill} />
							))}
						</>
					) : (
						/* a хустка over her hair: it wraps the crown and the back of her head
						   and is knotted under the chin, leaving her face open to the front */
						<>
							<path
								d='M0,-7.9 C2.5,-7.9 3.6,-5.8 3.4,-3.1 C3.3,-1.4 2.7,0 1.6,0.9 L0.4,-0.3 C1.4,-1.2 1.8,-2.6 1.7,-4.1 C1,-4.9 -0.6,-5.1 -2,-4.5 C-2.6,-3.3 -2.7,-1.7 -2.4,-0.3 L-3.4,0.7 C-3.8,-0.9 -3.9,-3.1 -3.5,-4.6 C-3.1,-6.6 -1.8,-7.9 0,-7.9 Z'
								fill={dress.scarf}
							/>
							<path d='M-0.3,0.3 L1.3,-0.5 L2.5,1 L0.6,1.8 Z' fill={dress.scarf} />
						</>
					)}
					<circle cx={1.6} cy={-3.2} r={0.55} fill='#2a1c14' />
					<circle cx={-1.3} cy={-2} r={0.8} fill='#e08b7a' opacity={coat ? 0.85 : 0.4} />
					<circle cx={2} cy={-2} r={0.8} fill='#e08b7a' opacity={coat ? 0.85 : 0.4} />
				</g>
				{arm(armNear, 2.9, 1, tool === "sickle" ? "sickle" : "none")}
			</g>
		</g>
	);
}

interface WorkerProps {
	route: Waypoint<WorkMode>[];
	dress: Dress;
	tool: "basket" | "sickle" | "none";
	season: Season;
	ground: (x: number) => number;
	/* how fast she gets through the work, so the two of them are never in step */
	tempo: number;
	from: number;
	to: number;
}

export function Worker({ route, dress, tool, season, ground, tempo, from, to }: WorkerProps) {
	const root = useRef<SVGGElement>(null);
	const bend = useRef<SVGGElement>(null);
	const legNear = useRef<SVGGElement>(null);
	const legFar = useRef<SVGGElement>(null);
	const armNear = useRef<SVGGElement>(null);
	const armFar = useRef<SVGGElement>(null);
	const heading = useRef<1 | -1>(-1);
	const winter = season === "winter";

	useCycleFrame((f, seconds) => {
		const at = onRoute(route, f);
		if (!at || at.mode === "hidden") {
			show(root, 0);
			return;
		}
		const { x, d, mode } = at;
		if (Math.abs(at.dx) > 0.05) heading.current = at.dx > 0 ? 1 : -1;
		show(root, presence(f, from, to, 0.005));

		const beat = seconds * tempo;
		let stoop = 0;
		let lift = 0;
		let legs: [number, number];
		let arms: [number, number];
		switch (mode) {
			case "walk": {
				const step = Math.sin(beat * 1.3 * TAU);
				legs = [step * 16, -step * 16];
				arms = [-step * 15, step * 15];
				lift = (Math.cos(beat * 2.6 * TAU) - 1) * 0.3;
				break;
			}
			case "sow": {
				/* a slow pace, and one wide throw of the arm to every other step */
				const step = Math.sin(beat * 0.85 * TAU);
				const cast = Math.sin(beat * 0.85 * TAU - 0.9);
				legs = [step * 11, -step * 11];
				arms = [-64 + cast * 62, 6];
				stoop = 5;
				break;
			}
			case "tend": {
				/* bent over the rows, working down one and up the next */
				const reach = Math.sin(beat * 0.55 * TAU);
				stoop = 46 + reach * 9;
				legs = [6, -7];
				arms = [-96 - reach * 16, -34];
				break;
			}
			case "bind": {
				/* down after an armful of what he has cut, and up again with it */
				const gather = Math.sin(beat * 0.5 * TAU);
				stoop = 52 + gather * 13;
				legs = [8, -9];
				arms = [-104 - gather * 24, -92 - gather * 20];
				break;
			}
			default: {
				const idle = Math.sin(beat * 0.3 * TAU);
				legs = [3, -4];
				arms = [-9 + idle * 5, 8 - idle * 4];
				stoop = idle * 2;
			}
		}
		const s = winter ? 0.86 : upField(0.86)(at);
		set(
			root,
			`translate(${x.toFixed(1)} ${(ground(x) + d + lift).toFixed(1)}) scale(${(heading.current * s).toFixed(3)} ${s.toFixed(3)})`,
		);
		set(bend, `rotate(${stoop.toFixed(1)} 0 -19)`);
		set(legNear, `rotate(${legs[0].toFixed(1)})`);
		set(legFar, `rotate(${legs[1].toFixed(1)})`);
		set(armNear, `rotate(${arms[0].toFixed(1)})`);
		set(armFar, `rotate(${arms[1].toFixed(1)})`);
	});

	return (
		<Woman
			dress={dress}
			tool={tool}
			coat={winter}
			root={root}
			bend={bend}
			legNear={legNear}
			legFar={legFar}
			armNear={armNear}
			armFar={armFar}
		/>
	);
}
