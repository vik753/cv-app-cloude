import { Tooltip } from "@/components/ui/tooltip";
import { useDayNightCycle } from "@/hooks/useDayNightCycle";
import {
	DayNightScene,
	LanguageSwitcher,
	PaletteSwitcher,
	ResumeForm,
	ResumePreview,
	translations,
	useLanguage,
	useResumeStore,
} from "@/index";
import { DownloadSimple, Eye, EyeSlash, Moon, Mountains, Sun, Trash } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";

const readSceneEnabled = (): boolean => {
	const saved = localStorage.getItem("resume-canvas-scene");
	return saved === null ? true : saved === "on";
};

export function App() {
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

	const completion = useMemo(() => {
		const values = [
			resume.name,
			resume.role,
			resume.summary,
			resume.email,
			resume.phone,
			resume.location,
			resume.website,
			resume.github,
			resume.linkedin,
			resume.photo,
			resume.skills.length ? "filled" : "",
			resume.languages.length ? "filled" : "",
			resume.experience.length ? "filled" : "",
			...resume.experience.flatMap((item) => [item.company, item.role, item.period, item.description]),
			resume.education,
			resume.certificates,
		];
		const filled = values.filter(Boolean).length;
		const total = 19;
		return { filled: Math.min(filled, total), total, percent: Math.min(100, Math.round((filled / total) * 100)) };
	}, [resume]);

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
			<main data-palette={palette} data-mode={mode} className={`app-shell ${sceneEnabled ? "scene-active" : ""}`}>
				<header className='print-header app-header'>
					<div className='app-brand'>
						<span className='brand-mark'>cv</span>
						<span>Resume Canvas</span>
					</div>
					<button className='header-download' type='button' onClick={() => window.print()}>
						<DownloadSimple size={16} />
						{t.download}
					</button>
					<div className='header-actions'>
						<Tooltip label={sceneEnabled ? t.sceneHide : t.sceneShow}>
							<button
								className={`scene-toggle${sceneEnabled ? " active" : ""}`}
								type='button'
								aria-pressed={sceneEnabled}
								aria-label={sceneEnabled ? t.sceneHide : t.sceneShow}
								onClick={() => setSceneEnabled((current) => !current)}
							>
								<Mountains size={16} weight={sceneEnabled ? "fill" : "regular"} />
								<span className='scene-toggle-state'>{sceneEnabled ? t.sceneOn : t.sceneOff}</span>
							</button>
						</Tooltip>
						<div className='segmented' aria-label={t.mode}>
							<Tooltip label={t.dark}>
								<button
									className={mode === "dark" ? "active" : ""}
									type='button'
									aria-label={t.dark}
									disabled={sceneEnabled}
									onClick={() => setMode("dark")}
								>
									<Moon size={15} />
								</button>
							</Tooltip>
							<Tooltip label={t.light}>
								<button
									className={mode === "light" ? "active" : ""}
									type='button'
									aria-label={t.light}
									disabled={sceneEnabled}
									onClick={() => setMode("light")}
								>
									<Sun size={15} />
								</button>
							</Tooltip>
						</div>
						<PaletteSwitcher palette={palette} t={t} onChange={setPalette} />
						<LanguageSwitcher
							language={language}
							t={t}
							onChange={(nextLanguage) => {
								setLanguage(nextLanguage);
								setNotice(translations[nextLanguage].autoSave);
							}}
						/>
						<span className='autosave'>
							<span />
							{notice}
						</span>
						<Tooltip label={t.clearTooltip}>
							<button className='header-clear' type='button' onClick={clearDraft} aria-label={t.clearTooltip}>
								<Trash size={16} />
								{t.clear}
							</button>
						</Tooltip>
						<Tooltip label={previewVisible ? t.previewHide : t.previewShow}>
							<button
								className={`preview-toggle${previewVisible ? " active" : ""}`}
								type='button'
								aria-expanded={previewVisible}
								aria-label={previewVisible ? t.previewHide : t.previewShow}
								onClick={togglePreview}
							>
								{previewVisible ? <EyeSlash size={16} /> : <Eye size={16} />}
								<span className='preview-toggle-state'>{t.previewLabel}</span>
							</button>
						</Tooltip>
					</div>
				</header>
				<div
					className={`print-workspace app-body ${previewVisible ? "" : "preview-hidden"} ${previewEntering ? "preview-entering" : ""}`}
				>
					<section className='print-editor form-column' aria-label={t.create}>
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
					</section>
					<ResumePreview resume={resume} t={t} language={language} />
				</div>
			</main>
		</>
	);
}
