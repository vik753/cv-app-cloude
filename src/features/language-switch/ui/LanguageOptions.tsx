import { languageLabels } from "@/features/language-switch/config/languageLabels";
import type { Language, Translation } from "@/shared/i18n";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check } from "@phosphor-icons/react";

interface LanguageOptionsProps {
	language: Language;
	t: Translation;
	onChange: (language: Language) => void;
}

/* The same choice as the segmented switch, shaped as menu rows: on a narrow screen the
   header has no room for a row of controls and folds them into one menu instead. This
   is the body of that choice and nothing around it, so it has to be rendered inside a
   dropdown menu's content — the rows are Radix radio items and they need a menu above
   them to be reachable by keyboard. */
export function LanguageOptions({ language, t, onChange }: LanguageOptionsProps) {
	const hints: Record<Language, string> = {
		en: t.switchToEnglish,
		uk: t.switchToUkrainian,
	};

	return (
		<DropdownMenu.RadioGroup
			aria-label={t.interfaceLanguage}
			value={language}
			onValueChange={(value) => onChange(value as Language)}
		>
			{/* the palette menu's row classes are the app's only styled menu row, so the rows
			    borrow them; the .header-menu-* hooks beside them are ui-styles' own */}
			{(["en", "uk"] as const).map((option) => (
				<DropdownMenu.RadioItem key={option} className='palette-menu-item header-menu-item' value={option}>
					<span className='header-menu-code'>{languageLabels[option]}</span>
					<span className='palette-menu-text header-menu-text'>{hints[option]}</span>
					<DropdownMenu.ItemIndicator className='palette-menu-check header-menu-check'>
						<Check size={14} weight='bold' />
					</DropdownMenu.ItemIndicator>
				</DropdownMenu.RadioItem>
			))}
		</DropdownMenu.RadioGroup>
	);
}
