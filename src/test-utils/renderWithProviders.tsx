import { TooltipProvider } from "@/shared/ui";
import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";

/* `main.tsx` wraps the whole app in a single `TooltipProvider`, outside of `App`
   itself. Every component under test that renders a `Tooltip` (almost all of them,
   through shared buttons) needs that same ancestor, or Radix throws. This mirrors
   that real composition instead of every test file reaching for its own wrapper. */
export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
	return render(<TooltipProvider delayDuration={0}>{ui}</TooltipProvider>, options);
}
