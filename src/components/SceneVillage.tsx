import { FENCE, HOMESTEAD } from "@/services/landscape";

/* Two small whitewashed хати at the right edge of the upper meadow, in the everyday
   village style: thick thatch with a dark combed eave, a small dark window with a
   light frame, curtains and a candle behind it at night, painted flowers on the
   wall, smoke from the chimney once the cold comes, and a woven wattle fence with
   clay jugs left upside down on the stakes to dry. */

/* a ring of petals with a dot in the middle, the way walls are painted */
function WallFlower({ x, y, petal }: { x: number; y: number; petal: string }) {
	return (
		<g transform={`translate(${x} ${y})`}>
			{[0, 72, 144, 216, 288].map((angle) => (
				<ellipse key={angle} cx={0} cy={-1.4} rx={0.6} ry={1.1} fill={petal} transform={`rotate(${angle})`} />
			))}
			<circle r={0.7} fill='#e8b03a' />
			<path d='M-3,2 C-1.8,0.6 -0.5,0.4 0,0.9 C-0.7,2 -2,2.5 -3,2 Z' fill='#6ea45c' />
			<path d='M3,2 C1.8,0.6 0.5,0.4 0,0.9 C0.7,2 2,2.5 3,2 Z' fill='#6ea45c' />
		</g>
	);
}

/* Slipped mouth-down over the top of a stake, the way jugs are left to dry: the
   neck grips the stake, the belly swells below it and the rim flares at the bottom. */
function Jug({ x, y }: { x: number; y: number }) {
	return (
		<g transform={`translate(${x} ${y}) scale(0.62)`}>
			<path d='M-2,0 L2,0 L2.4,2.2 C4.6,3.6 5.4,6.6 4.6,9.2 L-4.6,9.2 C-5.4,6.6 -4.6,3.6 -2.4,2.2 Z' fill='#b4653a' />
			<path d='M-5.6,9.2 L5.6,9.2 L5.6,11 C3.4,11.9 -3.4,11.9 -5.6,11 Z' fill='#9c5330' />
			<path d='M-3.8,5 C-1.4,6 1.4,6 3.8,5 L4.3,6.8 C1.4,7.8 -1.4,7.8 -4.3,6.8 Z' fill='#e6dfcd' opacity={0.8} />
			<path d='M4,2.6 C7.2,4 7.4,7.6 5,9.4' stroke='#a25a33' strokeWidth={1.2} fill='none' strokeLinecap='round' />
			<path d='M-2,0.6 C-0.6,1.3 0.6,1.3 2,0.6' stroke='#8e4a2b' strokeWidth={0.8} fill='none' strokeLinecap='round' />
		</g>
	);
}

