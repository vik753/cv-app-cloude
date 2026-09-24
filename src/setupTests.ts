import "@testing-library/jest-dom/vitest";

/* jsdom implements neither matchMedia nor the Web Animations API. Both are read by
   production code that behaves correctly in every real browser (`resumeStore`'s
   `readSystemMode`, and `useSceneClock`'s `.sky-day` clock via `Element.getAnimations`);
   without a stub here, mounting anything that touches them throws in tests for a
   reason no real user would ever hit. Returning "no animation running" / "no
   preference" is also exactly what keeps `useCycleFrame`'s rAF loop from starting
   in jsdom, which is what makes it safe to mount the scene at all in a test. */
if (!window.matchMedia) {
	window.matchMedia = (query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => false,
	});
}

if (!Element.prototype.getAnimations) {
	Element.prototype.getAnimations = () => [];
}

/* jsdom also has no ResizeObserver. Radix's dropdown menu (used by PaletteSwitcher)
   measures itself with one on mount; without a stub it throws asynchronously after
   the test has already finished, which vitest reports as an unhandled error against
   an unrelated, unlucky test. */
if (!window.ResizeObserver) {
	window.ResizeObserver = class ResizeObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
	};
}
