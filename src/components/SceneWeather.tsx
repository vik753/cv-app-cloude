import type { Season } from "@/hooks/useDayNightCycle";
import { seededRandom } from "@/services/seededRandom";
import type { CSSProperties } from "react";

const particles = <T,>(seed: number, count: number, make: (random: () => number) => T): T[] => {
	const random = seededRandom(seed);
	return Array.from({ length: count }, () => make(random));
};

const RAIN = particles(7, 90, (random) => ({
	"--x": `${random() * 100}%`,
	"--len": `${12 + random() * 10}px`,
	"--dur": `${0.55 + random() * 0.35}s`,
	"--delay": `${random() * 1.2}s`,
}));

const LEAF_COLORS = ["#e8b53a", "#e0702e", "#c9412a", "#d9a441", "#b8732f"];
const GUST_LEAVES = particles(13, 22, (random) => ({
	"--top": `${52 + random() * 44}vh`,
	"--dur": `${3.2 + random() * 2.4}s`,
	"--delay": `${random() * 4}s`,
	"--color": LEAF_COLORS[Math.floor(random() * LEAF_COLORS.length)],
}));

const STREAKS = particles(19, 9, (random) => ({
	"--top": `${30 + random() * 62}vh`,
	"--w": `${80 + random() * 140}px`,
	"--dur": `${1.1 + random() * 0.9}s`,
	"--delay": `${random() * 2}s`,
}));

/* positive delays only: the first winter morning starts clear and the snow sets in */
const SNOW = particles(29, 120, (random) => ({
	"--x": `${random() * 100}%`,
	"--size": `${2 + random() * 3.5}px`,
	"--sway": `${(random() - 0.5) * 60}px`,
	"--dur": `${7 + random() * 6}s`,
	"--delay": `${random() * 10}s`,
}));

const BLIZZARD = particles(31, 46, (random) => ({
	"--top": `${10 + random() * 85}vh`,
	"--size": `${2 + random() * 2.5}px`,
	"--drop": `${6 + random() * 14}vh`,
	"--dur": `${1 + random() * 1.2}s`,
	"--delay": `${random() * 2}s`,
}));

/* left %, top %, width px, height px, drift s */
const STORM_CLOUDS: [number, number, number, number, number][] = [
	[-8, 2, 380, 84, 38],
	[14, 9, 300, 64, 44],
	[34, 1, 440, 90, 36],
	[58, 8, 330, 70, 41],
	[78, 2, 400, 84, 47],
	[24, 15, 240, 52, 52],
	[68, 16, 260, 56, 49],
];

interface SeasonProps {
	season: Season;
}

/* sky part: sits behind the hills and eases in and out on the scene's data-season */
export function SkyWeather() {
	return (
		<>
			<div className='overcast'>
				<div className='overcast-sky' />
			</div>
			<div className='storm'>
				{STORM_CLOUDS.map(([left, top, width, height, drift], index) => (
					<div
						key={index}
						className='storm-cloud'
						style={{
							left: `${left}%`,
							top: `${top}%`,
							width,
							height,
							animationDuration: `${drift}s`,
						}}
					/>
				))}
			</div>
		</>
	);
}

/* precipitation and wind: in front of the hills. Only the current season's weather
   is mounted, so nothing animates off-screen the rest of the year. */
export function GroundWeather({ season }: SeasonProps) {
	if (season === "autumn") {
		return (
			<>
				<div className='rain'>
					{RAIN.map((drop, index) => (
						<i key={index} className='rain-drop' style={drop as CSSProperties} />
					))}
				</div>
				<div className='gust'>
					{STREAKS.map((streak, index) => (
						<i key={index} className='wind-streak' style={streak as CSSProperties} />
					))}
					{GUST_LEAVES.map((leaf, index) => (
						<i key={index} className='gust-leaf' style={leaf as CSSProperties} />
					))}
				</div>
			</>
		);
	}
	if (season === "winter") {
		return (
			<>
				<div className='snowfall'>
					{SNOW.map((flake, index) => (
						<i key={index} className='snowflake' style={flake as CSSProperties} />
					))}
				</div>
				<div className='blizzard'>
					{STREAKS.map((streak, index) => (
						<i key={index} className='wind-streak' style={streak as CSSProperties} />
					))}
					{BLIZZARD.map((flake, index) => (
						<i key={index} className='blizzard-flake' style={flake as CSSProperties} />
					))}
				</div>
			</>
		);
	}
	return null;
}