function Cottage({ mirrored = false }: { mirrored?: boolean }) {
	return (
		<g className='cottage' transform={mirrored ? "scale(-1 1)" : undefined}>
			{/* Light thrown out of the window onto the grass, spreading as it goes: at
			    night this is what shows that a candle is burning inside. Painted first,
			    so the fence and everything else sit on top of it. */}
			<g className='window-night'>
				<path className='candle-pool' d='M-5.6,-0.6 L5.6,-0.6 L19,16 L-19,16 Z' fill='url(#candle-pool)' />
			</g>

			{/* thatch: deep straw, combed dark along the eave */}
			<path d='M0,-40 L-32,-18 Q-33.5,-16.2 -30,-16.2 L30,-16.2 Q33.5,-16.2 32,-18 Z' fill='#cba85a' />
			<g stroke='#a8853f' strokeWidth={0.7} strokeLinecap='round' opacity={0.75}>
				<path d='M-3,-36 L-23,-18 M2,-37 L-13,-18 M6,-35 L-3,-18 M9,-33 L7,-18 M13,-30 L17,-18 M18,-26.5 L26,-18' />
			</g>
			<path d='M-5,-36.2 L0,-40 L5,-36.2 C2,-37.8 -2,-37.8 -5,-36.2 Z' fill='#8f7133' />
			<path d='M-32,-18 L32,-18 L32,-15.6 L-32,-15.6 Z' fill='#4a3b26' />
			<g stroke='#4a3b26' strokeWidth={0.9} strokeLinecap='round'>
				<path d='M-29,-15.8 L-29.6,-13.4 M-24,-15.8 L-24.6,-13.6 M-19,-15.8 L-19.4,-13.2 M-14,-15.8 L-14.6,-13.5 M-9,-15.8 L-9.4,-13.2 M-4,-15.8 L-4.6,-13.6 M1,-15.8 L0.6,-13.3 M6,-15.8 L5.5,-13.6 M11,-15.8 L10.6,-13.2 M16,-15.8 L15.5,-13.5 M21,-15.8 L20.6,-13.3 M26,-15.8 L25.5,-13.6 M30,-15.8 L29.6,-13.4' />
			</g>

			{/* the chimney; its smoke is drawn in scene coordinates, see SmokeColumn */}
			<path d='M9,-41 L14,-41 L14,-32.5 L9,-33 Z' fill='#efe9dc' />
			<path d='M8.2,-42.2 L14.8,-42.2 L14.8,-40.4 L8.2,-40.4 Z' fill='#cfc7b4' />

			{/* whitewashed walls on a clay footing */}
			<path d='M-25,0 L-25,-3.2 L25,-3.2 L25,0 Z' fill='#d8c39a' />
			<path d='M-23,-3.2 L-22.6,-16.4 L22.6,-16.4 L23,-3.2 Z' fill='#f8f5ee' />
			<path d='M-22.8,-16.4 L22.8,-16.4 L22.7,-14.8 L-22.7,-14.8 Z' fill='#e6e0d2' />

			{/* window: light frame, dark panes, curtains, and a candle after dark */}
			<path d='M-7,-13.6 L7,-13.6 L7,-4.6 L-7,-4.6 Z' fill='#f2ece0' />
			<path d='M-5.4,-12.4 L5.4,-12.4 L5.4,-5.8 L-5.4,-5.8 Z' fill='#2f4a5e' />
			<g className='window-night'>
				{/* The night tint darkens everything by the same amount, and these walls
				    are whitewashed, so a pale light would vanish against them. What makes
				    a lit window read after dark is its warmth, not its brightness. */}
				{/* light thrown down the wall under the sill */}
				<path className='candle-spill' d='M-5.4,-6 L5.4,-6 L9.5,-0.2 L-9.5,-0.2 Z' fill='url(#candle-spill)' />
				<circle className='candle-halo' cx={0} cy={-9} r={17} fill='url(#candle-halo)' />
				<path className='candle-glow' d='M-5.4,-12.4 L5.4,-12.4 L5.4,-5.8 L-5.4,-5.8 Z' fill='#ffa41f' />
				<g className='candle-flame'>
					<path d='M-0.5,-7 L0.6,-7 L0.6,-9.4 L-0.5,-9.4 Z' fill='#fff3d2' />
					<path d='M0.05,-9.6 C1.1,-10.6 0.9,-11.9 0.05,-12.6 C-0.8,-11.9 -1,-10.6 0.05,-9.6 Z' fill='#fff0b0' />
				</g>
			</g>
			<path d='M-5.4,-12.4 C-3.4,-10 -3.9,-7.6 -2.9,-5.8 L-5.4,-5.8 Z' fill='#faf6ec' />
			<path d='M5.4,-12.4 C3.4,-10 3.9,-7.6 2.9,-5.8 L5.4,-5.8 Z' fill='#faf6ec' />
			<path d='M-5.4,-12.4 L5.4,-12.4 L5.4,-10.8 Q0,-9.4 -5.4,-10.8 Z' fill='#c9493a' />
			<g stroke='#f2ece0' strokeWidth={0.9}>
				<path d='M0,-12.4 L0,-5.8 M-5.4,-9.1 L5.4,-9.1' />
			</g>

			{/* plank door under the eave */}
			<path d='M-19,-3.2 L-19,-13.4 L-12,-13.4 L-12,-3.2 Z' fill='#7a5533' />
			<g stroke='#5d3f26' strokeWidth={0.6}>
				<path d='M-16.7,-13 L-16.7,-3.4 M-14.4,-13 L-14.4,-3.4' />
			</g>
			<path d='M-13.4,-8.6 a0.8,0.8 0 1,0 0.1,0' fill='#e8d9b8' />

			<WallFlower x={13} y={-9.6} petal='#c9493a' />
			<WallFlower x={17.5} y={-6.5} petal='#c96aa0' />

			{/* snow settles on the thatch in winter */}
			<g className='snow-cap' fill='#fbfdff'>
				<path d='M0,-40 L-21,-25.5 C-11.5,-29 -6,-31 0,-31.6 C6,-31 11.5,-29 21,-25.5 Z' />
				<path d='M-32,-18 L32,-18 L32,-20 C17,-19.2 -17,-19.2 -32,-20 Z' />
				<path d='M8.2,-42.2 L14.8,-42.2 L14.8,-40.9 C11.5,-41.5 9.6,-41.5 8.2,-40.9 Z' />
			</g>
		</g>
	);
}

