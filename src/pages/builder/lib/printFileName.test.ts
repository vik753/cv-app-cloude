import { printFileName } from "@/pages/builder/lib/printFileName";
import { describe, expect, it } from "vitest";

describe("printFileName", () => {
	it("joins the name's words with underscores and ends in CV", () => {
		expect(printFileName("Ihor Korenets")).toBe("Ihor_Korenets_CV");
	});

	it("keeps Cyrillic letters as they are", () => {
		expect(printFileName("Ігор Коренець")).toBe("Ігор_Коренець_CV");
	});

	it("collapses runs of whitespace and trims the ends", () => {
		expect(printFileName("  Ada \t  Lovelace \n")).toBe("Ada_Lovelace_CV");
	});

	it("drops characters a file system refuses", () => {
		expect(printFileName('A/B: "C"?')).toBe("A_B_C_CV");
	});

	it("falls back to CV alone when there is no name yet", () => {
		expect(printFileName("")).toBe("CV");
		expect(printFileName(" / ")).toBe("CV");
	});
});
