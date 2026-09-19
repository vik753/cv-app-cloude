import { LowerCritters, UpperCritters } from "@/components/SceneCritters";
import { BackMeadow, FrontMeadow, MidMeadow, UpperBush } from "@/components/SceneFlora";
import { GroundWeather, SkyWeather } from "@/components/SceneWeather";
import { nextSeason, type Season } from "@/hooks/useDayNightCycle";
import type { Language } from "@/services/copy";
import { RIVER_TOP } from "@/services/landscape";
import { quotes, type Quote } from "@/services/quotes";
import { useEffect, useMemo, useState } from "react";

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

/* The sky keyframes in index.css run a 46s cycle: day holds from 10% to 40%,
   night from 60% to 90% (27.6s to 41.4s). The flybys are scheduled inside those
   windows and unmount once their animation ends, so being mounted at all is what
   keeps them to the right half of the cycle — they carry no opacity keyframes.
   Three comets fall per night, one per slot, and the last one still burns out
   around 41s, before the night starts fading. */
const CYCLE_MS = 46_000;
const PLANE_CUE_MS = 5_200;
const COMET_CUE_MS = 28_200;
const COMET_SLOT_MS = 4_000;
const COMET_CUE_SPREAD_MS = 3_000;
const COMET_BANDS = [0, 1, 2];

/* Banner sizing, in viewBox units. A long quote is set at BANNER_FONT_MIN and the
   cloth is stretched to fit it rather than the type being squeezed down to
   nothing; only past the stretch cap does the type give way again. */
const BANNER_CLOTH = 628;
const BANNER_SPAN = 610;
const BANNER_CHAR = 0.52;
const BANNER_FONT_MAX = 18;
const BANNER_FONT_MIN = 15;
const BANNER_FONT_FLOOR = 12;
const BANNER_STRETCH_MAX = 1.5;
const BANNER_WIDTH_PX = 680;

interface CometFlash {
	id: number;
	left: number;
	top: number;
	angle: number;
	travel: number;
	duration: number;
	/* 1 falls to the right, -1 mirrors the whole streak and falls to the left */
	flip: 1 | -1;
}

interface PlaneFlight {
	id: number;
	quote: Quote;
}

const pickQuote = (): Quote => quotes[Math.floor(Math.random() * quotes.length)];

