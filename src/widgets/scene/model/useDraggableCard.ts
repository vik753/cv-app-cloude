import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from "react";

/* How far one arrow press moves the card, and how far it moves with Shift held.
   The keyboard is the gesture's equivalent for anyone who cannot drag, so the
   coarse step exists to cross the screen without forty presses. */
const NUDGE_PX = 16;
const NUDGE_COARSE_PX = 64;

/* a little past the edge, so the card is gone rather than half-hanging off it */
const EXIT_CLEARANCE_PX = 24;

export interface CardOffset {
	x: number;
	y: number;
}

/* the card's box as it sits with no drag applied */
export interface CardBox {
	left: number;
	top: number;
	width: number;
	height: number;
}

export interface Viewport {
	width: number;
	height: number;
}

/* YouTube's terms require the player to stay visible, so the card is not allowed off
   screen: every move is clamped, and so is every resize. When the card is larger than
   the viewport the lower bound wins, which keeps the top-left corner — and with it the
   grab handle — reachable instead of stranded past the far edge. */
export function clampOffset(offset: CardOffset, box: CardBox, viewport: Viewport): CardOffset {
	const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));
	return {
		x: clamp(offset.x, -box.left, viewport.width - box.left - box.width),
		y: clamp(offset.y, -box.top, viewport.height - box.top - box.height),
	};
}

/* The drag rides the individual `translate` property rather than `transform`: the
   card's entrance and exit keyframes animate `transform`, and the two properties
   compose instead of overwriting each other, so the slide in and the slide out keep
   working from wherever the card was dropped. */
const applyOffset = (node: HTMLElement, offset: CardOffset) => {
	node.style.translate = `${offset.x}px ${offset.y}px`;
};

/* The box the stylesheet put the card in, which is what the clamp is measured against.
   It comes from the offset properties rather than from a rect on purpose: those are
   layout positions, so neither the drag's own `translate` nor a keyframe mid-flight
   shows up in them. A rect does show both, and reading one while `music-in` is still
   running — a gesture is allowed to start there — measures a base position the card
   does not have, which is how a hard drag used to park it past the edge.

   The card is `position: fixed`, so `offsetParent` is null and these are viewport
   coordinates, unaffected by page scroll. Verified in Chrome rather than assumed. */
const measureBase = (node: HTMLElement): CardBox => ({
	left: node.offsetLeft,
	top: node.offsetTop,
	width: node.offsetWidth,
	height: node.offsetHeight,
});

const readViewport = (): Viewport => ({ width: window.innerWidth, height: window.innerHeight });

/* Pulls a remembered offset back inside the current viewport and writes it out. The
   clamp during a gesture is not enough on its own: the offset outlives the card — it is
   kept so that leaving the scene and coming back does not throw the position away — and
   the viewport can change in the meantime, or while the card is away entirely. An
   offset measured against a window that no longer exists puts the card outside the one
   that does, still playing, which is the very thing YouTube's terms forbid. */
const settle = (node: HTMLElement, offset: CardOffset): CardOffset => {
	const next = clampOffset(offset, measureBase(node), readViewport());
	applyOffset(node, next);
	return next;
};

export interface DragHandleProps {
	onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
	onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
	onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void;
	onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => void;
	onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => void;
}

export interface DraggableCard {
	/* a callback ref, because the card leaves and comes back: the offset outlives the
	   node and has to be written onto whichever node is current */
	cardRef: (node: HTMLDivElement | null) => void;
	/* spread onto the grab handle — never onto the card itself, which holds a
	   cross-origin iframe that takes ownership of any pointer entering it */
	handle: DragHandleProps;
}

/* Moves a fixed-position card around the viewport by its handle. The position is
   deliberately not persisted: it would need a new localStorage key, and those are a
   contract with real users. The card starts where the stylesheet puts it. */
