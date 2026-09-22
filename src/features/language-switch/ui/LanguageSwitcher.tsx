import { languageLabels } from "@/features/language-switch/config/languageLabels";
import { Tooltip } from "@/shared/ui";
import type { Language, Translation } from "@/shared/i18n";

interface LanguageSwitcherProps {
	language: Language;
	t: Translation;
	onChange: (language: Language) => void;
}

export function LanguageSwitcher({ language, t, onChange }: LanguageSwitcherProps) {
	return (
		<div className='language-switcher flex gap-0.5 rounded border p-0.5' aria-label={t.interfaceLanguage}>
			{(["en", "uk"] as const).map((option) => (
				<Tooltip key={option} label={option === "en" ? t.switchToEnglish : t.switchToUkrainian}>
					<button
						className={`rounded px-2 py-1 font-mono text-[10px] ${language === option ? "active" : ""}`}
						type='button'
						onClick={() => onChange(option)}
					>
						{languageLabels[option]}
					</button>
				</Tooltip>
			))}
		</div>
	);
}
