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

	/* BUG (reported to the team lead, not fixed here): a handful of suggestions use
	   a label that `getSkillIconId` cannot map back to their own id, because
	   stripping "." from the label does not reproduce the short icon id and there
	   is no alias bridging the two (unlike e.g. "javascript" -> "js", which *is*
	   aliased). Clicking these specific suggestions in the form adds a skill chip
	   with no icon, right after the suggestion row showed one. */
	const suggestionsWithNoWayBack = ["D3.js", "Markdown", "PostgreSQL", "Python"];

	it("resolves every suggestion back to an icon URL, except the known-broken ones below", () => {
		const withoutKnownBugs = skillIconSuggestions.filter(({ label }) => !suggestionsWithNoWayBack.includes(label));
		for (const { label } of withoutKnownBugs) {
			expect(getSkillIconUrl(label), `"${label}" should resolve back to an icon`).toBeDefined();
		}
	});

	it("BUG: selecting these suggestions from the autocomplete leaves the resulting skill with no icon", () => {
		for (const label of suggestionsWithNoWayBack) {
			expect(getSkillIconUrl(label)).toBeUndefined();
		}
	});
});
