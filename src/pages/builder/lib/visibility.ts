interface Box {
	top: number;
	bottom: number;
	height: number;
}

/* How much of a panel the viewport is actually showing, measured against the most it
   could possibly show: 1 when the whole panel — or a whole screenful of it — is on
   screen, 0 when none of it is. The denominator is the smaller of the panel and the
   viewport, so a panel taller than the screen is not judged against a height that can
   never fit, and a short one is not called hidden for being short. */
export const visibleFraction = (box: Box, viewportHeight: number): number => {
	const shown = Math.min(box.bottom, viewportHeight) - Math.max(box.top, 0);
	const showable = Math.min(box.height, viewportHeight);
	if (showable <= 0) return 0;
	return Math.max(0, Math.min(1, shown / showable));
};
