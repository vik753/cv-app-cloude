import { useScenePaused } from "@/widgets/scene/model/sceneMotion";
import { useEffect, useRef, type RefObject } from "react";

/* The clock everything in the scene is choreographed against: 0 is dawn, 0.1–0.4
   full day, 0.5 dusk, 0.6–0.9 night, then dawn again. It is read straight off the
   sky's own CSS animation, so nothing can drift out of step with it. Poses are
   written to the DOM every frame; React only renders the drawings once. */
const CYCLE_MS = 46_000;

export function useCycleFrame(draw: (f: number, seconds: number) => void) {
	const drawRef = useRef(draw);
	const paused = useScenePaused();
	useEffect(() => {
		drawRef.current = draw;
	});
	useEffect(() => {
		const clock = document.querySelector(".sky-day")?.getAnimations()[0];
		/* reduced motion: the sky is frozen at noon and nobody comes out */
		if (!clock) return;
		let frame = 0;
		/* A still scene is still posed. React draws every figure in a neutral
		   position and the pose arrives from here, so a loop that never ran would
		   leave a jumble on the welcome screen rather than a dawn. Paused, the tick
		   runs once and is not scheduled again: one frame of work, the right
		   picture, and then nothing — sixteen idle loops redrawing an unchanging
		   scene is exactly the cost the pause exists to avoid. */
		const tick = () => {
			const t = Number(clock.currentTime ?? 0);
			drawRef.current((t % CYCLE_MS) / CYCLE_MS, t / 1000);
			if (!paused) frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [paused]);
}

export const set = (ref: RefObject<SVGElement | null>, transform: string) =>
	ref.current?.setAttribute("transform", transform);
export const show = (ref: RefObject<SVGElement | null>, opacity: number) =>
	ref.current?.setAttribute("opacity", opacity.toFixed(3));
