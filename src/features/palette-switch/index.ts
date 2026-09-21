/* The trigger and its dropdown ship as one component; the THEMES list and the name and
   hint lookups stay inside. Palette itself is not re-exported here — it belongs to
   entities/resume, and callers take it from there rather than through this feature. */
export { PaletteSwitcher } from "@/features/palette-switch/ui/PaletteSwitcher";
