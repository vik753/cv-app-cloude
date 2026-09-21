export const between = (random: () => number, min: number, max: number) => min + random() * (max - min);

/* Planting on a jittered grid rather than pure chance: evenly spaced columns across
   the whole width, a few rows down the meadow, each nudged a little so the pattern
   doesn't show. Pure random placement left whole stretches bare. */
export const plantGrid = (
	random: () => number,
	columns: number,
	rows: number,
	top: (x: number) => number,
	bottom: (x: number) => number,
	margin: [number, number],
	plant: (x: number, y: number) => void,
) => {
	const step = 1600 / columns;
	for (let column = 0; column < columns; column += 1) {
		for (let row = 0; row < rows; row += 1) {
			const x = Math.min(1590, Math.max(10, (column + 0.5) * step + between(random, -0.35, 0.35) * step));
			const low = top(x) + margin[0];
			const high = bottom(x) - margin[1];
			if (high <= low) continue;
			plant(x, low + (high - low) * ((row + between(random, 0.15, 0.85)) / rows));
		}
	}
};
