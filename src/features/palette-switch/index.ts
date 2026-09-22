/* The trigger with its own dropdown, and the same three rows on their own for a menu
   that is not this feature's: on a narrow screen the header folds palette, language,
   mode and Clear into one menu, and the palette's rows go in there rather than being
   reinvented by the page. The THEMES list and the name and hint lookups stay inside.
   Palette itself is not re-exported here — it belongs to entities/resume, and callers
   take it from there rather than through this feature. */
export { PaletteSwitcher } from "@/features/palette-switch/ui/PaletteSwitcher";
export { PaletteOptions } from "@/features/palette-switch/ui/PaletteOptions";
