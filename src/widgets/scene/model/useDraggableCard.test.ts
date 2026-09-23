import { clampOffset } from "@/widgets/scene/model/useDraggableCard";
import { describe, expect, it } from "vitest";

describe("clampOffset", () => {
	const viewport = { width: 1024, height: 768 };
	const box = { left: 100, top: 100, width: 200, height: 150 };

	it("leaves the offset untouched when the card stays inside the viewport", () => {
		expect(clampOffset({ x: 50, y: 30 }, box, viewport)).toEqual({ x: 50, y: 30 });
	});

	it("stops the card at the viewport's left edge", () => {
		expect(clampOffset({ x: -500, y: 0 }, box, viewport)).toEqual({ x: -box.left, y: 0 });
	});

	it("stops the card at the viewport's right edge", () => {
		const expectedX = viewport.width - box.left - box.width;
		expect(clampOffset({ x: 1000, y: 0 }, box, viewport)).toEqual({ x: expectedX, y: 0 });
	});

	it("stops the card at the viewport's top edge", () => {
		expect(clampOffset({ x: 0, y: -500 }, box, viewport)).toEqual({ x: 0, y: -box.top });
	});

	it("stops the card at the viewport's bottom edge", () => {
		const expectedY = viewport.height - box.top - box.height;
		expect(clampOffset({ x: 0, y: 1000 }, box, viewport)).toEqual({ x: 0, y: expectedY });
	});

	it("keeps the grab handle reachable by favouring the lower bound when the card is larger than the viewport", () => {
		/* the card is bigger than the viewport in both dimensions, so its lower and upper
		   bounds are inverted (min > max); the clamp is written so the lower bound wins,
		   pinning the top-left corner - and the grab handle with it - inside the window
		   rather than stranding it past the far edge */
		const oversizedBox = { left: 50, top: 50, width: 1200, height: 900 };
		expect(clampOffset({ x: 5000, y: 5000 }, oversizedBox, viewport)).toEqual({
			x: -oversizedBox.left,
			y: -oversizedBox.top,
		});
		/* true regardless of which direction the drag pushed - the lower bound wins even
		   when the offset was dragged the opposite way */
		expect(clampOffset({ x: -5000, y: -5000 }, oversizedBox, viewport)).toEqual({
			x: -oversizedBox.left,
			y: -oversizedBox.top,
		});
	});
});
