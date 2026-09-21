import type { CSSProperties } from "react";

interface PineProps {
	x: number;
	base: number;
	scale: number;
	color: string;
	/* strung with lights and topped with a star once winter comes */
	festive?: boolean;
}

/* a folk eight-pointed star, the kind carried at Christmas */
const STAR = Array.from({ length: 16 }, (_, i) => {
	const radius = i % 2 ? 2.9 : 7.4;
	const angle = (i / 16) * Math.PI * 2 - Math.PI / 2;
	return `${(Math.cos(angle) * radius).toFixed(1)},${(Math.sin(angle) * radius).toFixed(1)}`;
}).join(" ");

/* bulbs draped along both tiers */
const BULBS: [number, number, string][] = [
	[-15, 11, "#ffd54a"],
	[-8, 4.5, "#e8544a"],
	[0, 10, "#4aa9e0"],
	[8, 4, "#6fd07a"],
	[15, 10.5, "#ffd54a"],
	[-13, 27, "#e8544a"],
	[-6.5, 21, "#ffd54a"],
	[0, 26.5, "#6fd07a"],
	[6.5, 20.5, "#4aa9e0"],
	[13, 26.5, "#e8544a"],
];

export function Pine({ x, base, scale, color, festive = false }: PineProps) {
	return (
		<g transform={`translate(${x} ${base}) scale(${scale}) translate(0 -46)`}>
			<rect x={-4} y={30} width={8} height={16} fill='#6b4a33' />
			<polygon points='0,-32 22,18 -22,18' fill={color} />
			<polygon points='0,-10 18,32 -18,32' fill={color} />
			{festive ? (
				<>
					<g className='pine-lights'>
						<path
							d='M-15,11 Q-11,5 -8,4.5 Q-4,8 0,10 Q4,6 8,4 Q12,7 15,10.5'
							stroke='#5c6b52'
							strokeWidth={0.7}
							fill='none'
						/>
						<path
							d='M-13,27 Q-10,21 -6.5,21 Q-3,25 0,26.5 Q3,22 6.5,20.5 Q10,24 13,26.5'
							stroke='#5c6b52'
							strokeWidth={0.7}
							fill='none'
						/>
						{BULBS.map(([bx, by, tone], index) => (
							<circle
								key={index}
								className='pine-light'
								cx={bx}
								cy={by}
								r={1.7}
								fill={tone}
								style={{ "--bulb-delay": `${(index * 0.31).toFixed(2)}s` } as CSSProperties}
							/>
						))}
					</g>
					<g className='pine-star' transform='translate(0 -37)'>
						<circle className='star-glow' r={11} fill='#ffd54a' opacity={0.35} />
						<polygon points={STAR} fill='#ffd54a' />
						<polygon points={STAR} fill='none' stroke='#e0a92a' strokeWidth={0.5} />
						<circle r={2} fill='#fff3c4' />
						<circle r={0.9} fill='#e0a92a' />
					</g>
				</>
			) : null}
			<g className='snow-cap' fill='#fbfdff'>
				<polygon points='0,-32 9.5,-10.5 4,-13 0,-9.5 -4,-13 -9.5,-10.5' />
				<polygon points='0,-10 8.4,9.6 3.6,7.2 0,10 -3.6,7.2 -8.4,9.6' />
				<polygon points='-22,18 -14,18 -17,15.5' />
				<polygon points='22,18 14,18 17,15.5' />
			</g>
		</g>
	);
}
