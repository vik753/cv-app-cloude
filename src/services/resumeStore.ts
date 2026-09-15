import { initialResume } from "@/services/initialResume";
import { resumeSchema, type ExperienceField, type Resume, type ResumeField } from "@/services/resumeSchema";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const readLegacyDraft = (): Resume => {
	try {
		const saved = localStorage.getItem("resume-canvas-draft-v1");
		if (!saved) return initialResume;
		const parsed: unknown = JSON.parse(saved);
		const result = resumeSchema.safeParse(parsed);
		return result.success ? result.data : initialResume;
	} catch {
		return initialResume;
	}
};

interface ResumeStore {
	resume: Resume;
	updateResume: (updater: (current: Resume) => Resume) => void;
	updateField: (field: ResumeField, value: string) => void;
	updateExperience: (id: number, field: ExperienceField, value: string) => void;
	reset: () => void;
}

export const useResumeStore = create<ResumeStore>()(
	persist(
		(set) => ({
			resume: readLegacyDraft(),
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
		}),
		{ name: "resume-canvas-draft-v2" },
	),
);
