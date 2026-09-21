import { computeCompletion } from "@/pages/builder/lib/completion";
import type { BuilderView } from "@/pages/builder/types";
import { BuilderHeader } from "@/pages/builder/ui/BuilderHeader";
import { WelcomeGate } from "@/pages/builder/ui/WelcomeGate";
import { translations, useLanguage } from "@/shared/i18n";
import { useResumeStore } from "@/entities/resume";
import { ResumeForm } from "@/features/resume-form";
import { ResumePreview } from "@/features/resume-preview";
import { DayNightScene, SceneMusic } from "@/widgets/scene";
import { AppFooter } from "@/widgets/app-footer";
import { useMemo, useState } from "react";

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
	const [previewEntering, setPreviewEntering] = useState(false);

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
		setPreviewEntering(true);
		window.setTimeout(() => setPreviewEntering(false), 360);
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
			<SceneMusic playing={view === "scene"} label={t.music} />
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
						<div
							className={`print-workspace app-body ${previewVisible ? "" : "preview-hidden"} ${previewEntering ? "preview-entering" : ""}`}
						>
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
							<ResumePreview resume={resume} t={t} language={language} />
						</div>
						<AppFooter t={t} />
					</div>
				</main>
			) : null}
		</>
	);
}
