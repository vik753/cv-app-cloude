import { useEffect, useState } from "react";

export type DayNightPhase = "day" | "night";

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
