import type { Translation } from "@/shared/i18n";
import type { Palette } from "@/entities/resume";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check } from "@phosphor-icons/react";

interface PaletteOptionsProps {
	palette: Palette;
	t: Translation;
	onChange: (palette: Palette) => void;
}

const THEMES: Palette[] = ["blurple", "cream", "slate"];

/* The three themes as menu rows, with nothing around them: the feature's own trigger
   puts them in its dropdown, and the header folds them into its one menu when the
   screen is too narrow for a row of controls. Either way they need a dropdown menu's
   content above them — they are Radix radio items. */
export function PaletteOptions({ palette, t, onChange }: PaletteOptionsProps) {
	const names: Record<Palette, string> = {
		blurple: t.themeBlurpleName,
		cream: t.themeCreamName,
		slate: t.themeSlateName,
	};
	const hints: Record<Palette, string> = {
		blurple: t.paletteBlurple,
		cream: t.paletteCream,
		slate: t.paletteSlate,
	};

	return (
		<DropdownMenu.RadioGroup
			aria-label={t.palette}
			value={palette}
			onValueChange={(value) => onChange(value as Palette)}
		>
			{THEMES.map((theme) => (
				<DropdownMenu.RadioItem key={theme} className='palette-menu-item' value={theme}>
					<span className={`swatch ${theme}`} aria-hidden='true' />
					<span className='palette-menu-text'>
						<strong>{names[theme]}</strong>
						<small>{hints[theme]}</small>
					</span>
					<DropdownMenu.ItemIndicator className='palette-menu-check'>
						<Check size={14} weight='bold' />
					</DropdownMenu.ItemIndicator>
				</DropdownMenu.RadioItem>
			))}
		</DropdownMenu.RadioGroup>
	);
}
