import { PaletteOptions } from "@/features/palette-switch/ui/PaletteOptions";
import { Tooltip, usePortalContainer } from "@/shared/ui";
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
	/* the same theme-scope problem as the header's menu: portalled into document.body the
	   menu sits outside data-palette and data-mode and paints in the :root defaults */
	const portalContainer = usePortalContainer();

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
			<DropdownMenu.Portal container={portalContainer}>
				<DropdownMenu.Content className='palette-menu' align='start' sideOffset={8}>
					<PaletteOptions palette={palette} t={t} onChange={onChange} />
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
}
