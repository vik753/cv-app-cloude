import { translations, type Translation } from "@/services/copy";
import { describe, expect, it } from "vitest";

describe("i18n dictionaries", () => {
	it("gives English and Ukrainian the exact same set of keys", () => {
		const enKeys = Object.keys(translations.en).sort();
		const ukKeys = Object.keys(translations.uk).sort();
		expect(ukKeys).toEqual(enKeys);
	});

	it("leaves no translation value blank in either language", () => {
		for (const [language, dictionary] of Object.entries(translations)) {
			const entries = Object.entries(dictionary) as [keyof Translation, string][];
			for (const [key, value] of entries) {
				expect(value.trim(), `${language}.${key} is empty`).not.toBe("");
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
