import { useSyncExternalStore } from "react";

/* The width at which the toolbar stops fitting on one line. It is the 560px the
   stylesheets already speak in (layout.css, panels.css), and the two have to keep
   agreeing: CSS lays the header out, this decides what is in it. The test beside this
   file holds the two together by reading the header's media query out of panels.css.

   This answers for the toolbar and nothing else. The preview's scroll used to ride the
   same boolean and no longer does: whether the preview needs scrolling to is a question
   about where it is on screen, not about how wide the window is, so it asks the element
   instead (`visibleFraction`, in lib/visibility.ts). One number in two places is already
   one too many. */
export const COMPACT_QUERY = "(max-width: 560px)";

const subscribe = (onChange: () => void) => {
	const query = window.matchMedia(COMPACT_QUERY);
	query.addEventListener("change", onChange);
	return () => query.removeEventListener("change", onChange);
};

const isCompact = () => window.matchMedia(COMPACT_QUERY).matches;

/* Which controls the header renders is a decision rather than a style, so it is taken
   here instead of in CSS. Rendering both sets and hiding one with `display: none` is
   the cheap version and it costs a measured Accessibility point: two buttons with the
   same accessible name sit in the tree, and only a sighted user can tell which one is
   real. One set at a time, and this says which.

   The viewport is an external store, not state of ours, which is exactly what
   `useSyncExternalStore` is for: it subscribes and reads in one step, so there is no
   window between the first render and an effect in which the answer could be stale. */
export function useCompactViewport(): boolean {
	return useSyncExternalStore(subscribe, isCompact);
}