export function useDraggableCard(enabled: boolean): DraggableCard {
	const card = useRef<HTMLElement | null>(null);
	/* the offset lives in a ref and is written straight to the DOM, the way the rest of
	   the scene moves things: re-rendering the card would reload the iframe and restart
	   the music */
	const offset = useRef<CardOffset>({ x: 0, y: 0 });
	/* measured once per gesture — reading the box on every move would force layout */
	const box = useRef<CardBox | null>(null);
	const origin = useRef<CardOffset>({ x: 0, y: 0 });
	const dragging = useRef(false);

	const cardRef = useCallback((node: HTMLDivElement | null) => {
		card.current = node;
		/* a fresh node inherits where the card was left, clamped to the window it is
		   arriving in rather than the one it was dragged in */
		if (node) offset.current = settle(node, offset.current);
	}, []);

	const onPointerDown = useCallback(
		(event: ReactPointerEvent<HTMLElement>) => {
			const node = card.current;
			/* a secondary mouse button opens the context menu; that is not a drag */
			if (!enabled || !node || (event.pointerType === "mouse" && event.button !== 0)) return;
			box.current = measureBase(node);
			origin.current = { x: event.clientX - offset.current.x, y: event.clientY - offset.current.y };
			dragging.current = true;
			/* capture keeps the gesture reporting to the handle even when the cursor runs
			   ahead of the card and crosses the iframe, where the events would otherwise
			   belong to YouTube and the drag would die mid-stroke */
			event.currentTarget.setPointerCapture(event.pointerId);
			/* no text selection while dragging, and focus put on the handle by hand so the
			   arrow keys carry on from where the mouse left off */
			event.preventDefault();
			event.currentTarget.focus();
		},
		[enabled],
	);

	const onPointerMove = useCallback((event: ReactPointerEvent<HTMLElement>) => {
		const node = card.current;
		const measured = box.current;
		if (!dragging.current || !node || !measured) return;
		offset.current = clampOffset(
			{ x: event.clientX - origin.current.x, y: event.clientY - origin.current.y },
			measured,
			readViewport(),
		);
		applyOffset(node, offset.current);
	}, []);

	const onPointerUp = useCallback((event: ReactPointerEvent<HTMLElement>) => {
		if (!dragging.current) return;
		dragging.current = false;
		box.current = null;
		if (event.currentTarget.hasPointerCapture(event.pointerId)) {
			event.currentTarget.releasePointerCapture(event.pointerId);
		}
	}, []);

	const onKeyDown = useCallback(
		(event: ReactKeyboardEvent<HTMLElement>) => {
			const node = card.current;
			if (!enabled || !node) return;
			const step = event.shiftKey ? NUDGE_COARSE_PX : NUDGE_PX;
			let dx = 0;
			let dy = 0;
			switch (event.key) {
				case "ArrowLeft":
					dx = -step;
					break;
				case "ArrowRight":
					dx = step;
					break;
				case "ArrowUp":
					dy = -step;
					break;
				case "ArrowDown":
					dy = step;
					break;
				default:
					return;
			}
			/* otherwise the arrows scroll the page instead of moving the card */
			event.preventDefault();
			offset.current = clampOffset(
				{ x: offset.current.x + dx, y: offset.current.y + dy },
				measureBase(node),
				readViewport(),
			);
			applyOffset(node, offset.current);
		},
		[enabled],
	);

	/* The exit keyframe carries the card off screen, and a dragged card can be anywhere,
	   so how far it has to travel is measured rather than fixed: whichever edge is
	   nearer, plus the card's own width. The stylesheet's fallback is a flat 320px,
	   which was right while the card was pinned to the right corner and leaves a card
	   dropped by the left edge of a wide window stranded in mid-sky. Written before the
	   browser paints, or the first frame of the exit uses the fallback and jumps. */
	const writeExitDistance = useCallback((node: HTMLElement) => {
		const base = measureBase(node);
		const left = base.left + offset.current.x;
		const offLeft = -(left + base.width + EXIT_CLEARANCE_PX);
		const offRight = readViewport().width - left + EXIT_CLEARANCE_PX;
		const exit = Math.abs(offLeft) <= offRight ? offLeft : offRight;
		node.style.setProperty("--exit-x", `${Math.round(exit)}px`);
	}, []);

	/* Coming back on stage is the other moment the remembered offset has to be checked:
	   the card is unmounted for the whole time the form is up, so a window resized in
	   between is never seen by the listener below. */
	useLayoutEffect(() => {
		const node = card.current;
		if (!node) return;
		if (enabled) offset.current = settle(node, offset.current);
		else writeExitDistance(node);
	}, [enabled, writeExitDistance]);

	/* A card parked against an edge would end up outside a shrunken window — rotate a
	   phone and it is gone for good — so the offset is pulled back in on every resize.
	   Ungated: during the exit fade the music is still playing and the card still has to
	   be on screen, and its remaining travel is re-measured from where the clamp left it. */
	useEffect(() => {
		const onResize = () => {
			const node = card.current;
			if (!node) return;
			offset.current = settle(node, offset.current);
			if (!enabled) writeExitDistance(node);
		};
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, [enabled, writeExitDistance]);

	return { cardRef, handle: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp, onKeyDown } };
}
