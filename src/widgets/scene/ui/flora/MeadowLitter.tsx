import type { FlowerKind, Litter } from "@/widgets/scene/ui/flora/litter";
import type { CSSProperties } from "react";

const GRASS = ["#3f8a4f", "#4c9a58", "#5aa862"];

function FlowerHead({ kind }: { kind: FlowerKind }) {
	switch (kind) {
		case "daisy":
			return (
				<>
					{[0, 72, 144, 216, 288].map((angle) => (
						<ellipse key={angle} cx={0} cy={-1.5} rx={0.8} ry={1.4} fill='#fbfbf6' transform={`rotate(${angle})`} />
					))}
					<circle r={0.9} fill='#f2c230' />
				</>
			);
		case "poppy":
			return (
				<>
					<circle r={2.1} fill='#d8352a' />
					<circle cx={-0.6} cy={-0.6} r={0.9} fill='#ea5a4a' />
					<circle r={0.6} fill='#2b1a1a' />
				</>
			);
		case "cornflower":
			return (
				<>
					{[0, 60, 120, 180, 240, 300].map((angle) => (
						<ellipse key={angle} cx={0} cy={-1.3} rx={0.6} ry={1.2} fill='#4a72d8' transform={`rotate(${angle})`} />
					))}
					<circle r={0.6} fill='#2c3f94' />
				</>
			);
		case "buttercup":
			return (
				<>
					<circle r={1.5} fill='#f2c62f' />
					<circle cx={-0.4} cy={-0.5} r={0.5} fill='#fbe58a' />
				</>
			);
	}
}

export function MeadowLitter({ specks, snowdrops, tufts, flowers }: Litter) {
	return (
		<>
			{tufts.map((tuft, index) => (
				<path
					key={index}
					className='grass'
					d='M0,0 Q-1.5,-4 -4,-7 M0,0 Q-0.5,-5 -0.8,-9.5 M0,0 Q1,-5 2.6,-8.5 M0,0 Q2.5,-3 5.2,-5'
					transform={`translate(${tuft.x.toFixed(1)} ${tuft.y.toFixed(1)}) scale(${(tuft.flip * tuft.scale).toFixed(2)} ${tuft.scale.toFixed(2)})`}
					stroke={GRASS[tuft.shade]}
					strokeWidth={1.1}
					strokeLinecap='round'
					fill='none'
				/>
			))}
			{flowers.map((flower, index) => (
				<g
					key={index}
					transform={`translate(${flower.x.toFixed(1)} ${flower.y.toFixed(1)}) scale(${flower.scale.toFixed(2)})`}
				>
					<g className='summer-flower' style={{ "--bloom-delay": `${flower.delay.toFixed(1)}s` } as CSSProperties}>
						<g transform={`rotate(${flower.lean.toFixed(1)})`}>
							<path d='M0,0 Q0.8,-4 0,-8' stroke='#4a8a45' strokeWidth={0.7} fill='none' strokeLinecap='round' />
							<path d='M0.2,-3 Q2.2,-4.2 2.8,-2.6 Q1.4,-2.2 0.2,-3 Z' fill='#56984e' />
							<g transform='translate(0 -8.4)'>
								<FlowerHead kind={flower.kind} />
							</g>
						</g>
					</g>
				</g>
			))}
			{specks.map((speck, index) => (
				<ellipse
					key={index}
					className='meadow-leaf'
					cx={speck.x}
					cy={speck.y}
					rx={speck.rx}
					ry={speck.ry}
					transform={`rotate(${speck.angle} ${speck.x} ${speck.y})`}
					fill={speck.color}
				/>
			))}
			{snowdrops.map((flower, index) => (
				<g key={index} transform={`translate(${flower.x} ${flower.y}) scale(${flower.scale})`}>
					<g className='snowdrop' style={{ "--bloom-delay": `${flower.delay}s` } as CSSProperties}>
						<path d='M0,0 C0,-5 0.5,-9 3,-11.5' stroke='#4f8a4a' strokeWidth={0.9} fill='none' strokeLinecap='round' />
						<path d='M-0.5,0 C-2.5,-3 -2.5,-6 -1.5,-8.5 C-0.8,-5.5 -0.3,-3 -0.5,0 Z' fill='#5d9a55' />
						<ellipse cx={3.6} cy={-8.6} rx={1.7} ry={2.7} fill='#fbfdff' />
						<circle cx={3.2} cy={-11.2} r={0.8} fill='#6aa85f' />
					</g>
				</g>
			))}
		</>
	);
}
