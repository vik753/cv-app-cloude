import type { Season } from "@/widgets/scene/lib/season";
import { HOMESTEAD, upperGround } from "@/widgets/scene/lib/landscape";
import { ease, onRoute, presence, TAU, type Waypoint } from "@/widgets/scene/lib/choreography";
import { set, show, useCycleFrame } from "@/widgets/scene/model/useSceneClock";
import type { Mode } from "@/widgets/scene/ui/critters/rig";
import { useRef } from "react";

/* The householder comes out on a summer afternoon while the dog is doing its
   rounds: he crosses the yard to the fence, stands there with his pipe, and when
   the slipper finds its mark he has a good laugh and goes back inside. */
const DOOR_X = HOMESTEAD.near.x - 15.5 * HOMESTEAD.near.scale;
const COSSACK: Waypoint<Mode>[] = [
	{ f: 0, x: DOOR_X, d: -28, mode: "hidden" },
	{ f: 0.168, x: DOOR_X, d: -28, mode: "walk" },
	/* across the yard to the fence, standing clear above it */
	{ f: 0.196, x: 1402, d: -16, mode: "smoke" },
	{ f: 0.316, x: 1402, d: -16, mode: "laugh" },
	{ f: 0.346, x: 1402, d: -16, mode: "walk" },
	{ f: 0.374, x: DOOR_X, d: -28, mode: "hidden" },
	{ f: 1, x: DOOR_X, d: -28, mode: "hidden" },
];

