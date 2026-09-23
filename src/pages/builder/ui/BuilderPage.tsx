import { computeCompletion } from "@/pages/builder/lib/completion";
import { visibleFraction } from "@/pages/builder/lib/visibility";
import type { BuilderView } from "@/pages/builder/types";
import { BuilderHeader } from "@/pages/builder/ui/BuilderHeader";
import { WelcomeGate } from "@/pages/builder/ui/WelcomeGate";
import { translations, useLanguage } from "@/shared/i18n";
import { useResumeStore } from "@/entities/resume";
import { ResumeForm } from "@/features/resume-form";
import { ResumePreview } from "@/features/resume-preview";
import { DayNightScene, SceneMusic } from "@/widgets/scene";
import { AppFooter } from "@/widgets/app-footer";
import { useMemo, useRef, useState } from "react";

/* The entrance the preview arrives with, and the same number layout.css transitions the
   columns over. Anything that has to happen once it has landed waits this long. */
const PREVIEW_ENTER_MS = 360;

/* How much of the preview has to be on screen already for a scroll to be an
   interruption rather than a help. Half of what the screen could show of it: beside the
   form it is the whole right-hand column and well past this, stacked below the form it
   is nowhere near. */
const PREVIEW_IN_VIEW = 0.5;

interface BuilderPageProps {
	/* which of the three entry states is on screen; App owns it, the page draws it */
	view: BuilderView;
	/* the button over the scene reads "Continue" once the form has been open */
	visitedForm: boolean;
	onEnterScene: () => void;
	onEnterForm: () => void;
	/* the colour mode follows the system until the visitor picks one himself, and App
	   is the one keeping that policy, so the choice is reported back up to it */
	onModeChosen: () => void;
}

export function BuilderPage({ view, visitedForm, onEnterScene, onEnterForm, onModeChosen }: BuilderPageProps) {
	const resume = useResumeStore((state) => state.resume);
	const updateField = useResumeStore((state) => state.updateField);
	const updateExperience = useResumeStore((state) => state.updateExperience);
	const updateResume = useResumeStore((state) => state.updateResume);
	const resetResume = useResumeStore((state) => state.reset);
	const palette = useResumeStore((state) => state.palette);
	const mode = useResumeStore((state) => state.mode);
	const setPalette = useResumeStore((state) => state.setPalette);
	const setMode = useResumeStore((state) => state.setMode);
	const { language, setLanguage, t } = useLanguage();
	const [notice, setNotice] = useState(t.autoSave);
	const [previewVisible, setPreviewVisible] = useState(false);
	const preview = useRef<HTMLElement>(null);

	const completion = useMemo(() => computeCompletion(resume), [resume]);

	const clearDraft = () => {
		if (window.confirm(t.confirmClear)) {
			resetResume();
			setNotice(t.reset);
		}
	};
	const togglePreview = () => {
		if (previewVisible) {
			setPreviewVisible(false);
			return;
		}
		setPreviewVisible(true);
		window.setTimeout(() => {
			/* A tap that changes nothing you can see reads as a broken button, and that is
			   what switching the preview on does wherever it opens stacked below the form
			   instead of beside it. The test is the preview's own place on screen rather
			   than a screen width: being out of sight is what the problem actually is, a
			   width is only one symptom of it, and the widths at which the columns stack
			   live in a stylesheet this file cannot read. Beside the form it is already in
			   view and this does nothing, by construction rather than by memory.

			   It waits for the entrance instead of riding the same tick as the state: the
			   columns are still being transitioned while that runs, and a scroll aimed at
			   a target that has not landed yet arrives somewhere else. On the way on only —
			   a page that scrolls itself in both directions feels possessed. */
			const sheet = preview.current;
			if (!sheet) return;
			if (visibleFraction(sheet.getBoundingClientRect(), window.innerHeight) >= PREVIEW_IN_VIEW) return;
			sheet.scrollIntoView({
				/* a long smooth scroll is the very motion some people cannot take */
				behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
				block: "start",
			});
		}, PREVIEW_ENTER_MS);
	};

	return (
		<>
			{/* the scene is off entirely behind the form, and held on its first frame
			    while the welcome screen waits for the click that starts the music */}
			<DayNightScene active={view !== "form"} paused={view === "welcome"} language={language} />
			{view === "welcome" ? <WelcomeGate label={t.welcomeStart} onStart={onEnterScene} /> : null}
			{view === "scene" ? (
				<button className='scene-to-form' type='button' onClick={onEnterForm}>
					{visitedForm ? t.sceneContinue : t.sceneStart}
				</button>
			) : null}
			{/* the scene gets its tune, from YouTube, while it has the whole screen; the
			    card stays mounted past the switch away so the music can fade out */}
			<SceneMusic playing={view === "scene"} label={t.music} dragLabel={t.musicMove} />
			{view === "form" ? (
				<main data-palette={palette} data-mode={mode} className='app-shell'>
					<div className='app-window'>
						<BuilderHeader
							t={t}
							notice={notice}
							previewVisible={previewVisible}
							onTogglePreview={togglePreview}
							onBackToScene={onEnterScene}
							mode={mode}
							onModeChange={(nextMode) => {
								setMode(nextMode);
								onModeChosen();
							}}
							palette={palette}
							onPaletteChange={setPalette}
							language={language}
							onLanguageChange={(nextLanguage) => {
								setLanguage(nextLanguage);
								setNotice(translations[nextLanguage].autoSave);
							}}
							onClearDraft={clearDraft}
						/>
						<div className={`print-workspace app-body ${previewVisible ? "" : "preview-hidden"}`}>
							<section className='print-editor form-column' aria-label={t.create}>
								<div className='form-card'>
									<div className='form-hero'>
										<h1>
											{language === "en" ? (
												<>
													Build a resume,
													<br />
													<em>that gets noticed.</em>
												</>
											) : (
												<>
													Зберіть резюме,
													<br />
													<em>яке помітять.</em>
												</>
											)}
										</h1>
										<div className='completion'>
											<strong>{completion.percent}%</strong>
											<span>
												{completion.filled} of {completion.total} {t.fields}
											</span>
											<i>
												<b style={{ width: `${completion.percent}%` }} />
											</i>
										</div>
									</div>
									<ResumeForm
										resume={resume}
										t={t}
										onChange={updateField}
										onExperienceChange={updateExperience}
										onResumeChange={updateResume}
									/>
								</div>
							</section>
							<ResumePreview ref={preview} resume={resume} t={t} language={language} />
						</div>
						<AppFooter t={t} />
					</div>
				</main>
			) : null}
		</>
	);
}
