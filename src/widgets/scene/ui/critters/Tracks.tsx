import { useCycleFrame } from "@/widgets/scene/model/useSceneClock";
import type { Print } from "@/widgets/scene/ui/critters/prints";
import { useRef } from "react";

export function Tracks({ prints }: { prints: Print[] }) {
	const group = useRef<SVGGElement>(null);
	const shown = useRef(-1);

	useCycleFrame((f) => {
		/* prints are in the order they were made, so only a count needs tracking */
		let count = 0;
		while (count < prints.length && prints[count].f <= f) count += 1;
		if (count === shown.current || !group.current) return;
		Array.from(group.current.children).forEach((print, index) =>
			print.setAttribute("opacity", index < count ? "1" : "0"),
		);
		shown.current = count;
	});

	return (
		<g ref={group} className='tracks'>
			{prints.map((print, index) => (
				<ellipse key={index} cx={print.x.toFixed(1)} cy={print.y.toFixed(1)} rx={print.rx} ry={print.ry} opacity={0} />
			))}
		</g>
	);
}
