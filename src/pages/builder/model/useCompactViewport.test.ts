import { COMPACT_QUERY } from "@/pages/builder/model/useCompactViewport";
import { describe, expect, it } from "vitest";

/* The header's arrangement is decided in two places: this query picks which controls
   render, panels.css lays them out. Read as text, because jsdom computes no media
   queries — and through a glob, because the stylesheet sits in a layer above this one. */
const stylesheets = import.meta.glob<string>("/src/app/styles/panels.css", {
	query: "?raw",
	import: "default",
	eager: true,
});

const widthOf = (query: string) => Number(query.match(/max-width:\s*(\d+)px/)?.[1]);

describe("COMPACT_QUERY", () => {
	/* the header changes at 900px too, where the columns stack; the phone arrangement
	   is the narrowest step, and that is the one this query has to name */
	it("is the narrowest breakpoint panels.css lays the header out at", () => {
		const css = stylesheets["/src/app/styles/panels.css"];
		/* each @media block with the rules nested one level inside it, so a plain rule
		   after a block is never mistaken for part of it */
		const headerWidths = [...css.matchAll(/@media([^{]*)\{((?:[^{}]*\{[^{}]*\})*)[^{}]*\}/g)]
			.filter(([, , body]) => body.includes(".app-header"))
			.map(([, query]) => widthOf(query))
			.filter((width) => !Number.isNaN(width));
		expect(headerWidths.length).toBeGreaterThan(0);
		expect(Math.min(...headerWidths)).toBe(widthOf(COMPACT_QUERY));
	});
});