const shuffled = <T,>(items: T[]): T[] => {
	const copy = [...items];
	for (let i = copy.length - 1; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
};

/* Each comet of the night gets its own third of the sky, so the three never bunch
   up in the same corner; the bands themselves are dealt out at random. Direction
   is a coin flip, and the band is then laid out on the side the streak starts
   from — a leftward comet placed on the left edge would be gone in a blink.
   Travel is in vw for the same reason: a fixed pixel length would shoot clean off
   a phone screen while barely moving on a wide one. */
const createComet = (id: number, band: number): CometFlash => {
	const flip: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
	const origin = flip === 1 ? 4 : 54;
	return {
		id,
		left: origin + band * 14 + Math.random() * 10,
		top: 4 + Math.random() * 26,
		angle: 16 + Math.random() * 28,
		travel: 22 + Math.random() * 16,
		duration: 1.1 + Math.random() * 0.7,
		flip,
	};
};

interface BannerPlaneProps {
	line: string;
	fontSize: number;
	stretch: number;
}

function BannerPlane({ line, fontSize, stretch }: BannerPlaneProps) {
	/* The cloth is pinned at x=28 and stretched to the right, so everything from
	   the tow rope onwards simply slides along by the same amount. */
	const cloth = (x: number) => Math.round((28 + (x - 28) * stretch) * 10) / 10;
	const tail = Math.round(BANNER_CLOTH * (stretch - 1) * 10) / 10;

	const clothRest = `M${cloth(28)},36 C${cloth(168)},24 ${cloth(328)},46 ${cloth(656)},32 L${cloth(656)},78 C${cloth(328)},92 ${cloth(168)},70 ${cloth(28)},82 Z`;
	const clothWave = `M${cloth(28)},30 C${cloth(168)},44 ${cloth(328)},26 ${cloth(656)},44 L${cloth(656)},90 C${cloth(328)},72 ${cloth(168)},90 ${cloth(28)},76 Z`;
	const lineRest = `M${cloth(40)},64 C${cloth(176)},52 ${cloth(336)},74 ${cloth(648)},60`;
	const lineWave = `M${cloth(40)},58 C${cloth(176)},72 ${cloth(336)},54 ${cloth(648)},72`;

	return (
		<svg viewBox={`0 0 ${820 + tail} 120`}>
			{/* the text rides this baseline; it waves in step with the cloth below */}
			<path id='banner-line' fill='none' stroke='none' d={lineRest}>
				<animate
					attributeName='d'
					dur='3.2s'
					repeatCount='indefinite'
					values={`${lineRest};${lineWave};${lineRest}`}
				/>
			</path>
			<path fill='#f7efdd' stroke='#c9563f' strokeWidth={3} strokeLinejoin='round' d={clothRest}>
				<animate
					attributeName='d'
					dur='3.2s'
					repeatCount='indefinite'
					values={`${clothRest};${clothWave};${clothRest}`}
				/>
			</path>
			<text fontSize={fontSize} fontWeight={600} fill='#4a3524'>
				<textPath href='#banner-line' startOffset='2%'>
					{line}
				</textPath>
			</text>

			{/* tow rope */}
			<path
				d='M656,54 C670,50 680,50 690,52'
				transform={`translate(${tail},0)`}
				fill='none'
				stroke='#6b5a44'
				strokeWidth={2}
			/>

			{/* biplane */}
			<g transform={`translate(${tail},0)`}>
				<path d='M686,50 L712,50 L712,56 L686,56 Z' fill='#c9563f' />
				<path d='M700,52 L690,30 L708,46 Z' fill='#c9563f' />
				<path
					d='M696,54 C712,44 752,40 780,45 C792,47 796,51 792,55 C788,59 760,64 724,63 C708,62 698,59 696,54 Z'
					fill='#dfe3ea'
					stroke='#4a4f5a'
					strokeWidth={2}
				/>
				<circle cx={752} cy={44} r={5} fill='#8a5a33' />
				<path d='M726,36 L728,62 M762,34 L764,62' stroke='#8d939f' strokeWidth={2.5} />
				<rect x={714} y={28} width={62} height={7} rx={3} fill='#c9563f' />
				<rect x={716} y={60} width={58} height={7} rx={3} fill='#c9563f' />
				<path d='M728,66 L726,74 M752,66 L754,74' stroke='#4a4f5a' strokeWidth={2} />
				<circle cx={726} cy={76} r={5} fill='#3c4049' />
				<circle cx={754} cy={76} r={5} fill='#3c4049' />
				<ellipse cx={794} cy={51} rx={3} ry={17} fill='#4a4f5a' opacity={0.6}>
					<animateTransform
						attributeName='transform'
						type='rotate'
						values='0 794 51;360 794 51'
						dur='0.22s'
						repeatCount='indefinite'
					/>
				</ellipse>
			</g>
		</svg>
	);
}

function SpaceStation() {
	return (
		<svg viewBox='0 0 130 54'>
			{/* truss */}
			<rect x={18} y={24} width={94} height={5} rx={2} fill='#c8cede' />
			{/* modules */}
			<rect x={54} y={15} width={26} height={21} rx={7} fill='#e6ebf5' stroke='#98a2bb' strokeWidth={1} />
			<rect x={44} y={20} width={11} height={12} rx={4} fill='#d3daea' />
			<rect x={79} y={21} width={9} height={10} rx={3} fill='#d3daea' />
			{/* radiators */}
			<rect x={60} y={38} width={15} height={4} rx={1.5} fill='#f2f5fb' opacity={0.85} />
			{/* solar wings */}
			<g fill='#2a3f77' stroke='#4a63a8' strokeWidth={0.8}>
				<rect x={4} y={7} width={27} height={13} rx={1} />
				<rect x={4} y={33} width={27} height={13} rx={1} />
				<rect x={99} y={7} width={27} height={13} rx={1} />
				<rect x={99} y={33} width={27} height={13} rx={1} />
			</g>
			<g stroke='#5f7bc4' strokeWidth={0.6} opacity={0.7}>
				<path d='M4,11.5 h27 M4,16 h27 M4,37.5 h27 M4,42 h27' />
				<path d='M99,11.5 h27 M99,16 h27 M99,37.5 h27 M99,42 h27' />
			</g>
			<path d='M20,20 L20,33 M110,20 L110,33' stroke='#98a2bb' strokeWidth={2} />
			{/* blinking lights along the wings */}
			<circle cx={5.5} cy={8.5} r={1.7} fill='#ffe9a8'>
				<animate attributeName='opacity' values='0.15;1;0.15' dur='2.6s' repeatCount='indefinite' />
			</circle>
			<circle cx={29.5} cy={44.5} r={1.7} fill='#ffe9a8'>
				<animate attributeName='opacity' values='0.15;1;0.15' dur='3.4s' begin='-1.1s' repeatCount='indefinite' />
			</circle>
			<circle cx={124.5} cy={8.5} r={1.7} fill='#ffe9a8'>
				<animate attributeName='opacity' values='0.15;1;0.15' dur='3s' begin='-2s' repeatCount='indefinite' />
			</circle>
			<circle cx={100.5} cy={44.5} r={1.7} fill='#ffe9a8'>
				<animate attributeName='opacity' values='0.15;1;0.15' dur='2.2s' begin='-0.6s' repeatCount='indefinite' />
			</circle>
			<circle cx={67} cy={13} r={1.8} fill='#ff6a5a'>
				<animate attributeName='opacity' values='1;0.1;1' dur='1.6s' repeatCount='indefinite' />
			</circle>
		</svg>
	);
}

function Bird({ variant }: { variant: 1 | 2 | 3 }) {
	return (
		<div className={`bird bird-${variant}`}>
			<svg viewBox='0 0 40 20'>
				<path d='M0,15 Q10,0 20,15 Q30,0 40,15' fill='none' stroke='#33363b' strokeWidth={3} strokeLinecap='round' />
			</svg>
		</div>
	);
}

interface DayNightSceneProps {
	active: boolean;
	language: Language;
}

export function DayNightScene({ active, language }: DayNightSceneProps) {
	const stars = useMemo(() => createStars(), []);
	const [comets, setComets] = useState<CometFlash[]>([]);
	const [flight, setFlight] = useState<PlaneFlight | null>(null);
	const [season, setSeason] = useState<Season>("summer");

	useEffect(() => {
		if (!active) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

		const pending = new Set<number>();
		const after = (delay: number, run: () => void) => {
			const id = window.setTimeout(() => {
				pending.delete(id);
				run();
			}, delay);
			pending.add(id);
		};

		let cue = 0;
		const runCycle = () => {
			cue += 1;
			after(PLANE_CUE_MS, () => setFlight({ id: cue, quote: pickQuote() }));
			shuffled(COMET_BANDS).forEach((band, slot) => {
				const id = cue * COMET_BANDS.length + slot;
				after(COMET_CUE_MS + slot * COMET_SLOT_MS + Math.random() * COMET_CUE_SPREAD_MS, () =>
					setComets((current) => [...current, createComet(id, band)]),
				);
			});
		};

		runCycle();
		/* the CSS day starts over at every tick, so each dawn opens the next season */
		const cycleId = window.setInterval(() => {
			runCycle();
			setSeason(nextSeason);
		}, CYCLE_MS);
		return () => {
			window.clearInterval(cycleId);
			setSeason("summer");
			pending.forEach((id) => window.clearTimeout(id));
			setComets([]);
			setFlight(null);
		};
	}, [active]);

	const banner = flight ? `“${language === "uk" ? flight.quote.uk : flight.quote.en}” — ${flight.quote.author}` : "";
	const bannerChars = Math.max(banner.length, 1);
	const bannerStretch = Math.min(
		BANNER_STRETCH_MAX,
		Math.max(1, (bannerChars * BANNER_CHAR * BANNER_FONT_MIN) / BANNER_SPAN),
	);
	const bannerFont = Math.max(
		BANNER_FONT_FLOOR,
		Math.min(BANNER_FONT_MAX, (BANNER_SPAN * bannerStretch) / (bannerChars * BANNER_CHAR)),
	);
	/* the element has to grow with the viewBox, otherwise a wider banner would just
	   be scaled back down to the same on-screen width and nothing would be gained */
	const bannerWidth = Math.round((BANNER_WIDTH_PX * (820 + BANNER_CLOTH * (bannerStretch - 1))) / 820);

	if (!active) return null;

	return (
		<>
			<div className='scene' data-season={season} aria-hidden='true'>
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
				<SkyWeather />
	
				<svg className='landscape' viewBox='0 0 1600 900' preserveAspectRatio='xMidYMax slice'>
					<defs>
						{/* keeps the ripples strictly inside the water, whatever the banks do */}
						<clipPath id='river-clip'>
							<path d={`${RIVER_TOP} L1600,760 C1300,790 1100,730 800,760 C500,790 300,730 0,760 Z`} />
						</clipPath>
						{/* one seamless 400-unit tile of ripples, repeated along each current row */}
						<g id='wave-tile' fill='none' stroke='#e9f6ff' strokeWidth={2.6} strokeLinecap='round'>
							<path d='M8,0 c4,-3.4 9,-3.4 13,0' />
							<path d='M64,7 c5,-4 11,-4 16,0' />
							<path d='M118,-5 c3.5,-3 8,-3 11,0' />
							<path d='M176,4 c5,-4 11,-4 16,0' />
							<path d='M232,-3 c4,-3.4 9,-3.4 13,0' />
							<path d='M288,6 c3.5,-3 8,-3 11,0' />
							<path d='M340,-2 c5,-4 11,-4 16,0' />
						</g>
					</defs>
	
					<BackMeadow season={season} />
					<UpperCritters season={season} />
					<UpperBush season={season} />
					<MidMeadow />

					{/* river */}
					<path
						d={`${RIVER_TOP} L1600,760 C1300,790 1100,730 800,760 C500,790 300,730 0,760 Z`}
						fill='#5fb0dd'
					/>
	
					{/* drifting ripples: four rows at different depth, scale and speed */}
					<g clipPath='url(#river-clip)'>
						<g transform='translate(0,712) scale(0.75)' opacity={0.3}>
							<g>
								<animateTransform
									attributeName='transform'
									type='translate'
									values='-400,0;0,0'
									dur='30s'
									repeatCount='indefinite'
								/>
								<use href='#wave-tile' x={-400} />
								<use href='#wave-tile' x={0} />
								<use href='#wave-tile' x={400} />
								<use href='#wave-tile' x={800} />
								<use href='#wave-tile' x={1200} />
								<use href='#wave-tile' x={1600} />
								<use href='#wave-tile' x={2000} />
							</g>
						</g>
						<g transform='translate(-60,730) scale(0.9)' opacity={0.36}>
							<g>
								<animateTransform
									attributeName='transform'
									type='translate'
									values='-400,0;0,0'
									dur='24s'
									repeatCount='indefinite'
								/>
								<use href='#wave-tile' x={-400} />
								<use href='#wave-tile' x={0} />
								<use href='#wave-tile' x={400} />
								<use href='#wave-tile' x={800} />
								<use href='#wave-tile' x={1200} />
								<use href='#wave-tile' x={1600} />
								<use href='#wave-tile' x={2000} />
							</g>
						</g>
						<g transform='translate(-140,746) scale(1.05)' opacity={0.42}>
							<g>
								<animateTransform
									attributeName='transform'
									type='translate'
									values='-400,0;0,0'
									dur='18s'
									repeatCount='indefinite'
								/>
								<use href='#wave-tile' x={-400} />
								<use href='#wave-tile' x={0} />
								<use href='#wave-tile' x={400} />
								<use href='#wave-tile' x={800} />
								<use href='#wave-tile' x={1200} />
								<use href='#wave-tile' x={1600} />
								<use href='#wave-tile' x={2000} />
							</g>
						</g>
						<g transform='translate(-220,760) scale(1.2)' opacity={0.38}>
							<g>
								<animateTransform
									attributeName='transform'
									type='translate'
									values='-400,0;0,0'
									dur='14s'
									repeatCount='indefinite'
								/>
								<use href='#wave-tile' x={-400} />
								<use href='#wave-tile' x={0} />
								<use href='#wave-tile' x={400} />
								<use href='#wave-tile' x={800} />
								<use href='#wave-tile' x={1200} />
								<use href='#wave-tile' x={1600} />
								<use href='#wave-tile' x={2000} />
							</g>
						</g>
					</g>
	
					{/* caravel sailing along the river */}
					<path
						id='river-course'
						d='M-350,726 C130,716 610,736 1090,726 C1400,720 1700,732 1950,726'
						fill='none'
						stroke='none'
					/>
					{/* pirate ship chasing the caravel */}
					<g>
						<animateMotion dur='42s' begin='-34.34s' repeatCount='indefinite' rotate='auto'>
							<mpath href='#river-course' />
						</animateMotion>
	
						{/* cannon ball flying towards the caravel */}
						<g>
							<animateMotion
								dur='9s'
								repeatCount='indefinite'
								calcMode='linear'
								keyPoints='0;1;1'
								keyTimes='0;0.24;1'
								path='M64,-18 C200,-100 390,-86 505,12'
							/>
							<circle r={5.5} fill='#2b2620'>
								<animate
									attributeName='opacity'
									dur='9s'
									repeatCount='indefinite'
									values='0;1;1;0;0'
									keyTimes='0;0.01;0.23;0.245;1'
								/>
							</circle>
						</g>
	
						{/* splash in front of the caravel */}
						<g transform='translate(505,14)'>
							<animateTransform
								attributeName='transform'
								type='scale'
								dur='9s'
								repeatCount='indefinite'
								additive='sum'
								values='0.2;0.2;1.1;1.35;1.35'
								keyTimes='0;0.24;0.29;0.44;1'
							/>
							<animateTransform
								attributeName='transform'
								type='translate'
								dur='9s'
								repeatCount='indefinite'
								additive='sum'
								values='0,0;0,0;-30,0;-60,0'
								keyTimes='0;0.24;0.34;1'
							/>
							<g opacity={0}>
								<animate
									attributeName='opacity'
									dur='9s'
									repeatCount='indefinite'
									values='0;0;0.95;0.7;0;0'
									keyTimes='0;0.24;0.29;0.4;0.46;1'
								/>
								<path d='M-16,2 Q0,-34 16,2 Z' fill='#eaf7ff' />
								<path d='M-26,2 Q-18,-16 -8,2 Z' fill='#d7f0ff' />
								<path d='M8,2 Q18,-18 26,2 Z' fill='#d7f0ff' />
								<circle cx={-24} cy={-20} r={3.5} fill='#eaf7ff' />
								<circle cx={0} cy={-38} r={4} fill='#eaf7ff' />
								<circle cx={22} cy={-24} r={3.5} fill='#eaf7ff' />
								<ellipse cx={0} cy={4} rx={30} ry={5} fill='none' stroke='#eaf7ff' strokeWidth={2.5} />
							</g>
						</g>
	
						<g>
							<animateTransform
								attributeName='transform'
								type='rotate'
								values='2.5;-2.5;2.5'
								dur='5.2s'
								repeatCount='indefinite'
								additive='sum'
							/>
							{/* bow wave */}
							<g>
								<animateTransform
									attributeName='transform'
									type='translate'
									values='0,0;26,4'
									dur='1.9s'
									repeatCount='indefinite'
								/>
								<path d='M52,6 c10,-6 22,-5 32,4' fill='none' stroke='#f2fbff' strokeWidth={3.4} strokeLinecap='round'>
									<animate attributeName='opacity' values='0.9;0' dur='1.9s' repeatCount='indefinite' />
								</path>
							</g>
							<g>
								<animateTransform
									attributeName='transform'
									type='translate'
									values='0,0;26,4'
									dur='1.9s'
									begin='-0.95s'
									repeatCount='indefinite'
								/>
								<path d='M52,6 c10,-6 22,-5 32,4' fill='none' stroke='#f2fbff' strokeWidth={3.4} strokeLinecap='round'>
									<animate attributeName='opacity' values='0.9;0' dur='1.9s' begin='-0.95s' repeatCount='indefinite' />
								</path>
							</g>
							{/* stern wake */}
							<g>
								<animateTransform
									attributeName='transform'
									type='translate'
									values='0,0;-34,3'
									dur='2.6s'
									repeatCount='indefinite'
								/>
								<path d='M-62,6 c-10,-4 -20,-3 -28,4' fill='none' stroke='#eaf7ff' strokeWidth={3} strokeLinecap='round'>
									<animate attributeName='opacity' values='0.7;0' dur='2.6s' repeatCount='indefinite' />
								</path>
							</g>
							<g>
								<animateTransform
									attributeName='transform'
									type='translate'
									values='0,0;-34,3'
									dur='2.6s'
									begin='-1.3s'
									repeatCount='indefinite'
								/>
								<path d='M-62,6 c-10,-4 -20,-3 -28,4' fill='none' stroke='#eaf7ff' strokeWidth={3} strokeLinecap='round'>
									<animate attributeName='opacity' values='0.7;0' dur='2.6s' begin='-1.3s' repeatCount='indefinite' />
								</path>
							</g>
							{/* hull */}
							<path d='M-58,0 C-54,16 -40,26 -24,26 L26,26 C42,26 54,14 58,0 Z' fill='#3b3027' />
							<path d='M-58,0 C-55,6 -52,9 -48,10 L54,10 C56,7 57,3 58,0 Z' fill='#5a4736' />
							{/* aftcastle */}
							<path d='M-58,0 L-58,-20 L-30,-20 L-30,0 Z' fill='#2f2720' />
							{/* bowsprit */}
							<path d='M52,-6 L80,-20' stroke='#2f2720' strokeWidth={3.5} strokeLinecap='round' />
							{/* masts */}
							<path d='M2,-2 L2,-92' stroke='#4a3a2c' strokeWidth={4.5} strokeLinecap='round' />
							<path d='M-20,-8 L-20,-64' stroke='#4a3a2c' strokeWidth={4} strokeLinecap='round' />
							{/* black sails */}
							<path d='M2,-86 C34,-64 30,-30 2,-22 Z' fill='#1f1c1a' />
							<path d='M-20,-60 C0,-46 -2,-22 -20,-18 Z' fill='#262320' />
							{/* jolly roger */}
							<g>
								<path d='M2,-92 L34,-86 L2,-78 Z' fill='#141312' />
								<circle cx={13} cy={-86} r={3.4} fill='#f2efe6' />
								<path d='M9,-81 L18,-81' stroke='#f2efe6' strokeWidth={1.6} strokeLinecap='round' />
								<path d='M9.5,-83.5 L16.5,-88.5 M9.5,-88.5 L16.5,-83.5' stroke='#f2efe6' strokeWidth={1.4} strokeLinecap='round' />
							</g>
							{/* bow cannon */}
							<g>
								<path d='M36,-10 L62,-20' stroke='#1f1c1a' strokeWidth={9} strokeLinecap='round' />
								<circle cx={36} cy={-10} r={5.5} fill='#332e28' />
								<circle cx={30} cy={-2} r={3} fill='#4a3a2c' />
								{/* muzzle flash */}
								<g opacity={0}>
									<animate
										attributeName='opacity'
										dur='9s'
										repeatCount='indefinite'
										values='1;1;0;0'
										keyTimes='0;0.012;0.05;1'
									/>
									<path d='M62,-20 L84,-30 L78,-18 L90,-16 L66,-13 Z' fill='#ffd27a' />
									<circle cx={68} cy={-21} r={6} fill='#fff1c2' />
								</g>
							</g>
							{/* helm */}
							<g stroke='#6b4a33' strokeWidth={2} fill='none'>
								<circle cx={-46} cy={-28} r={7} />
								<path d='M-53,-28 L-39,-28 M-46,-35 L-46,-21 M-51,-33 L-41,-23 M-41,-33 L-51,-23' />
							</g>
							{/* one-legged captain at the helm */}
							<g>
								<path d='M-36,-20 L-36,-30' stroke='#2b2620' strokeWidth={3} strokeLinecap='round' />
								<path d='M-29,-20 L-30,-30' stroke='#8a5a33' strokeWidth={2.6} strokeLinecap='round' />
								<path d='M-38,-30 L-27,-30 L-29,-44 L-36,-44 Z' fill='#5b2f3a' />
								<path d='M-36,-41 L-45,-32' stroke='#5b2f3a' strokeWidth={3} strokeLinecap='round' />
								<circle cx={-32.5} cy={-47} r={3.4} fill='#e8b98f' />
								<path d='M-34,-44.5 Q-32.5,-41.5 -31,-44.5' fill='#d9d3c8' />
								<path d='M-40,-49 Q-32.5,-57 -25,-49 Z' fill='#17161a' />
								<path d='M-41,-48.5 L-24,-48.5' stroke='#17161a' strokeWidth={2.2} strokeLinecap='round' />
								{/* parrot on the shoulder */}
								<ellipse cx={-25.5} cy={-45} rx={3.6} ry={2.6} fill='#d6594a' />
								<circle cx={-23} cy={-47.5} r={2} fill='#d6594a' />
								<path d='M-21.5,-47.5 L-19,-46.5 L-21.5,-45.8 Z' fill='#f2b134' />
								<path d='M-28.5,-44.5 L-33,-42 L-28,-42.5 Z' fill='#4f9e6e' />
							</g>
						</g>
					</g>
	
					<g>
						<animateMotion dur='42s' repeatCount='indefinite' rotate='auto'>
							<mpath href='#river-course' />
						</animateMotion>
						<g>
							<animateTransform
								attributeName='transform'
								type='rotate'
								values='-2.5;2.5;-2.5'
								dur='4.5s'
								repeatCount='indefinite'
								additive='sum'
							/>
							{/* bow wave */}
							<g>
								<animateTransform
									attributeName='transform'
									type='translate'
									values='0,0;24,4'
									dur='1.7s'
									repeatCount='indefinite'
								/>
								<path d='M44,5 c9,-5 20,-4 28,4' fill='none' stroke='#f2fbff' strokeWidth={3.2} strokeLinecap='round'>
									<animate attributeName='opacity' values='0.9;0' dur='1.7s' repeatCount='indefinite' />
								</path>
							</g>
							<g>
								<animateTransform
									attributeName='transform'
									type='translate'
									values='0,0;24,4'
									dur='1.7s'
									begin='-0.85s'
									repeatCount='indefinite'
								/>
								<path d='M44,5 c9,-5 20,-4 28,4' fill='none' stroke='#f2fbff' strokeWidth={3.2} strokeLinecap='round'>
									<animate attributeName='opacity' values='0.9;0' dur='1.7s' begin='-0.85s' repeatCount='indefinite' />
								</path>
							</g>
							{/* stern wake */}
							<g>
								<animateTransform
									attributeName='transform'
									type='translate'
									values='0,0;-30,3'
									dur='2.4s'
									repeatCount='indefinite'
								/>
								<path d='M-50,5 c-9,-4 -18,-3 -25,4' fill='none' stroke='#eaf7ff' strokeWidth={2.8} strokeLinecap='round'>
									<animate attributeName='opacity' values='0.7;0' dur='2.4s' repeatCount='indefinite' />
								</path>
							</g>
							<g>
								<animateTransform
									attributeName='transform'
									type='translate'
									values='0,0;-30,3'
									dur='2.4s'
									begin='-1.2s'
									repeatCount='indefinite'
								/>
								<path d='M-50,5 c-9,-4 -18,-3 -25,4' fill='none' stroke='#eaf7ff' strokeWidth={2.8} strokeLinecap='round'>
									<animate attributeName='opacity' values='0.7;0' dur='2.4s' begin='-1.2s' repeatCount='indefinite' />
								</path>
							</g>
							{/* hull */}
							<path d='M-46,0 C-42,14 -30,22 -16,22 L20,22 C34,22 44,12 48,0 Z' fill='#8a5a33' />
							<path d='M-46,0 C-42,6 -40,8 -36,9 L44,9 C46,6 47,3 48,0 Z' fill='#a97445' />
							{/* aftcastle */}
							<path d='M-46,0 L-46,-14 L-26,-14 L-26,0 Z' fill='#7a4d2b' />
							{/* bowsprit */}
							<path d='M42,-4 L66,-16' stroke='#7a4d2b' strokeWidth={3} strokeLinecap='round' />
							{/* masts */}
							<path d='M4,0 L4,-74' stroke='#6b4a33' strokeWidth={4} strokeLinecap='round' />
							<path d='M-22,-6 L-22,-52' stroke='#6b4a33' strokeWidth={3.5} strokeLinecap='round' />
							{/* lateen sails */}
							<path d='M4,-70 C32,-50 28,-22 4,-16 Z' fill='#f7f1e3' />
							<path d='M-22,-50 C-4,-36 -6,-16 -22,-12 Z' fill='#efe7d6' />
							{/* pennant */}
							<path d='M4,-74 L26,-68 L4,-62 Z' fill='#d6594a' />
						</g>
					</g>
	
					<FrontMeadow season={season} behindTrees={<LowerCritters season={season} layer='back' />} />
					<LowerCritters season={season} layer='front' />
				</svg>

				<GroundWeather season={season} />
	
				<div className='tint' />
			</div>

			{/* Everything that reads as a character sits in its own fixed layer above the
			    app shell, so it stays visible over the form instead of being painted under
			    it. The layer ignores pointer events, and portalled menus and tooltips at
			    z-index 50 still come out on top of it. */}
			<div className='scene-front' data-season={season} aria-hidden='true'>
				<div className='sun' />
				<div className='moon' />

				<Bird variant={1} />
				<Bird variant={2} />
				<Bird variant={3} />

				{flight ? (
					<div
						key={flight.id}
						className='plane-banner'
						style={{ ["--banner-width" as string]: `${bannerWidth}px` }}
						onAnimationEnd={(event) => {
							if (event.target === event.currentTarget) setFlight(null);
						}}
					>
						<BannerPlane line={banner} fontSize={bannerFont} stretch={bannerStretch} />
					</div>
				) : null}

				{comets.map((comet) => (
					<div
						key={comet.id}
						className='comet'
						style={{
							left: `${comet.left}%`,
							top: `${comet.top}%`,
							["--comet-angle" as string]: `${comet.angle}deg`,
							["--comet-travel" as string]: `${comet.travel}vw`,
							["--comet-duration" as string]: `${comet.duration}s`,
							["--comet-flip" as string]: comet.flip,
						}}
						onAnimationEnd={() => setComets((current) => current.filter((item) => item.id !== comet.id))}
					/>
				))}

				<div className='iss'>
					<SpaceStation />
				</div>
			</div>
		</>
	);
}
