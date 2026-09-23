import { usePortalContainer } from "@/shared/ui/portalContainer";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type { ReactNode } from "react";

export const TooltipProvider = TooltipPrimitive.Provider;

interface TooltipProps {
	label: ReactNode;
	children: ReactNode;
	side?: "top" | "right" | "bottom" | "left";
}

export function Tooltip({ label, children, side = "top" }: TooltipProps) {
	/* into the shell rather than the body, so the tooltip resolves the palette and mode
	   the app is actually wearing; outside a provider this is null, which is what Radix
	   reads as document.body */
	const container = usePortalContainer();
	return (
		<TooltipPrimitive.Root delayDuration={250}>
			<TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
			<TooltipPrimitive.Portal container={container}>
				<TooltipPrimitive.Content className='tooltip-content' side={side} sideOffset={8} collisionPadding={8}>
					{label}
					<TooltipPrimitive.Arrow className='tooltip-arrow' />
				</TooltipPrimitive.Content>
			</TooltipPrimitive.Portal>
		</TooltipPrimitive.Root>
	);
}
