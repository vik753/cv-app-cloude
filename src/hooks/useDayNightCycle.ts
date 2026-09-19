import { useEffect, useState } from "react";

export type DayNightPhase = "day" | "night";
export type Season = "summer" | "autumn" | "winter" | "spring";

const SEASONS: Season[] = ["summer", "autumn", "winter", "spring"];

/* one full day and night is one season */
export const nextSeason = (season: Season): Season => SEASONS[(SEASONS.indexOf(season) + 1) % SEASONS.length];

const CYCLE_MS = 46_000;

const getPhase = (startedAt: number): DayNightPhase => {
	const elapsed = (Date.now() - startedAt) % CYCLE_MS;
	return elapsed < CYCLE_MS / 2 ? "day" : "night";
};

export function useDayNightCycle(enabled: boolean): DayNightPhase {
	const [phase, setPhase] = useState<DayNightPhase>("day");

	useEffect(() => {
		if (!enabled) return;
		const startedAt = Date.now();
		const id = window.setInterval(() => setPhase(getPhase(startedAt)), 1000);
		return () => window.clearInterval(id);
	}, [enabled]);

	return phase;
}