/* woven withies between stakes, with jugs drying on three of them */
function WattleFence({ from, to }: { from: number; to: number }) {
	const stakes: number[] = [];
	for (let x = from; x <= to; x += 11) stakes.push(x);
	const weave = (y: number, phase: number) =>
		stakes
			.slice(0, -1)
			.map(
				(x, index) =>
					`M${x},${y + (index % 2 === phase ? -1.1 : 1.1)} Q${x + 5.5},${y + (index % 2 === phase ? 1.6 : -1.6)} ${x + 11},${y + (index % 2 === phase ? -1.1 : 1.1)}`,
			)
			.join(" ");

	return (
		<g className='fence'>
			<g stroke='#a98a5c' strokeWidth={1.2} strokeLinecap='round' fill='none'>
				<path d={weave(-3.6, 0)} />
				<path d={weave(-7.2, 1)} />
				<path d={weave(-10.4, 0)} />
			</g>
			<g stroke='#8d6f46' strokeWidth={1.8} strokeLinecap='round'>
				{stakes.map((x) => (
					<path key={x} d={`M${x},1 L${x},-12`} />
				))}
			</g>
			{/* on the very tops of the stakes, where they are plain to see */}
			<Jug x={stakes[1]} y={-13.4} />
			<Jug x={stakes[Math.floor(stakes.length / 2)]} y={-13.4} />
			<Jug x={stakes[stakes.length - 2]} y={-13.4} />
			<g className='snow-cap' fill='#fbfdff'>
				<path d={`M${from - 1},-11.4 L${to + 1},-11.4 L${to + 1},-10 L${from - 1},-10 Z`} />
			</g>
		</g>
	);
}

/* the pair of хати at the right edge of the upper meadow */
export function Village() {
	/* a neighbour away on the skyline, at the very edge of the hill */
	const { near, far, distant } = HOMESTEAD;

	return (
		<g className='village'>
			<defs>
				<linearGradient id='candle-pool' x1='0' y1='0' x2='0' y2='1'>
					<stop offset='0%' stopColor='#ffb43a' stopOpacity={0.8} />
					<stop offset='45%' stopColor='#ff9f22' stopOpacity={0.4} />
					<stop offset='100%' stopColor='#ff9214' stopOpacity={0} />
				</linearGradient>
				<linearGradient id='candle-spill' x1='0' y1='0' x2='0' y2='1'>
					<stop offset='0%' stopColor='#ffa41f' stopOpacity={0.5} />
					<stop offset='100%' stopColor='#ff9214' stopOpacity={0} />
				</linearGradient>
				<radialGradient id='candle-halo'>
					<stop offset='0%' stopColor='#ffb236' stopOpacity={0.8} />
					<stop offset='45%' stopColor='#ff9d1f' stopOpacity={0.32} />
					<stop offset='100%' stopColor='#ff9d1f' stopOpacity={0} />
				</radialGradient>
			</defs>
			<g transform={`translate(${distant.x} ${distant.base}) scale(${distant.scale})`} opacity={0.92}>
				<Cottage />
			</g>
			<g transform={`translate(${far.x} ${far.base}) scale(${far.scale})`}>
				<Cottage mirrored />
			</g>
			<g transform={`translate(${near.x} ${near.base}) scale(${near.scale})`}>
				<Cottage />
			</g>
		</g>
	);
}

/* Drawn on its own, from the critters layer: the householder walks behind it and
   the dog in front, so the fence has to come between them. */
export function HomesteadFence() {
	return (
		<g transform={`translate(${FENCE.x} ${FENCE.base}) scale(${FENCE.scale})`}>
			<WattleFence from={FENCE.from} to={FENCE.to} />
		</g>
	);
}
