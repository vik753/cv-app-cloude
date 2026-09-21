interface BrandLogoProps {
	className?: string;
}

export function BrandLogo({ className }: BrandLogoProps) {
	return (
		<svg
			className={className}
			width='72'
			height='40'
			viewBox='0 0 72 40'
			fill='none'
			role='img'
			aria-label='not boring CV'
		>
			<text
				x='36'
				y='9'
				fill='var(--muted)'
				fontFamily='var(--font-mono)'
				fontSize='10'
				letterSpacing='0.02em'
				textAnchor='middle'
			>
				not boring
			</text>
			<g transform='translate(8 13) scale(0.8)'>
				<g transform='rotate(-8 15 16)'>
					<rect x='5' y='3' width='20' height='26' rx='4' fill='var(--accent)' />
					<path d='M19 3h2a4 4 0 0 1 4 4v2h-2a4 4 0 0 1-4-4V3Z' fill='var(--tint)' />
					<path d='M9 14.5c1.5-2 3-2 4.5 0s3 2 4.5 0' stroke='var(--tint)' strokeWidth='1.8' strokeLinecap='round' />
					<path d='M9 20.5h8M9 24h5' stroke='var(--tint)' strokeWidth='1.8' strokeLinecap='round' />
				</g>
				<circle cx='27.5' cy='5' r='2' fill='var(--accent-text)' />
			</g>
			<text
				x='33'
				y='36'
				fill='currentColor'
				fontFamily='var(--font-display)'
				fontSize='20'
				fontWeight='700'
				letterSpacing='0.04em'
			>
				CV
			</text>
		</svg>
	);
}
