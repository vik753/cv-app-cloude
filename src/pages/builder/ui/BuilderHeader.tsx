import { useCompactViewport } from "@/pages/builder/model/useCompactViewport";
import { HeaderMenu } from "@/pages/builder/ui/HeaderMenu";
import { BrandLogo, Tooltip } from "@/shared/ui";
import type { Language, Translation } from "@/shared/i18n";
import type { Mode } from "@/entities/resume";
import type { Palette } from "@/entities/resume";
import { LanguageSwitcher } from "@/features/language-switch";
import { PaletteSwitcher } from "@/features/palette-switch";
import { DownloadSimple, Eye, EyeSlash, Moon, Mountains, Sun, Trash } from "@phosphor-icons/react";

interface BuilderHeaderProps {
	t: Translation;
	notice: string;
	previewVisible: boolean;
	onTogglePreview: () => void;
	onBackToScene: () => void;
	mode: Mode;
	onModeChange: (mode: Mode) => void;
	palette: Palette;
	onPaletteChange: (palette: Palette) => void;
	language: Language;
	onLanguageChange: (language: Language) => void;
	onClearDraft: () => void;
}

/* The toolbar across the top of the page: brand and autosave notice, the print and
   preview controls, the way back out to the scene, and the switches for mode, palette
   and language. It owns no state of its own — everything it changes belongs to the
   page or to the store.

   Eight controls do not fit a phone, so below 560px the four nobody touches twice in a
   session — mode, palette, language and Clear — move into one menu, and the four that
   are the product stay where they are: the brand, Download PDF, the preview toggle and
   the way back to the scene. Only one of the two arrangements is ever in the DOM. */
export function BuilderHeader({
	t,
	notice,
	previewVisible,
	onTogglePreview,
	onBackToScene,
	mode,
	onModeChange,
	palette,
	onPaletteChange,
	language,
	onLanguageChange,
	onClearDraft,
}: BuilderHeaderProps) {
	const compact = useCompactViewport();

	/* the label goes, the ornament and the accessible name stay: the name is spelled out
	   on the button itself rather than left to the text, so no stylesheet can take it
	   away by hiding the span */
	const backToScene = (
		<button className='scene-return' type='button' aria-label={t.sceneBack} onClick={onBackToScene}>
			<Mountains size={16} weight='fill' />
			{compact ? null : <span className='scene-return-label'>{t.sceneBack}</span>}
		</button>
	);

	return (
		<header className='print-header app-header'>
			<div className='header-start'>
				<BrandLogo className='app-brand' />
				<span className='autosave'>
					<span />
					{notice}
				</span>
			</div>
			<div className='header-center'>
				{/* The export is the browser's print dialog, and the two things that spoil a PDF
				    most often are picking a printer instead of a file and leaving the browser's
				    own date-and-address margins on — so the button says so before it is used. */}
				<Tooltip label={t.downloadHint}>
					<button className='header-download' type='button' onClick={() => window.print()}>
						<DownloadSimple size={16} />
						{t.download}
					</button>
				</Tooltip>
				<Tooltip label={previewVisible ? t.previewHide : t.previewShow}>
					<button
						className={`preview-toggle${previewVisible ? " active" : ""}`}
						type='button'
						aria-expanded={previewVisible}
						aria-label={previewVisible ? t.previewHide : t.previewShow}
						onClick={onTogglePreview}
					>
						{previewVisible ? <EyeSlash size={16} /> : <Eye size={16} />}
						<span className='preview-toggle-state'>{t.previewLabel}</span>
					</button>
				</Tooltip>
			</div>
			<div className='header-actions'>
				{/* the one control for one piece of state: leaving the form is the same act
				    as turning the animated background back on, so it is a single labelled
				    button rather than a switch beside it. Narrow, it keeps the ornament and
				    gains the tooltip its missing label leaves room for. */}
				{compact ? <Tooltip label={t.sceneBack}>{backToScene}</Tooltip> : backToScene}
				{compact ? (
					<HeaderMenu
						t={t}
						mode={mode}
						onModeChange={onModeChange}
						palette={palette}
						onPaletteChange={onPaletteChange}
						language={language}
						onLanguageChange={onLanguageChange}
						onClearDraft={onClearDraft}
					/>
				) : (
					<>
						<div className='segmented' aria-label={t.mode}>
							<Tooltip label={t.dark}>
								<button
									className={mode === "dark" ? "active" : ""}
									type='button'
									aria-label={t.dark}
									onClick={() => onModeChange("dark")}
								>
									<Moon size={15} />
								</button>
							</Tooltip>
							<Tooltip label={t.light}>
								<button
									className={mode === "light" ? "active" : ""}
									type='button'
									aria-label={t.light}
									onClick={() => onModeChange("light")}
								>
									<Sun size={15} />
								</button>
							</Tooltip>
						</div>
						<PaletteSwitcher palette={palette} t={t} onChange={onPaletteChange} />
						<LanguageSwitcher language={language} t={t} onChange={onLanguageChange} />
						{/* the name is the short verb; the sentence of warning stays in the
						    tooltip, where a warning belongs — as a button name it is a
						    paragraph read out in a list of controls */}
						<Tooltip label={t.clearTooltip}>
							<button className='header-clear' type='button' onClick={onClearDraft} aria-label={t.clear}>
								<Trash size={16} />
								{t.clear}
							</button>
						</Tooltip>
					</>
				)}
			</div>
		</header>
	);
}
