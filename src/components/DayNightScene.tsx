import { useMemo } from "react";

interface Star {
	left: string;
	top: string;
	animationDelay: string;
	animationDuration: string;
}

const STAR_COUNT = 45;

const createStars = (): Star[] =>
	Array.from({ length: STAR_COUNT }, () => ({
		left: `${Math.random() * 100}%`,
		top: `${Math.random() * 55}%`,
		animationDelay: `${Math.random() * 2.4}s`,
		animationDuration: `${1.8 + Math.random() * 1.8}s`,
	}));

interface DayNightSceneProps {
	active: boolean;
}

export function DayNightScene({ active }: DayNightSceneProps) {
	const stars = useMemo(() => createStars(), []);

	if (!active) return null;

	return (
		<div className='scene' aria-hidden='true'>
			<div className='sky-layer sky-day' />
			<div className='sky-layer sky-twilight' />
			<div className='sky-layer sky-night'>
				{stars.map((star, index) => (
					<div
						key={index}
						className='star'
						style={{
							left: star.left,
							top: star.top,
							animationDelay: star.animationDelay,
							animationDuration: star.animationDuration,
						}}
					/>
				))}
			</div>

			<div className='cloud cloud-1' />
			<div className='cloud cloud-2' />

			<div className='sun' />
			<div className='moon' />

			<div className='bird bird-1'>
				<svg viewBox='0 0 40 20'>
					<path d='M0,15 Q10,0 20,15 Q30,0 40,15' fill='none' stroke='#33363b' strokeWidth={3} strokeLinecap='round' />
				</svg>
			</div>
			<div className='bird bird-2'>
				<svg viewBox='0 0 40 20'>
					<path d='M0,15 Q10,0 20,15 Q30,0 40,15' fill='none' stroke='#33363b' strokeWidth={3} strokeLinecap='round' />
				</svg>
			</div>
			<div className='bird bird-3'>
				<svg viewBox='0 0 40 20'>
					<path d='M0,15 Q10,0 20,15 Q30,0 40,15' fill='none' stroke='#33363b' strokeWidth={3} strokeLinecap='round' />
				</svg>
			</div>

			<svg className='landscape' viewBox='0 0 1600 900' preserveAspectRatio='xMidYMax slice'>
				<defs>
					<g id='pine'>
						<rect x={-4} y={30} width={8} height={16} fill='#6b4a33' />
						<polygon points='0,-32 22,18 -22,18' fill='currentColor' />
						<polygon points='0,-10 18,32 -18,32' fill='currentColor' />
					</g>
				</defs>

				{/* back hill */}
				<path
					d='M0,560 C200,480 400,520 600,500 C800,480 1000,520 1200,500 C1400,480 1600,510 1600,560 L1600,900 L0,900 Z'
					fill='#9fd8a0'
				/>
				<use href='#pine' x={140} y={520} transform='scale(0.6)' style={{ color: "#7fc084" }} />
				<use href='#pine' x={430} y={500} transform='scale(0.55)' style={{ color: "#7fc084" }} />
				<use href='#pine' x={980} y={500} transform='scale(0.6)' style={{ color: "#7fc084" }} />
				<use href='#pine' x={1300} y={495} transform='scale(0.55)' style={{ color: "#7fc084" }} />

				{/* mid hill */}
				<path
					d='M0,650 C250,600 450,640 650,615 C900,590 1100,630 1350,605 C1500,590 1600,610 1600,650 L1600,900 L0,900 Z'
					fill='#74c08a'
				/>
				<use href='#pine' x={90} y={630} transform='scale(0.85)' style={{ color: "#5aa473" }} />
				<use href='#pine' x={330} y={615} transform='scale(0.8)' style={{ color: "#5aa473" }} />
				<use href='#pine' x={760} y={600} transform='scale(0.9)' style={{ color: "#5aa473" }} />
				<use href='#pine' x={1080} y={610} transform='scale(0.8)' style={{ color: "#5aa473" }} />
				<use href='#pine' x={1450} y={620} transform='scale(0.85)' style={{ color: "#5aa473" }} />

				{/* river */}
				<path
					d='M0,700 C300,670 500,730 800,700 C1100,670 1300,730 1600,700 L1600,760 C1300,790 1100,730 800,760 C500,790 300,730 0,760 Z'
					fill='#5fb0dd'
				/>
				<path
					d='M0,715 C300,687 500,745 800,716 C1100,687 1300,745 1600,716'
					fill='none'
					stroke='#d7f0ff'
					strokeWidth={4}
					strokeLinecap='round'
					strokeDasharray='6 22'
					opacity={0.8}
				>
					<animate attributeName='stroke-dashoffset' from='0' to='-56' dur='2.2s' repeatCount='indefinite' />
				</path>

				{/* front hill */}
				<path
					d='M0,780 C200,740 400,770 650,750 C900,730 1150,770 1400,745 C1500,735 1600,750 1600,780 L1600,900 L0,900 Z'
					fill='#4f9e6e'
				/>
				<use href='#pine' x={60} y={770} transform='scale(1.05)' style={{ color: "#3d8459" }} />
				<use href='#pine' x={260} y={755} transform='scale(0.95)' style={{ color: "#3d8459" }} />
				<use href='#pine' x={700} y={740} transform='scale(1.1)' style={{ color: "#3d8459" }} />
				<use href='#pine' x={1230} y={745} transform='scale(1.0)' style={{ color: "#3d8459" }} />
				<use href='#pine' x={1500} y={760} transform='scale(1.05)' style={{ color: "#3d8459" }} />
			</svg>

			<div className='tint' />
		</div>
	);
}
