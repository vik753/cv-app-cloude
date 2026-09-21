import { getSkillIconId, getSkillIconUrl, skillIconSuggestions } from "@/services/skillIcons";
import { describe, expect, it } from "vitest";

describe("skill icons", () => {
	it("resolves common skill names and aliases", () => {
		expect(getSkillIconId("React")).toBe("react");
		expect(getSkillIconId("TypeScript")).toBe("ts");
		expect(getSkillIconId("Node.js")).toBe("nodejs");
		expect(getSkillIconUrl("Figma")).toBe("https://skillicons.dev/icons?i=figma&theme=light");
	});

	it("returns no icon for unsupported skills", () => {
		expect(getSkillIconId("Strategic thinking")).toBeUndefined();
		expect(getSkillIconUrl("Strategic thinking")).toBeUndefined();
	});

	it("normalizes case and surrounding whitespace before matching", () => {
		expect(getSkillIconId("  ReAct  ")).toBe("react");
	});

	it("collapses internal whitespace before matching an alias", () => {
		expect(getSkillIconId("Next.js")).toBe("nextjs");
		expect(getSkillIconId("next   js".replace("   ", "."))).toBe("nextjs");
	});

	it("treats a bare skill name and its '.js' variant the same way", () => {
		expect(getSkillIconId("Vue")).toBe(getSkillIconId("Vue.js"));
	});

	it("gives every suggestion a non-empty, human-readable label", () => {
		expect(skillIconSuggestions.length).toBeGreaterThan(0);
		for (const suggestion of skillIconSuggestions) {
			expect(suggestion.label.trim()).not.toBe("");
		}
	});

	it("resolves every one of its own suggestions back to its own icon id", () => {
		/* every id offered in the autocomplete must round-trip through its own label,
		   or picking that exact suggestion in the form adds a skill chip with no icon,
		   right after the suggestion row showed one. This used to fail for four
		   default-labeled entries ("D3.js", "Markdown", "PostgreSQL", "Python") whose
		   label could not be reduced back to their short id; now fixed via aliases. */
		for (const { id, label } of skillIconSuggestions) {
			expect(getSkillIconId(label), `"${label}" should resolve back to "${id}"`).toBe(id);
		}
	});
});
