import { Tooltip, usePortalContainer } from "@/shared/ui";
import type { Language, Translation } from "@/shared/i18n";
import { isMode, type Mode, type Palette } from "@/entities/resume";
import { LanguageOptions } from "@/features/language-switch";
import { PaletteOptions } from "@/features/palette-switch";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, DotsThreeVertical, Moon, Sun, Trash } from "@phosphor-icons/react";

interface HeaderMenuProps {
	t: Translation;
	mode: Mode;
	onModeChange: (mode: Mode) => void;
	palette: Palette;
	onPaletteChange: (palette: Palette) => void;
	language: Language;
	onLanguageChange: (language: Language) => void;
	onClearDraft: () => void;
}

const MODES: Mode[] = ["dark", "light"];

/* Everything the toolbar cannot keep on screen on a phone, in one menu: colour mode,
   palette, interface language and Clear. What stays outside it is the point of the
   product — Download PDF above all — because tidying the header is not worth putting
   the export two taps away.

   It is a flat menu with three labelled groups rather than a menu of submenus. A
   submenu that flies out sideways on a 390px screen has nowhere to go, and it asks a
   keyboard user for two extra steps per choice; here every row is one Down and one
   Enter. The palette's and the language's rows come from their own features, so this
   file holds the arrangement and none of their knowledge. */
export function HeaderMenu({
	t,
	mode,
	onModeChange,
	palette,
	onPaletteChange,
	language,
	onLanguageChange,
	onClearDraft,
}: HeaderMenuProps) {
	const modeLabels: Record<Mode, string> = { dark: t.dark, light: t.light };
	/* the shell, not document.body: data-palette and data-mode live on the shell, and a
	   menu portalled outside it reads the :root defaults whatever the visitor chose */
	const portalContainer = usePortalContainer();

	return (
		<DropdownMenu.Root>
			<Tooltip label={t.menuLabel}>
				<DropdownMenu.Trigger asChild>
					<button className='header-menu-trigger' type='button' aria-label={t.menuLabel}>
						<DotsThreeVertical size={18} weight='bold' />
					</button>
				</DropdownMenu.Trigger>
			</Tooltip>
			<DropdownMenu.Portal container={portalContainer}>
				{/* Two classes on purpose: .palette-menu is the only menu surface this app has
				    — its z-index, card colour, padding and open animation — and sharing it
				    keeps the two menus identical instead of inventing a second look. The
				    .header-menu hooks beside it are ui-styles' to build on, and the pair can
				    become one neutral name the day they rename it. The same goes for the rows
				    below. */}
				<DropdownMenu.Content className='palette-menu header-menu' align='end' sideOffset={8} collisionPadding={8}>
					<DropdownMenu.Label className='header-menu-label'>{t.mode}</DropdownMenu.Label>
					<DropdownMenu.RadioGroup
						aria-label={t.mode}
						value={mode}
						onValueChange={(value) => isMode(value) && onModeChange(value)}
					>
						{MODES.map((option) => (
							<DropdownMenu.RadioItem key={option} className='palette-menu-item header-menu-item' value={option}>
								{option === "dark" ? <Moon size={15} /> : <Sun size={15} />}
								<span className='palette-menu-text header-menu-text'>{modeLabels[option]}</span>
								<DropdownMenu.ItemIndicator className='palette-menu-check header-menu-check'>
									<Check size={14} weight='bold' />
								</DropdownMenu.ItemIndicator>
							</DropdownMenu.RadioItem>
						))}
					</DropdownMenu.RadioGroup>

					<DropdownMenu.Separator className='header-menu-separator' />
					<DropdownMenu.Label className='header-menu-label'>{t.palette}</DropdownMenu.Label>
					<PaletteOptions palette={palette} t={t} onChange={onPaletteChange} />

					<DropdownMenu.Separator className='header-menu-separator' />
					<DropdownMenu.Label className='header-menu-label'>{t.interfaceLanguage}</DropdownMenu.Label>
					<LanguageOptions language={language} t={t} onChange={onLanguageChange} />

					<DropdownMenu.Separator className='header-menu-separator' />
					{/* Clear asks for confirmation through window.confirm, which blocks the
					    thread. It is fired after the menu has closed and handed focus back,
					    so the dialog does not open over a menu that is still unwinding. */}
					<DropdownMenu.Item
						className='palette-menu-item header-menu-item header-menu-danger'
						onSelect={() => window.setTimeout(onClearDraft, 0)}
					>
						<Trash size={15} />
						<span className='palette-menu-text header-menu-text'>{t.clear}</span>
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
}
