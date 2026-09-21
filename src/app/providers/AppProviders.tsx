import { TooltipProvider } from "@/shared/ui";
import type { ReactNode } from "react";

interface AppProvidersProps {
	children: ReactNode;
}

/* Every context the whole tree sits in, in one place. Today that is Radix's tooltip
   provider: almost every button in the app is wrapped in a Tooltip, and Radix throws
   without a provider above it. The 250 ms delay is the one the app has always used. */
export function AppProviders({ children }: AppProvidersProps) {
	return <TooltipProvider delayDuration={250}>{children}</TooltipProvider>;
}
