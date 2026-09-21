import { BrandLogo, Tooltip } from "@/shared/ui";
import type { Language, Translation } from "@/shared/i18n";
import type { Palette } from "@/entities/resume";
import { LanguageSwitcher } from "@/features/language-switch";
import { PaletteSwitcher } from "@/features/palette-switch";
import { DownloadSimple, Eye, EyeSlash, Moon, Mountains, Sun, Trash } from "@phosphor-icons/react";

/* entities/resume publishes Palette but not the mode union, so it is spelled out here */
type Mode = "light" | "dark";

interface BuilderHeaderProps {
	t: Translation;
	notice: string;
	previewVisible: boolean;
	onTogglePreview: () => void;
	sceneEnabled: boolean;
	onToggleScene: () => void;
	mode: Mode;
	onModeChange: (mode: Mode) => void;
	palette: Palette;
	onPaletteChange: (palette: Palette) => void;
	language: Language;
	onLanguageChange: (language: Language) => void;
	onClearDraft: () => void;
}

/* The toolbar across the top of the page: brand and autosave notice, the print and
   preview controls, and the switches for scene, mode, palette and language. It owns no
   state of its own — everything it changes belongs to the page or to the store. */
export function BuilderHeader({
	t,
	notice,
	previewVisible,
	onTogglePreview,
	sceneEnabled,
	onToggleScene,
	mode,
	onModeChange,
	palette,
	onPaletteChange,
	language,
	onLanguageChange,
	onClearDraft,
}: BuilderHeaderProps) {
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
				<button className='header-download' type='button' onClick={() => window.print()}>
					<DownloadSimple size={16} />
					{t.download}
				</button>
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
				<Tooltip label={sceneEnabled ? t.sceneHide : t.sceneShow}>
					<button
						className={`scene-toggle${sceneEnabled ? " active" : ""}`}
						type='button'
						aria-pressed={sceneEnabled}
						aria-label={sceneEnabled ? t.sceneHide : t.sceneShow}
						onClick={onToggleScene}
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
							disabled={sceneEnabled}
							onClick={() => onModeChange("light")}
						>
							<Sun size={15} />
						</button>
					</Tooltip>
				</div>
				<PaletteSwitcher palette={palette} t={t} onChange={onPaletteChange} />
				<LanguageSwitcher language={language} t={t} onChange={onLanguageChange} />
				<Tooltip label={t.clearTooltip}>
					<button className='header-clear' type='button' onClick={onClearDraft} aria-label={t.clearTooltip}>
						<Trash size={16} />
						{t.clear}
					</button>
				</Tooltip>
			</div>
		</header>
	);
}
