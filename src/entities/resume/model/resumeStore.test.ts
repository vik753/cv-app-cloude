import { initialResume } from "@/entities/resume/model/initialResume";
import type { Resume } from "@/entities/resume/model/resumeSchema";
import { beforeEach, describe, expect, it, vi } from "vitest";

/* The store is a module-level singleton created once at import time (it reads
   localStorage synchronously and hydrates zustand's `persist` on module init).
   Most tests reuse the same imported instance and just reset its state; the tests
   that care about *initialisation* (migration, defaults) reset the module registry
   and re-import so the module-level read-from-localStorage code runs again. */

const freshResume = (overrides: Partial<Resume> = {}): Resume => ({ ...initialResume, ...overrides });

/* the shape zustand's `persist` middleware wraps the store's state in on disk */
interface PersistedEnvelope {
	state: { resume: Resume };
}

const readPersistedEnvelope = (raw: string): PersistedEnvelope => JSON.parse(raw) as PersistedEnvelope;

describe("resumeStore actions", () => {
	beforeEach(() => {
		localStorage.clear();
		vi.resetModules();
	});

	it("updateField updates a single top-level field and leaves the rest untouched", async () => {
		const { useResumeStore } = await import("@/entities/resume/model/resumeStore");
		useResumeStore.getState().updateField("name", "Alex Smith");
		useResumeStore.getState().updateField("role", "Frontend Developer");
		expect(useResumeStore.getState().resume.name).toBe("Alex Smith");
		expect(useResumeStore.getState().resume.role).toBe("Frontend Developer");
	});

	it("updateExperience updates only the matching entry by id", async () => {
		const { useResumeStore } = await import("@/entities/resume/model/resumeStore");
		useResumeStore.setState({
			resume: freshResume({
				experience: [
					{ id: 1, company: "A", role: "Dev", period: "2020", description: "" },
					{ id: 2, company: "B", role: "Lead", period: "2022", description: "" },
				],
			}),
		});
		useResumeStore.getState().updateExperience(2, "company", "Renamed Co");
		const { experience } = useResumeStore.getState().resume;
		expect(experience.find((item) => item.id === 2)?.company).toBe("Renamed Co");
		expect(experience.find((item) => item.id === 1)?.company).toBe("A");
	});

	it("updateResume applies an arbitrary functional update to the whole resume", async () => {
		const { useResumeStore } = await import("@/entities/resume/model/resumeStore");
		useResumeStore.getState().updateResume((current) => ({ ...current, skills: [...current.skills, "React"] }));
		useResumeStore.getState().updateResume((current) => ({ ...current, skills: [...current.skills, "TypeScript"] }));
		expect(useResumeStore.getState().resume.skills).toEqual(["React", "TypeScript"]);
	});

	it("reset restores the resume to the initial, empty draft", async () => {
		const { useResumeStore } = await import("@/entities/resume/model/resumeStore");
		useResumeStore.getState().updateField("name", "Someone");
		useResumeStore.getState().reset();
		expect(useResumeStore.getState().resume).toEqual(initialResume);
	});

	it("reset does not touch palette or mode, only the draft", async () => {
		const { useResumeStore } = await import("@/entities/resume/model/resumeStore");
		useResumeStore.getState().setPalette("slate");
		useResumeStore.getState().setMode("dark");
		useResumeStore.getState().reset();
		expect(useResumeStore.getState().palette).toBe("slate");
		expect(useResumeStore.getState().mode).toBe("dark");
	});

	it("setPalette and setMode update their own piece of state independently", async () => {
		const { useResumeStore } = await import("@/entities/resume/model/resumeStore");
		useResumeStore.getState().setPalette("blurple");
		expect(useResumeStore.getState().palette).toBe("blurple");
		useResumeStore.getState().setMode("dark");
		expect(useResumeStore.getState().mode).toBe("dark");
		expect(useResumeStore.getState().palette).toBe("blurple");
	});
});

