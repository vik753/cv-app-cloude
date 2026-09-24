import { initialResume, useResumeStore } from "@/entities/resume";
import { usePrintFileName } from "@/pages/builder/model/usePrintFileName";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

describe("usePrintFileName", () => {
	beforeEach(() => {
		document.title = "not boring CV";
		useResumeStore.setState({ resume: { ...initialResume, name: "Ada Lovelace" } });
	});

	it("titles the document after the résumé for exactly the length of a print", () => {
		renderHook(() => usePrintFileName());
		window.dispatchEvent(new Event("beforeprint"));
		expect(document.title).toBe("Ada_Lovelace_CV");
		window.dispatchEvent(new Event("afterprint"));
		expect(document.title).toBe("not boring CV");
	});

	it("reads the name when printing starts, not when the page mounted", () => {
		renderHook(() => usePrintFileName());
		useResumeStore.setState({ resume: { ...initialResume, name: "Grace Hopper" } });
		window.dispatchEvent(new Event("beforeprint"));
		expect(document.title).toBe("Grace_Hopper_CV");
	});

	it("puts the title back if the page goes away mid-print", () => {
		const { unmount } = renderHook(() => usePrintFileName());
		window.dispatchEvent(new Event("beforeprint"));
		unmount();
		expect(document.title).toBe("not boring CV");
	});
});
