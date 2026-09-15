import { initialResume } from "@/services/initialResume";
import { resumeSchema, type ExperienceField, type Resume, type ResumeField } from "@/services/resumeSchema";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const readLegacyDraft = (): Resume => {
	try {
		const saved = localStorage.getItem("resume-canvas-draft-v1");
		if (!saved) return initialResume;
		const parsed: unknown = JSON.parse(saved);
		const result = resumeSchema.safeParse({ ...initialResume, ...(parsed as Partial<Resume>) });
		return result.success ? { ...initialResume, ...result.data } : initialResume;
	} catch {
		return initialResume;
	}
};

export type Palette = "blurple" | "cream";
export type Mode = "light" | "dark";

const readPalette = (): Palette => (localStorage.getItem("resume-canvas-palette") === "blurple" ? "blurple" : "cream");
const readMode = (): Mode => {
	const saved = localStorage.getItem("resume-canvas-mode");
	if (saved === "light" || saved === "dark") return saved;
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

interface ResumeStore {
	resume: Resume;
	palette: Palette;
	mode: Mode;
	updateResume: (updater: (current: Resume) => Resume) => void;
	updateField: (field: ResumeField, value: string) => void;
	updateExperience: (id: number, field: ExperienceField, value: string) => void;
	reset: () => void;
	setPalette: (palette: Palette) => void;
	setMode: (mode: Mode) => void;
}

export const useResumeStore = create<ResumeStore>()(
	persist(
		(set) => ({
			resume: readLegacyDraft(),
			palette: readPalette(),
			mode: readMode(),
			updateResume: (updater) => set((state) => ({ resume: updater(state.resume) })),
			updateField: (field, value) => set((state) => ({ resume: { ...state.resume, [field]: value } })),
			updateExperience: (id, field, value) =>
				set((state) => ({
					resume: {
						...state.resume,
						experience: state.resume.experience.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
					},
				})),
			reset: () => set({ resume: initialResume }),
			setPalette: (palette) => set({ palette }),
			setMode: (mode) => set({ mode }),
		}),
		{ name: "resume-canvas-draft-v2" },
	),
);
