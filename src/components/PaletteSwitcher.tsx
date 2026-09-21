import { Tooltip } from "@/shared/ui";
import type { Translation } from "@/shared/i18n";
import type { Palette } from "@/services/resumeStore";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { CaretDown, Check, Palette as PaletteIcon } from "@phosphor-icons/react";

interface PaletteSwitcherProps {
	palette: Palette;
	t: Translation;
	onChange: (palette: Palette) => void;
}

const THEMES: Palette[] = ["blurple", "cream", "slate"];

export function PaletteSwitcher({ palette, t, onChange }: PaletteSwitcherProps) {
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
		<DropdownMenu.Root>
			<Tooltip label={t.palette}>
				<DropdownMenu.Trigger asChild>
					<button className='palette-trigger' type='button' aria-label={t.palette}>
						<PaletteIcon size={15} />
						<span className={`swatch ${palette}`} aria-hidden='true' />
						<CaretDown size={11} weight='bold' className='caret' />
					</button>
				</DropdownMenu.Trigger>
			</Tooltip>
			<DropdownMenu.Portal>
				<DropdownMenu.Content className='palette-menu' align='start' sideOffset={8}>
					<DropdownMenu.RadioGroup value={palette} onValueChange={(value) => onChange(value as Palette)}>
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
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
}
