import { AppProviders } from "@/app/providers/AppProviders";
import { useResumeStore } from "@/entities/resume";
import { BuilderPage } from "@/pages/builder";
import { useDayNightCycle } from "@/widgets/scene";
import { useEffect, useState } from "react";

const readSceneEnabled = (): boolean => {
	const saved = localStorage.getItem("resume-canvas-scene");
	return saved === null ? true : saved === "on";
};

/* The composition root: the providers the whole tree sits in, and the three preferences
   that outlive a page — palette, mode and the scene switch. The page below renders them
   but does not own them; keeping the writes here also keeps them running after the
   page's own effects, which is where they have always run. */
export function App() {
	const palette = useResumeStore((state) => state.palette);
	const mode = useResumeStore((state) => state.mode);
	const setMode = useResumeStore((state) => state.setMode);
	const [sceneEnabled, setSceneEnabled] = useState(readSceneEnabled);
	const dayNightPhase = useDayNightCycle(sceneEnabled);
	useEffect(() => {
		localStorage.setItem("resume-canvas-palette", palette);
		localStorage.setItem("resume-canvas-mode", mode);
	}, [mode, palette]);
	useEffect(() => {
		localStorage.setItem("resume-canvas-scene", sceneEnabled ? "on" : "off");
	}, [sceneEnabled]);
	useEffect(() => {
		if (!sceneEnabled) return;
		setMode(dayNightPhase === "day" ? "light" : "dark");
	}, [sceneEnabled, dayNightPhase, setMode]);

	return (
		<AppProviders>
			<BuilderPage sceneEnabled={sceneEnabled} onToggleScene={() => setSceneEnabled((current) => !current)} />
		</AppProviders>
	);
}
