import { ScenePausedContext } from "@/widgets/scene/model/sceneMotion";
import { useCycleFrame } from "@/widgets/scene/model/useSceneClock";
import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/* The clock is read off `.sky-day`'s first animation. jsdom runs no CSS animations, so
   the sky here is an element whose getAnimations reports one, frozen at a known time. */
const SKY_TIME_MS = 11_500; // a quarter of the 46s cycle

interface FigureProps {
	draw: (f: number, seconds: number) => void;
}

function Figure({ draw }: FigureProps) {
	useCycleFrame(draw);
	return null;
}

const renderFigure = (draw: (f: number, seconds: number) => void, paused: boolean) =>
	render(
		<ScenePausedContext value={paused}>
			<div className='sky-day' />
			<Figure draw={draw} />
		</ScenePausedContext>,
	);

describe("useCycleFrame", () => {
	let frames: FrameRequestCallback[];

	beforeEach(() => {
		frames = [];
		vi.spyOn(Element.prototype, "getAnimations").mockImplementation(function (this: Element) {
			return this.classList.contains("sky-day") ? [{ currentTime: SKY_TIME_MS } as unknown as Animation] : [];
		});
		vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => frames.push(callback));
		vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	/* run whatever frames are queued right now, as the browser would on its next paint */
	const flushFrame = () => frames.splice(0).forEach((callback) => callback(0));

	it("poses a paused figure exactly once, then schedules nothing", () => {
		const draw = vi.fn();
		renderFigure(draw, true);
		flushFrame();
		flushFrame();
		expect(draw).toHaveBeenCalledTimes(1);
		expect(draw).toHaveBeenCalledWith(0.25, 11.5);
		expect(frames).toHaveLength(0);
	});

	it("keeps drawing every frame while the scene runs", () => {
		const draw = vi.fn();
		renderFigure(draw, false);
		flushFrame();
		flushFrame();
		flushFrame();
		expect(draw).toHaveBeenCalledTimes(3);
		expect(frames).toHaveLength(1);
	});

	it("starts the loop again when the pause is lifted", () => {
		const draw = vi.fn();
		const { rerender } = renderFigure(draw, true);
		flushFrame();
		rerender(
			<ScenePausedContext value={false}>
				<div className='sky-day' />
				<Figure draw={draw} />
			</ScenePausedContext>,
		);
		flushFrame();
		flushFrame();
		expect(draw).toHaveBeenCalledTimes(3);
		expect(frames).toHaveLength(1);
	});
});
