import type { Season } from "@/hooks/useDayNightCycle";
import { RIVER_PATH } from "@/services/landscape";
import type { CSSProperties } from "react";

/* What happens in the water: fish breaking the surface through the day, a piece of
   driftwood carried past at night, and in winter a lid of ice with the fish still
   moving about underneath it. */

/* Where on the water each one comes up, and how far into the loop. They share one
   loop length so the leap itself keeps the same, quick timing; the offsets are what
   keep them apart. `flip` mirrors the whole leap, so a fish heading the other way
   still goes nose first rather than backwards. */
const LEAPS = [
	{ x: 210, y: 726, delay: 1.5, scale: 1, flip: 1 },
	{ x: 640, y: 719, delay: 5.2, scale: 0.85, flip: -1 },
	{ x: 1010, y: 731, delay: 8.4, scale: 1.1, flip: 1 },
	{ x: 1380, y: 722, delay: 10.8, scale: 0.9, flip: -1 },
	{ x: 830, y: 736, delay: 3.1, scale: 0.95, flip: 1 },
];

/* the fish that stay down there under the winter ice */
const UNDER_ICE = [
	{ x: 180, y: 735, duration: 34, delay: 0, scale: 1, flip: 1 },
	{ x: 520, y: 724, duration: 44, delay: 6, scale: 0.8, flip: -1 },
	{ x: 900, y: 740, duration: 38, delay: 12, scale: 1.05, flip: 1 },
	{ x: 1240, y: 728, duration: 48, delay: 3, scale: 0.9, flip: -1 },
];

function Fish({ tone = "#6f8fa6" }: { tone?: string }) {
	return (
		<>
			<path d='M-9,0 C-6,-4.4 2,-5.2 7,-2.6 C9,-1.6 10,-0.6 10.6,0 C10,0.6 9,1.6 7,2.6 C2,5.2 -6,4.4 -9,0 Z' fill={tone} />
			<path d='M-9,0 L-15,-4 C-14,-1.4 -14,1.4 -15,4 Z' fill={tone} />
			<path d='M-1,-4.4 L1,-7.4 L4,-3.6 Z' fill={tone} opacity={0.85} />
			<circle cx={7} cy={-0.9} r={0.8} fill='#1e2c36' />
		</>
	);
}

export function RiverLife({ season }: { season: Season }) {
	const frozen = season === "winter";

	return (
		<g className='river-life'>
			{/* under the ice first: the lid is drawn over them */}
			{frozen ? (
				<g className='under-ice' clipPath='url(#river-clip)'>
					{UNDER_ICE.map((fish) => (
						<g
							key={fish.x}
							className='ice-fish'
							style={
								{
									"--swim-duration": `${fish.duration}s`,
									"--swim-delay": `-${fish.delay}s`,
									/* relative to where the fish is drawn, so it crosses the whole river */
									"--swim-from": `${(fish.flip > 0 ? -140 : 1740) - fish.x}px`,
									"--swim-to": `${(fish.flip > 0 ? 1740 : -140) - fish.x}px`,
								} as CSSProperties
							}
						>
							<g transform={`translate(${fish.x} ${fish.y}) scale(${fish.flip * fish.scale} ${fish.scale})`}>
								<Fish tone='#2b4f6b' />
							</g>
						</g>
					))}
				</g>
			) : null}

			{/* the ice itself freezes over and thaws with the season */}
			<g className='river-ice'>
				{/* thin enough to keep the water, and the fish, showing through */}
				<path d={RIVER_PATH} fill='#cfe3f0' opacity={0.76} />
				<g stroke='#f6fbff' strokeWidth={1.6} strokeLinecap='round' opacity={0.8} fill='none'>
					<path d='M120,714 L260,728 L210,746 M520,712 L610,730 L560,748 M900,716 L1010,706 L1090,724 M1280,738 L1360,720 L1470,732' />
				</g>
				<g fill='#fbfdff' opacity={0.75}>
					<path d='M0,700 C300,670 500,730 800,700 C1100,670 1300,730 1600,700 L1600,712 C1300,742 1100,682 800,712 C500,742 300,682 0,712 Z' />
					<path d='M0,748 C300,778 500,718 800,748 C1100,778 1300,718 1600,748 L1600,760 C1300,790 1100,730 800,760 C500,790 300,730 0,760 Z' />
				</g>
			</g>

			{/* through the day the fish come up for whatever lands on the water */}
			{frozen ? null : (
				<g className='river-day'>
					{LEAPS.map((fish) => {
						const timing = { "--leap-delay": `-${fish.delay}s` } as CSSProperties;
						return (
							<g key={fish.x} transform={`translate(${fish.x} ${fish.y}) scale(${fish.flip * fish.scale} ${fish.scale})`}>
								{/* the water it breaks on the way out, and where it drops back in */}
								<ellipse className='splash-out' rx={8} ry={2.4} style={timing} />
								<g className='fish-leap' style={timing}>
									<Fish />
								</g>
								<ellipse className='splash-in' cx={33} rx={9} ry={2.6} style={timing} />
								<g className='splash-drops' style={timing} fill='#eaf7ff'>
									<circle cx={30} cy={-2} r={1} />
									<circle cx={34} cy={-3.4} r={0.8} />
									<circle cx={37} cy={-1.6} r={0.9} />
								</g>
							</g>
						);
					})}
				</g>
			)}

			{/* and at night a snag drifts down with the current */}
			{frozen ? null : (
				<g className='river-night'>
					<g className='drift-log'>
						<g transform='translate(0 724)'>
							<path d='M-26,0 C-14,-3.4 8,-3.4 26,-0.6 C10,2.6 -10,2.6 -26,0 Z' fill='#6b553c' />
							<path d='M-26,0 C-14,-1.6 8,-1.6 26,-0.6 C10,0.4 -10,0.4 -26,0 Z' fill='#8a7051' />
							<path d='M-6,-1.8 C-4,-7 0,-9.6 5,-10.4 C1,-8 -1,-5 -2,-1.6 Z' fill='#6b553c' />
							<path d='M12,-1.6 C15,-5 19,-6.4 22,-6.6 C18,-4.6 16,-3 15,-1.2 Z' fill='#6b553c' />
						</g>
					</g>
				</g>
			)}
		</g>
	);
}
