import { initialResume } from "@/entities/resume/model/initialResume";
import {
	resumeSchema,
	type ExperienceField,
	type Resume,
	type ResumeField,
} from "@/entities/resume/model/resumeSchema";
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

export type Palette = "blurple" | "cream" | "slate";
export type Mode = "light" | "dark";

/* What a menu or a stored string hands back is a plain string; these are how it
   becomes a Palette or a Mode without a cast vouching for it. */
export const isPalette = (value: string | null): value is Palette =>
	value === "blurple" || value === "cream" || value === "slate";
export const isMode = (value: string | null): value is Mode => value === "light" || value === "dark";

/* The palette and the colour mode live in keys of their own and only there: the draft's
   blob below is narrowed to the draft, so these readers are the one source of truth, and
   the two setters are the only writers. */
const PALETTE_KEY = "resume-canvas-palette";
const readPalette = (): Palette => {
	const saved = localStorage.getItem(PALETTE_KEY);
	return isPalette(saved) ? saved : "cream";
};

/* A stored mode means someone chose it with the switch. Without one the app follows the
   operating system, and keeps following it. The key carries a version because the
   unversioned one it replaces was written on every load — first from the sky, then from
   the system — so what it holds records whatever was true on the first visit, not a
   choice anyone made. It is read by nothing and removed, rather than migrated. */
const MODE_KEY = "resume-canvas-mode-v2";
const readSystemMode = (): Mode => (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
const readChosenMode = (): Mode | null => {
	localStorage.removeItem("resume-canvas-mode");
	const saved = localStorage.getItem(MODE_KEY);
	return isMode(saved) ? saved : null;
};

interface ResumeStore {
	resume: Resume;
	palette: Palette;
	mode: Mode;
	/* whether the mode came from the switch; until it has, the system decides */
	modeChosen: boolean;
	updateResume: (updater: (current: Resume) => Resume) => void;
	updateField: (field: ResumeField, value: string) => void;
	updateExperience: (id: number, field: ExperienceField, value: string) => void;
	reset: () => void;
	setPalette: (palette: Palette) => void;
	/* the switch: a choice that outlives the session */
	setMode: (mode: Mode) => void;
	/* the operating system changing its mind, which counts only until someone chooses */
	followSystemMode: (mode: Mode) => void;
}

const chosenMode = readChosenMode();

export const useResumeStore = create<ResumeStore>()(
	persist(
		(set) => ({
			resume: readLegacyDraft(),
			palette: readPalette(),
			mode: chosenMode ?? readSystemMode(),
			modeChosen: chosenMode !== null,
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
			setPalette: (palette) => {
				localStorage.setItem(PALETTE_KEY, palette);
				set({ palette });
			},
			setMode: (mode) => {
				localStorage.setItem(MODE_KEY, mode);
				set({ mode, modeChosen: true });
			},
			followSystemMode: (mode) => set((state) => (state.modeChosen ? state : { mode })),
		}),
		{
			name: "resume-canvas-draft-v2",
			/* The blob is the draft and nothing else. Drafts saved before this also carry a
			   palette and a mode, so merge takes the draft out of them by name rather than
			   spreading the whole blob over the state — a stale copy must not win over the
			   keys that are now the only ones written. */
			partialize: (state) => ({ resume: state.resume }),
			merge: (persistedState, currentState) => {
				const persisted = persistedState as Partial<Pick<ResumeStore, "resume">> | undefined;
				return { ...currentState, resume: { ...currentState.resume, ...persisted?.resume } };
			},
		},
	),
);
