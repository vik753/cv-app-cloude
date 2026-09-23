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

/* Subtracting the drag gives the box the stylesheet put the card in, which is what the
   clamp is measured against. The reading is only true while no keyframe is mid-flight —
   `music-in` moves the card for its first 400ms — so it is taken at the start of a
   gesture, never during one. */
const measureBox = (node: HTMLElement, offset: CardOffset): CardBox => {
	const rect = node.getBoundingClientRect();
	return { left: rect.left - offset.x, top: rect.top - offset.y, width: rect.width, height: rect.height };
};

const readViewport = (): Viewport => ({ width: window.innerWidth, height: window.innerHeight });

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
		if (node) applyOffset(node, offset.current);
	}, []);

	const onPointerDown = useCallback(
		(event: ReactPointerEvent<HTMLElement>) => {
			const node = card.current;
			/* a secondary mouse button opens the context menu; that is not a drag */
			if (!enabled || !node || (event.pointerType === "mouse" && event.button !== 0)) return;
			box.current = measureBox(node, offset.current);
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
				measureBox(node, offset.current),
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
	useLayoutEffect(() => {
		const node = card.current;
		if (enabled || !node) return;
		const rect = node.getBoundingClientRect();
		const offLeft = -(rect.right + EXIT_CLEARANCE_PX);
		const offRight = window.innerWidth - rect.left + EXIT_CLEARANCE_PX;
		const exit = Math.abs(offLeft) <= offRight ? offLeft : offRight;
		node.style.setProperty("--exit-x", `${Math.round(exit)}px`);
	}, [enabled]);

	/* A card parked against an edge would end up outside a shrunken window — rotate a
	   phone and it is gone for good — so the offset is pulled back in on every resize. */
	useEffect(() => {
		if (!enabled) return;
		const onResize = () => {
			const node = card.current;
			if (!node) return;
			offset.current = clampOffset(offset.current, measureBox(node, offset.current), readViewport());
			applyOffset(node, offset.current);
		};
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, [enabled]);

	return { cardRef, handle: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp, onKeyDown } };
}
