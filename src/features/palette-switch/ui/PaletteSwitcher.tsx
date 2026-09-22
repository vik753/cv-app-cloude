import { PaletteOptions } from "@/features/palette-switch/ui/PaletteOptions";
import { Tooltip } from "@/shared/ui";
import type { Translation } from "@/shared/i18n";
import type { Palette } from "@/entities/resume";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { CaretDown, Palette as PaletteIcon } from "@phosphor-icons/react";

interface PaletteSwitcherProps {
	palette: Palette;
	t: Translation;
	onChange: (palette: Palette) => void;
}

export function PaletteSwitcher({ palette, t, onChange }: PaletteSwitcherProps) {
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
					<PaletteOptions palette={palette} t={t} onChange={onChange} />
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
}
