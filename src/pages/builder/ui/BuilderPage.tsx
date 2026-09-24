import { computeCompletion } from "@/pages/builder/lib/completion";
import { visibleFraction } from "@/pages/builder/lib/visibility";
import { usePrintFileName } from "@/pages/builder/model/usePrintFileName";
import type { BuilderView } from "@/pages/builder/types";
import { BuilderHeader } from "@/pages/builder/ui/BuilderHeader";
import { WelcomeGate } from "@/pages/builder/ui/WelcomeGate";
import { translations, useLanguage } from "@/shared/i18n";
import { PortalContainerContext } from "@/shared/ui";
import { useResumeStore } from "@/entities/resume";
import { ResumeForm } from "@/features/resume-form";
import { ResumePreview } from "@/features/resume-preview";
import { DayNightScene, SceneMusic } from "@/widgets/scene";
import { AppFooter } from "@/widgets/app-footer";
import { useMemo, useRef, useState } from "react";

/* How long anything that measures the preview waits before it looks. The coupling is
   with the entrance in layout.css — a 240ms opacity fade, with the column track
   switching 200ms in — and the requirement is only that this outlasts it: a rect read
   while the preview is still arriving describes a place it is no longer in. It is a
   ceiling over those durations, not a copy of one, so it survives them being retuned. */
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
}

export function BuilderPage({ view, visitedForm, onEnterScene, onEnterForm }: BuilderPageProps) {
	const resume = useResumeStore((state) => state.resume);
	usePrintFileName();
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
	/* The shell is what carries data-palette and data-mode, so it is also what the
	   header's menus portal into — outside it they land in document.body, where neither
	   attribute is in scope and every token falls back to its :root default. It is held
	   in state rather than in a ref because a ref's node arrives without a re-render,
	   and the value has to be on the context by the time a menu is opened. The callback
	   is React's own setter, so it is stable and the portal is not torn down and rebuilt
	   on every render. */
	const [shell, setShell] = useState<HTMLElement | null>(null);

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
				<main ref={setShell} data-palette={palette} data-mode={mode} className='app-shell'>
					<PortalContainerContext value={shell}>
						<div className='app-window'>
							<BuilderHeader
								t={t}
								notice={notice}
								previewVisible={previewVisible}
								onTogglePreview={togglePreview}
								onBackToScene={onEnterScene}
								mode={mode}
								onModeChange={setMode}
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
												{t.formHeading.lead}
												<br />
												<em>{t.formHeading.emphasis}</em>
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
					</PortalContainerContext>
				</main>
			) : null}
		</>
	);
}
