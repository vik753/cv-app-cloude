import { LOWER_COVER } from "@/widgets/scene/lib/landscape";
import { TAU } from "@/widgets/scene/lib/choreography";
import type { Ref } from "react";

/* The critters are choreographed against the day: 0 is dawn, 0.1–0.4 full day,
   0.5 dusk, 0.6–0.9 night, then dawn again. The clock is read straight off the
   sky's own CSS animation, so they can never drift out of step with it. Poses are
   written to the DOM every frame; React only renders the drawings once. */
export type Mode =
	| "hidden"
	| "walk"
	| "run"
	| "trot"
	| "stand"
	| "look"
	| "sit"
	| "hop"
	| "gnaw"
	| "listen"
	| "crouch"
	| "pounce"
	| "dive"
	| "shake"
	| "forage"
	| "sniff"
	| "rest"
	| "sleep"
	| "mark"
	| "smoke"
	| "laugh";

export interface Segment {
	until: number;
	mode: Mode;
	x: [number, number];
	/* depth below the ridge (lower meadow) or in front of the tree line (upper) */
	d?: [number, number];
	facing: 1 | -1;
	hops?: number;
}

export const locate = (segments: Segment[], f: number) => {
	let start = 0;
	for (const segment of segments) {
		if (f < segment.until) return { segment, p: (f - start) / (segment.until - start) };
		start = segment.until;
	}
	return null;
};

/* Each lower critter is drawn twice, once behind the lower trees and once in front
   of them, and only one copy shows: the one behind whenever its paws stand further
   up the hill than the base of a tree it overlaps. That is what lets it slip behind
   a pine and come out on the other side. */
export type Layer = "back" | "front";
export const layerAt = (x: number, y: number, halfWidth: number): Layer =>
	LOWER_COVER.some((cover) => Math.abs(x - cover.x) < cover.reach + halfWidth && y < cover.base) ? "back" : "front";

/* four legs: near hind, far hind, near front, far front */
export function legSwing(mode: Mode, seconds: number): [number, number, number, number] {
	const rate = mode === "run" ? 3.6 : mode === "trot" ? 2.8 : mode === "walk" ? 1.8 : 0;
	if (!rate) return [0, 0, 0, 0];
	const amp = mode === "run" ? 38 : mode === "trot" ? 28 : 22;
	const s = Math.sin(seconds * rate * TAU) * amp;
	return [s, -s, -s, s];
}

export interface LimbProps {
	ref: Ref<SVGGElement>;
	x: number;
}
