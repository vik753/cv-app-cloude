import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type { ReactNode } from "react";

export const TooltipProvider = TooltipPrimitive.Provider;

interface TooltipProps {
	label: ReactNode;
	children: ReactNode;
	side?: "top" | "right" | "bottom" | "left";
}

export function Tooltip({ label, children, side = "top" }: TooltipProps) {
	return (
		<TooltipPrimitive.Root delayDuration={250}>
			<TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
			<TooltipPrimitive.Portal>
				<TooltipPrimitive.Content className='tooltip-content' side={side} sideOffset={8} collisionPadding={8}>
					{label}
					<TooltipPrimitive.Arrow className='tooltip-arrow' />
				</TooltipPrimitive.Content>
			</TooltipPrimitive.Portal>
		</TooltipPrimitive.Root>
	);
}