export function Cossack({ season }: { season: Season }) {
	const root = useRef<SVGGElement>(null);
	const body = useRef<SVGGElement>(null);
	const torso = useRef<SVGGElement>(null);
	const head = useRef<SVGGElement>(null);
	const arm = useRef<SVGGElement>(null);
	const armFar = useRef<SVGGElement>(null);
	const hipNear = useRef<SVGGElement>(null);
	const hipFar = useRef<SVGGElement>(null);
	const ankleNear = useRef<SVGGElement>(null);
	const ankleFar = useRef<SVGGElement>(null);
	const laughMouth = useRef<SVGGElement>(null);
	const calmMouth = useRef<SVGGElement>(null);
	const puffs = useRef<SVGGElement>(null);
	const ember = useRef<SVGGElement>(null);
	const puff1 = useRef<SVGGElement>(null);
	const puff2 = useRef<SVGGElement>(null);
	const puff3 = useRef<SVGGElement>(null);
	const heading = useRef<1 | -1>(1);
	const winter = season === "winter";

	useCycleFrame((f, seconds) => {
		const at = onRoute(COSSACK, f);
		if (!at || at.mode === "hidden") {
			show(root, 0);
			return;
		}
		const { x, d, p, mode } = at;
		if (Math.abs(at.dx) > 0.05) heading.current = at.dx > 0 ? 1 : -1;
		show(root, presence(f, 0.168, 0.374, 0.004));
		/* A walk, not a wobble: the hips swing in opposite phase, each ankle pushes off
		   and lands, the body rises twice per stride and sways a little, and the free
		   arm counters the legs. `gait` eases all of it in as he sets off and out again
		   as he stops, so nothing snaps between standing and walking. */
		const walking = mode === "walk";
		const gait = walking ? Math.min(1, p / 0.18, (1 - p) / 0.18) : 0;
		const step = seconds * 1.05 * TAU;
		const swing = Math.sin(step) * 21 * gait;
		const bob = (Math.cos(step * 2) - 1) * 0.42 * gait;
		const sway = Math.sin(step) * 1.4 * gait;
		set(
			root,
			`translate(${x.toFixed(1)} ${(upperGround(x) + d + bob).toFixed(1)}) scale(${heading.current * 0.92} 0.92)`,
		);

		/* standing: weight on one leg, the other a touch forward */
		const restNear = -5 * (1 - gait);
		const restFar = 6 * (1 - gait);
		set(hipNear, `rotate(${(swing + restNear).toFixed(1)})`);
		set(hipFar, `rotate(${(-swing + restFar).toFixed(1)})`);
		/* the trailing foot rolls off the ground, the leading one reaches flat */
		set(ankleNear, `rotate(${(Math.max(0, Math.sin(step)) * -16 * gait).toFixed(1)})`);
		set(ankleFar, `rotate(${(Math.max(0, -Math.sin(step)) * -16 * gait).toFixed(1)})`);
		set(armFar, `rotate(${(-swing * 0.75 - 6).toFixed(1)})`);

		const laughing = mode === "laugh";
		const shake = laughing ? Math.sin(seconds * 9 * TAU) * 3.5 : 0;
		set(body, `rotate(${(laughing ? -7 + shake : 0).toFixed(1)} 0 -12)`);
		set(torso, `rotate(${(sway + gait * 2.5).toFixed(2)} 0 -13)`);
		set(head, `rotate(${(laughing ? -16 + shake : Math.sin(seconds * 0.7) * 2).toFixed(1)} 0 -2)`);
		/* Smoking in full: the pipe comes up to his mouth, he draws on it, takes it
		   away, and only then does the smoke come out — from his mouth, not the bowl. */
		const smoking = mode === "smoke" && p > 0.05;
		const puffCycle = 4.6;
		const beat = smoking && !laughing ? (seconds % puffCycle) / puffCycle : -1;
		const atMouth = beat >= 0.05 && beat < 0.3 ? Math.min(1, (beat - 0.05) / 0.06, (0.3 - beat) / 0.06) : 0;
		/* his hand comes up to the bowl for the draw, and the tobacco glows while he pulls */
		set(arm, `rotate(${(laughing ? 34 : -6 - ease(atMouth) * 30).toFixed(1)})`);
		show(ember, atMouth * 0.9);
		show(laughMouth, laughing ? 1 : 0);
		show(calmMouth, laughing ? 0 : 1);
		show(puffs, smoking ? 1 : 0);
		/* three puffs let go one after another once the pipe is back down */
		[puff1, puff2, puff3].forEach((ref, index) => {
			const t = (beat - 0.34 - index * 0.045) / 0.26;
			if (beat < 0 || t < 0 || t > 1) {
				show(ref, 0);
				return;
			}
			set(ref, `translate(${(t * 7).toFixed(2)} ${(-t * 15).toFixed(2)}) scale(${(0.5 + t * 2).toFixed(2)})`);
			show(ref, Math.sin(t * Math.PI) * 0.5);
		});
	});

	return (
		<g ref={root} className='critter cossack' opacity={0}>
			<g ref={body}>
				{/* Full шаровари, gathered in under the knee, over tall boots; each leg
				    swings from its own hip and the far one is darker, so they read apart
				    as they cross. */}
				<g transform='translate(-3.2 -13)'>
					<g ref={hipFar}>
						<path
							d='M-3,0 C-5.8,1.6 -7,4.6 -5.6,7.4 C-3.6,8.6 1.6,8.6 3.8,7.4 C4.6,4.8 4.2,1.8 2.8,0 Z'
							fill='#9c2e27'
						/>
						<path d='M-5.4,7 C-3.4,8.4 1.6,8.4 3.6,7 L3.4,8.8 C1.4,9.8 -3.2,9.8 -5,8.8 Z' fill='#7f251f' />
						<path d='M-2.8,8.4 C-3,10 -3,11.6 -2.8,12.6 L2.8,12.6 C3,11.6 3,10 2.8,8.4 Z' fill='#1f1a18' />
						<g ref={ankleFar} transform='translate(0 12.4)'>
							<path d='M-2.8,-0.4 L2.8,-0.4 L4,1.6 L-2.8,1.6 Z' fill='#1f1a18' />
						</g>
					</g>
				</g>
				<path d='M-7.4,-13.8 C-8,-11.4 -7.6,-9.6 -6.8,-8.6 L6.8,-8.6 C7.6,-9.6 8,-11.4 7.4,-13.8 Z' fill='#c0392b' />
				<g transform='translate(3.2 -13)'>
					<g ref={hipNear}>
						<path
							d='M-2.8,0 C-4.2,1.8 -4.6,4.8 -3.8,7.4 C-1.6,8.6 3.6,8.6 5.6,7.4 C7,4.6 5.8,1.6 3,0 Z'
							fill='#c0392b'
						/>
						<path
							d='M-2.8,0 C-4.2,1.8 -4.6,4.8 -3.8,7.4 C-3,7.8 -2,8.1 -0.8,8.3 C-1.8,5.6 -1.8,2.6 -1,0 Z'
							fill='#a5312a'
						/>
						<path d='M-3.6,7 C-1.4,8.4 3.6,8.4 5.4,7 L5.2,8.8 C3.2,9.8 -1.6,9.8 -3.4,8.8 Z' fill='#a5312a' />
						<path d='M-2.9,8.4 C-3.1,10 -3.1,11.6 -2.9,12.6 L2.9,12.6 C3.1,11.6 3.1,10 2.9,8.4 Z' fill='#2e231d' />
						<path d='M-2.9,8.4 C-3.1,10 -3.1,11.6 -2.9,12.6 L-1.5,12.6 C-1.7,11.4 -1.7,9.8 -1.5,8.4 Z' fill='#453730' />
						<g ref={ankleNear} transform='translate(0 12.4)'>
							<path d='M-2.9,-0.4 L2.9,-0.4 L4.4,1.8 L-2.9,1.8 Z' fill='#2e231d' />
						</g>
					</g>
				</g>

				{/* shirt, sash, arms and head ride the torso, which sways with the stride */}
				<g ref={torso}>
					{/* the free arm, swinging against the legs */}
					<g transform='translate(-5 -21)'>
						<g ref={armFar}>
							<path d='M-1.4,0 C-2.8,2.6 -3,5.6 -2.4,8 L0.8,7.6 C0.4,5.2 0.6,2.6 1.4,0.6 Z' fill='#e8e2d4' />
							<path d='M-2.6,6.4 L0.8,6 L0.9,7.4 L-2.5,7.8 Z' fill='#c0392b' />
							<path d='M-2.4,7.6 L0.8,7.4 C1.4,8.6 0.8,9.6 -0.4,9.6 C-1.6,9.6 -2.4,8.8 -2.4,7.6 Z' fill='#e8b98f' />
						</g>
					</g>

					{winter ? (
						/* winter: a sheepskin coat over everything, fleece at the collar and hem */
						<>
							<path d='M-8.6,-6.4 C-9.6,-14 -6.4,-23 0,-23.7 C6.4,-23 9.6,-14 8.6,-6.4 Z' fill='#c9a97a' />
							<path
								d='M-0.9,-23.6 C-0.6,-17 -0.5,-11 -0.7,-6.5 L0.9,-6.5 C0.7,-11 0.8,-17 1.1,-23.6 Z'
								fill='#b08f62'
							/>
							<path
								d='M-8.6,-8.2 C-4.4,-6.4 4.4,-6.4 8.6,-8.2 L8.5,-5.6 C4.4,-3.8 -4.4,-3.8 -8.5,-5.6 Z'
								fill='#efe6d2'
							/>
							<path d='M-5,-23.4 C-2.2,-24.8 2.2,-24.8 5,-23.4 C3.6,-21.2 -3.6,-21.2 -5,-23.4 Z' fill='#efe6d2' />
							<path d='M-8.2,-14.6 C-4,-13.4 4,-13.4 8.2,-14.6 L8.1,-12.2 C4,-11 -4,-11 -8.1,-12.2 Z' fill='#8a5a33' />
						</>
					) : (
						<>
							{/* the embroidered shirt */}
							<path d='M-7.4,-12.6 C-8.4,-19 -5.6,-23.4 0,-23.9 C5.6,-23.4 8.4,-19 7.4,-12.6 Z' fill='#f7f4ec' />
							<g stroke='#c0392b' strokeWidth={0.75} strokeLinecap='round' fill='none'>
								<path d='M-1.9,-22.8 L-1.9,-14 M1.9,-22.8 L1.9,-14' />
								<path d='M-1,-21.2 L0,-20.1 L1,-21.2 M-1,-19 L0,-17.9 L1,-19 M-1,-16.8 L0,-15.7 L1,-16.8' />
							</g>
							<path
								d='M-3.4,-23.7 C-1.4,-24.5 1.4,-24.5 3.4,-23.7 L2.6,-22 C1,-22.6 -1,-22.6 -2.6,-22 Z'
								fill='#c0392b'
							/>

							{/* the sash, with its ends hanging down the front */}
							<path d='M-7.7,-15 C-4,-13.7 4,-13.7 7.7,-15 L7.6,-11.5 C4,-10.2 -4,-10.2 -7.6,-11.5 Z' fill='#3d9bd4' />
							<path d='M-2.6,-11.9 L0.2,-11.8 L0.5,-5.6 C0.5,-4.8 -1.5,-4.8 -1.5,-5.6 Z' fill='#3690c6' />
							<path d='M0.6,-11.8 L3.4,-12 L3.6,-3.6 C3.6,-2.8 1.6,-2.8 1.6,-3.6 Z' fill='#4aa9e0' />
						</>
					)}

					{/* the arm with the pipe */}
					<g transform='translate(5.6 -21)'>
						<g ref={arm}>
							<path d='M-1.6,0 C1.4,0.6 3,3.4 3.4,6.4 L0.4,7 C0,4.6 -1,2.6 -2.6,1.6 Z' fill='#f7f4ec' />
							<path d='M0.2,5.2 L3.5,4.8 L3.6,6.2 L0.3,6.6 Z' fill='#c0392b' />
							<path d='M2.4,5.6 L5.6,6.4 C6.4,6.6 6.4,7.8 5.4,7.8 L2.2,7.4 Z' fill='#e8b98f' />
						</g>
					</g>

					{/* head: the fur hat with its red crown hanging over, and the moustache */}
					<g transform='translate(0 -23.8)'>
						<g ref={head}>
							<ellipse cx={0} cy={-3.6} rx={4.4} ry={5} fill='#e8b98f' />
							<path
								d='M1.2,-12.6 C3.6,-11.9 5,-10 5,-7.6 C5,-5.2 4.2,-3.2 3.2,-2 C4,-5 4,-8.4 2.5,-10.8 C2.1,-11.6 1.6,-12.2 1.2,-12.6 Z'
								fill='#c0392b'
							/>
							<path
								d='M-5.2,-6.6 C-5.6,-11 -3,-13.2 0,-13.2 C3,-13.2 5.6,-11 5.2,-6.6 C2.6,-8 -2.6,-8 -5.2,-6.6 Z'
								fill='#241f1e'
							/>
							<path d='M-5.2,-7.4 C-2.6,-8.8 2.6,-8.8 5.2,-7.4 L5,-5.6 C2.4,-7 -2.4,-7 -5,-5.6 Z' fill='#161211' />
							<circle cx={2.2} cy={-4} r={0.7} fill='#2a1c14' />
							{/* The pipe stays in his teeth: the stem at his lips, the bowl forward
							    and upright, the way one is actually smoked. His hand only comes up
							    to it for a draw. */}
							<path
								d='M3,-1.5 C4.8,-1.1 6.2,-0.5 7.4,0.3'
								stroke='#5a3d2b'
								strokeWidth={0.9}
								fill='none'
								strokeLinecap='round'
							/>
							<path d='M7,-0.5 L10,-0.5 L9.5,2.8 C9.3,3.7 7.7,3.7 7.5,2.8 Z' fill='#5a3d2b' />
							<path d='M7,-0.5 L10,-0.5 L9.9,0.3 L7.1,0.3 Z' fill='#7a573c' />
							<g ref={ember} opacity={0}>
								<ellipse cx={8.5} cy={-0.2} rx={1.2} ry={0.5} fill='#ff7a2a' />
							</g>
							<g ref={calmMouth} opacity={0}>
								<path
									d='M-0.6,-1 C0.8,-1.4 2.2,-1 3,-0.2'
									stroke='#7a5a44'
									strokeWidth={0.7}
									fill='none'
									strokeLinecap='round'
								/>
							</g>
							<g ref={laughMouth} opacity={0}>
								<path d='M-0.4,-1.2 C1.2,-1.6 3,-1 3.4,0.4 C2.4,1.4 0.4,1 -0.4,-1.2 Z' fill='#5c3a30' />
							</g>
							<path
								d='M-1.4,-1.8 C0.6,-2.6 3,-2.2 4.4,-1 C3.6,0.8 2.2,2.4 0.4,3 C1.8,1.4 2.4,0 2,-0.8 C0.8,-1.4 -0.4,-1.4 -1.4,-1.8 Z'
								fill='#4a3327'
							/>
							<path
								d='M-1.4,-1.8 C-3,-2.4 -4.6,-2 -5.4,-1 C-4.6,0.6 -3.4,2.2 -1.8,2.8 C-2.8,1.2 -3.2,0 -2.8,-0.8 C-2.2,-1.4 -1.4,-1.4 -1.4,-1.8 Z'
								fill='#4a3327'
							/>
						</g>
					</g>
				</g>
			</g>
			{/* the smoke leaves his mouth, so it starts there */}
			<g ref={puffs} opacity={0} fill='#e6e9ef'>
				<g ref={puff1} opacity={0} transform='translate(0 0)'>
					<circle cx={5.4} cy={-25.4} r={1.3} />
				</g>
				<g ref={puff2} opacity={0} transform='translate(0 0)'>
					<circle cx={5.4} cy={-25.4} r={1.1} />
				</g>
				<g ref={puff3} opacity={0} transform='translate(0 0)'>
					<circle cx={5.4} cy={-25.4} r={1} />
				</g>
			</g>
		</g>
	);
}
