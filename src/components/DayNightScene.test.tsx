import { DayNightScene } from "@/components/DayNightScene";
import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/* Contract-level only: the scene is driven by requestAnimationFrame against a live
   CSS animation and by Math.random-seeded comets/stars/quotes. None of that is
   stably assertable here (see useSceneClock.test.ts for the maths itself). What is
   worth locking down is the contract every consumer relies on: it mounts and
   unmounts without throwing, and it actually reacts to its `active` prop. */
describe("DayNightScene", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.runOnlyPendingTimers();
		vi.useRealTimers();
	});

	it("renders nothing when inactive", () => {
		const { container } = render(<DayNightScene active={false} language='en' />);
		expect(container).toBeEmptyDOMElement();
	});

	it("renders the scene layers when active", () => {
		const { container } = render(<DayNightScene active={true} language='en' />);
		expect(container.querySelector(".scene")).toBeInTheDocument();
		expect(container.querySelector(".sky-day")).toBeInTheDocument();
	});

	it("does not throw when toggling from active to inactive", () => {
		const { rerender } = render(<DayNightScene active={true} language='en' />);
		expect(() => rerender(<DayNightScene active={false} language='en' />)).not.toThrow();
	});

	it("does not throw when toggling from inactive to active", () => {
		const { rerender } = render(<DayNightScene active={false} language='en' />);
		expect(() => rerender(<DayNightScene active={true} language='en' />)).not.toThrow();
	});

	it("does not throw on unmount while active (timers and listeners tear down cleanly)", () => {
		const { unmount } = render(<DayNightScene active={true} language='en' />);
		expect(() => unmount()).not.toThrow();
	});

	it("renders the same landscape contract regardless of the selected language", () => {
		const en = render(<DayNightScene active={true} language='en' />);
		const uk = render(<DayNightScene active={true} language='uk' />);
		expect(en.container.querySelector(".scene")).toBeInTheDocument();
		expect(uk.container.querySelector(".scene")).toBeInTheDocument();
	});
});