describe("resumeStore persistence contract", () => {
	beforeEach(() => {
		localStorage.clear();
		vi.resetModules();
	});

	it("persists the draft under the resume-canvas-draft-v2 key so real users' saves are not silently dropped", async () => {
		const { useResumeStore } = await import("@/entities/resume/model/resumeStore");
		useResumeStore.getState().updateField("name", "Persisted Name");
		const raw = localStorage.getItem("resume-canvas-draft-v2");
		expect(raw).not.toBeNull();
		expect(readPersistedEnvelope(raw!).state.resume.name).toBe("Persisted Name");
	});

	it("restores a previously persisted draft on a fresh module load", async () => {
		localStorage.setItem(
			"resume-canvas-draft-v2",
			JSON.stringify({ state: { resume: { ...initialResume, name: "Reloaded" }, palette: "cream", mode: "light" } }),
		);
		const { useResumeStore } = await import("@/entities/resume/model/resumeStore");
		expect(useResumeStore.getState().resume.name).toBe("Reloaded");
	});

	it("migrates a legacy resume-canvas-draft-v1 draft when there is no v2 draft yet", async () => {
		localStorage.setItem(
			"resume-canvas-draft-v1",
			JSON.stringify({ name: "Legacy User", email: "legacy@example.com", role: "Old Role" }),
		);
		const { useResumeStore } = await import("@/entities/resume/model/resumeStore");
		expect(useResumeStore.getState().resume.name).toBe("Legacy User");
		expect(useResumeStore.getState().resume.role).toBe("Old Role");
	});

	it("migrates a legacy draft that has no email yet, since an incomplete draft is the normal case", async () => {
		localStorage.setItem(
			"resume-canvas-draft-v1",
			JSON.stringify({ name: "Legacy User", skills: ["React", "TypeScript"] }),
		);
		const { useResumeStore } = await import("@/entities/resume/model/resumeStore");
		expect(useResumeStore.getState().resume.name).toBe("Legacy User");
		expect(useResumeStore.getState().resume.skills).toEqual(["React", "TypeScript"]);
	});

	it("reads the palette from its own legacy key when no draft has been persisted yet", async () => {
		localStorage.setItem("resume-canvas-palette", "slate");
		const { useResumeStore } = await import("@/entities/resume/model/resumeStore");
		expect(useResumeStore.getState().palette).toBe("slate");
	});

	it("falls back to the cream palette for an unrecognised or missing saved value", async () => {
		localStorage.setItem("resume-canvas-palette", "not-a-real-palette");
		const { useResumeStore } = await import("@/entities/resume/model/resumeStore");
		expect(useResumeStore.getState().palette).toBe("cream");
	});

	it("restores a mode chosen with the switch from resume-canvas-mode-v2", async () => {
		localStorage.setItem("resume-canvas-mode-v2", "dark");
		const { useResumeStore } = await import("@/entities/resume/model/resumeStore");
		expect(useResumeStore.getState().mode).toBe("dark");
		expect(useResumeStore.getState().modeChosen).toBe(true);
	});

	/* the unversioned key was written on every load, so it records the first visit, not a
	   choice — honouring it is what pinned everyone to the system's scheme of that day */
	it("ignores the unversioned mode key and removes it", async () => {
		localStorage.setItem("resume-canvas-mode", "dark");
		const { useResumeStore } = await import("@/entities/resume/model/resumeStore");
		expect(useResumeStore.getState().mode).toBe("light");
		expect(useResumeStore.getState().modeChosen).toBe(false);
		expect(localStorage.getItem("resume-canvas-mode")).toBeNull();
	});

	it("writes the palette and the chosen mode to their own keys", async () => {
		const { useResumeStore } = await import("@/entities/resume/model/resumeStore");
		useResumeStore.getState().setPalette("slate");
		useResumeStore.getState().setMode("dark");
		expect(localStorage.getItem("resume-canvas-palette")).toBe("slate");
		expect(localStorage.getItem("resume-canvas-mode-v2")).toBe("dark");
	});

	it("keeps the palette and the mode out of the draft's blob", async () => {
		const { useResumeStore } = await import("@/entities/resume/model/resumeStore");
		useResumeStore.getState().setPalette("slate");
		useResumeStore.getState().setMode("dark");
		useResumeStore.getState().updateField("name", "Someone");
		expect(Object.keys(readPersistedEnvelope(localStorage.getItem("resume-canvas-draft-v2")!).state)).toEqual([
			"resume",
		]);
	});

	/* drafts saved before the blob was narrowed still carry both, and must not win */
	it("lets the palette's own key win over a stale copy in an old draft blob", async () => {
		localStorage.setItem("resume-canvas-palette", "slate");
		localStorage.setItem(
			"resume-canvas-draft-v2",
			JSON.stringify({ state: { resume: { ...initialResume, name: "Kept" }, palette: "blurple", mode: "dark" } }),
		);
		const { useResumeStore } = await import("@/entities/resume/model/resumeStore");
		expect(useResumeStore.getState().palette).toBe("slate");
		expect(useResumeStore.getState().mode).toBe("light");
		expect(useResumeStore.getState().resume.name).toBe("Kept");
	});

	it("follows the system until the switch is used, and ignores it after", async () => {
		const { useResumeStore } = await import("@/entities/resume/model/resumeStore");
		useResumeStore.getState().followSystemMode("dark");
		expect(useResumeStore.getState().mode).toBe("dark");
		expect(localStorage.getItem("resume-canvas-mode-v2")).toBeNull();
		useResumeStore.getState().setMode("light");
		useResumeStore.getState().followSystemMode("dark");
		expect(useResumeStore.getState().mode).toBe("light");
	});

	it("falls back to the system color scheme when no mode is saved anywhere", async () => {
		const matchMediaSpy = vi.spyOn(window, "matchMedia").mockReturnValue({
			matches: true,
			media: "(prefers-color-scheme: dark)",
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false,
		});
		const { useResumeStore } = await import("@/entities/resume/model/resumeStore");
		expect(useResumeStore.getState().mode).toBe("dark");
		matchMediaSpy.mockRestore();
	});
});
