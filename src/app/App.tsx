import { AppProviders } from "@/app/providers/AppProviders";
import { initialResume, useResumeStore } from "@/entities/resume";
import { BuilderPage, type BuilderView } from "@/pages/builder";
import { useEffect, useRef, useState } from "react";

const readSceneEnabled = (): boolean => {
	const saved = localStorage.getItem("resume-canvas-scene");
	return saved === null ? true : saved === "on";
};

/* A draft that is no longer the empty one means someone has been here and typed
   something: they are coming back to work rather than arriving. The persist key on its
   own proves nothing — the store writes it during the first render, long before anyone
   has touched a field. */
const hasSavedDraft = (): boolean => JSON.stringify(useResumeStore.getState().resume) !== JSON.stringify(initialResume);

/* The welcome screen belongs to a first visit only. Two kinds of visitor skip it: the
   one whose work is already saved, and the one who switched the animated background
   off — dropping that one onto a scene is the opposite of honouring the switch. */
const readInitialView = (): BuilderView => (readSceneEnabled() && !hasSavedDraft() ? "welcome" : "form");

/* The composition root: the providers the whole tree sits in, the preferences that
   outlive a page — palette, mode and the scene switch — and which of the three entry
   states is on screen. The page below renders them but does not own them; keeping the
   writes here also keeps them running after the page's own effects, which is where they
   have always run. */
export function App() {
	const palette = useResumeStore((state) => state.palette);
	const mode = useResumeStore((state) => state.mode);
	const setMode = useResumeStore((state) => state.setMode);
	const [view, setView] = useState<BuilderView>(readInitialView);
	/* the button over the scene reads "Continue" to anyone who has seen the form already */
	const [visitedForm, setVisitedForm] = useState(() => view === "form");
	useEffect(() => {
		localStorage.setItem("resume-canvas-palette", palette);
		localStorage.setItem("resume-canvas-mode", mode);
	}, [mode, palette]);
	/* the stored preference keeps precisely its old meaning: the form is the one state
	   with no animated background behind it */
	useEffect(() => {
		localStorage.setItem("resume-canvas-scene", view === "form" ? "off" : "on");
	}, [view]);
	/* The form used to take its colour mode from the sky; with the scene switched off
	   behind it that source is gone, so it follows the operating system instead. The
	   switch in the header still wins: once it has been used, the system is not
	   consulted again. The store's own reader supplies the mode this session opens on. */
	const chosenByHand = useRef(false);
	useEffect(() => {
		const query = window.matchMedia("(prefers-color-scheme: dark)");
		const follow = (event: MediaQueryListEvent) => {
			if (chosenByHand.current) return;
			setMode(event.matches ? "dark" : "light");
		};
		query.addEventListener("change", follow);
		return () => query.removeEventListener("change", follow);
	}, [setMode]);

	return (
		<AppProviders>
			<BuilderPage
				view={view}
				visitedForm={visitedForm}
				onEnterScene={() => setView("scene")}
				onEnterForm={() => {
					setView("form");
					setVisitedForm(true);
				}}
				onModeChosen={() => {
					chosenByHand.current = true;
				}}
			/>
		</AppProviders>
	);
}
