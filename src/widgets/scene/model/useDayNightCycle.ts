export type Season = "summer" | "autumn" | "winter" | "spring";

const SEASONS: Season[] = ["summer", "autumn", "winter", "spring"];

/* one full day and night is one season */
export const nextSeason = (season: Season): Season => SEASONS[(SEASONS.indexOf(season) + 1) % SEASONS.length];
