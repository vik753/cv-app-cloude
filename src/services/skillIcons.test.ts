import { getSkillIconId, getSkillIconUrl } from "@/services/skillIcons";
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
});
