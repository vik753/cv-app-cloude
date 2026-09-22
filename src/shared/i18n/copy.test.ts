import { translations, type Translation } from "@/shared/i18n";
import { describe, expect, it } from "vitest";

describe("i18n dictionaries", () => {
	it("gives English and Ukrainian the exact same set of keys", () => {
		const enKeys = Object.keys(translations.en).sort();
		const ukKeys = Object.keys(translations.uk).sort();
		expect(ukKeys).toEqual(enKeys);
	});

	it("leaves no translation value blank in either language", () => {
		/* a few entries are a sentence in pieces rather than one string, because the
		   button they belong to picks part of it out in colour — the guarantee is the
		   same for every piece, so the check walks into them */
		const expectFilled = (label: string, value: string | Record<string, string>) => {
			if (typeof value === "string") {
				expect(value.trim(), `${label} is empty`).not.toBe("");
				return;
			}
			for (const [part, piece] of Object.entries(value)) expectFilled(`${label}.${part}`, piece);
		};
		for (const [language, dictionary] of Object.entries(translations)) {
			const entries = Object.entries(dictionary) as [keyof Translation, string | Record<string, string>][];
			for (const [key, value] of entries) {
				expectFilled(`${language}.${key}`, value);
			}
		}
	});

	it("keeps the {page}/{pages} placeholders in pageOf for both languages", () => {
		expect(translations.en.pageOf).toContain("{page}");
		expect(translations.en.pageOf).toContain("{pages}");
		expect(translations.uk.pageOf).toContain("{page}");
		expect(translations.uk.pageOf).toContain("{pages}");
	});
});
