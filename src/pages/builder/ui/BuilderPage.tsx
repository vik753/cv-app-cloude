import { computeCompletion } from "@/pages/builder/lib/completion";
import { BuilderHeader } from "@/pages/builder/ui/BuilderHeader";
import { BrandLogo, Tooltip } from "@/shared/ui";
import { translations, useLanguage } from "@/shared/i18n";
import { useResumeStore } from "@/entities/resume";
import { ResumeForm } from "@/features/resume-form";
import { ResumePreview } from "@/features/resume-preview";
import { DayNightScene, SceneMusic } from "@/widgets/scene";
import { AppFooter } from "@/widgets/app-footer";
import { CornersOut, Minus } from "@phosphor-icons/react";
import { useMemo, useState } from "react";

interface BuilderPageProps {
	/* the scene switch is a stored preference App owns; the page renders the switch */
	sceneEnabled: boolean;
	onToggleScene: () => void;
}

export function BuilderPage({ sceneEnabled, onToggleScene }: BuilderPageProps) {
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
	const [minimized, setMinimized] = useState(false);
	/* minimizing only makes sense with the scene behind the form and nothing beside it */
	const canMinimize = sceneEnabled && !previewVisible;

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
			<DayNightScene active={sceneEnabled} language={language} />
			<main
				data-palette={palette}
				data-mode={mode}
				className={`app-shell ${sceneEnabled ? "scene-active" : ""} ${minimized ? "minimized" : ""}`}
			>
				<div className='app-window' inert={minimized}>
					<BuilderHeader
						t={t}
						notice={notice}
						previewVisible={previewVisible}
						onTogglePreview={togglePreview}
						sceneEnabled={sceneEnabled}
						onToggleScene={onToggleScene}
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
					<div
						className={`print-workspace app-body ${previewVisible ? "" : "preview-hidden"} ${previewEntering ? "preview-entering" : ""}`}
					>
						<section className='print-editor form-column' aria-label={t.create}>
							<div className='form-card'>
								{canMinimize ? (
									<Tooltip label={t.minimize}>
										<button
											className='window-minimize'
											type='button'
											aria-label={t.minimize}
											onClick={() => setMinimized(true)}
										>
											<Minus size={9} weight='bold' />
										</button>
									</Tooltip>
								) : null}
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
				{/* the scene gets its tune, from YouTube, while it has the whole screen */}
				<SceneMusic playing={minimized} label={t.music} />
				{minimized ? (
					<Tooltip label={t.restore}>
						<button className='window-badge' type='button' aria-label={t.restore} onClick={() => setMinimized(false)}>
							<BrandLogo />
							<span className='window-restore'>
								<CornersOut size={11} weight='bold' />
							</span>
						</button>
					</Tooltip>
				) : null}
			</main>
		</>
	);
}
