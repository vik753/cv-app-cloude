import { CHIMNEYS, projectScene } from "@/services/landscape";
import { useEffect, useState, type CSSProperties } from "react";

/* Chimney smoke, drawn in the sky layer rather than inside the landscape.
   The landscape is cropped at the top, leaving little air above the roofs on a
   short window, and smoke that ran into that edge was cut off mid-rise. Up here
   the whole sky is available, so it can climb and thin out into nothing. */
const PUFFS = [0, 1.6, 3.2, 4.8, 6.4];

const viewportSize = () => ({
	width: typeof window === "undefined" ? 1440 : window.innerWidth,
	height: typeof window === "undefined" ? 900 : window.innerHeight,
});

export function SceneSmoke() {
	const [viewport, setViewport] = useState(viewportSize);

	useEffect(() => {
		const onResize = () => setViewport(viewportSize());
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, []);

	const scene = projectScene(viewport);

	return (
		<div className='chimney-smoke' aria-hidden='true'>
			{CHIMNEYS.map((chimney) => {
				const spot = scene.at(chimney.x, chimney.y);
				return (
					<div
						key={chimney.x}
						className='smoke-column'
						style={{ left: `${spot.left}px`, top: `${spot.top}px` }}
					>
						{PUFFS.map((delay) => (
							<i
								key={delay}
								className='smoke-puff'
								style={
									{
										"--puff-delay": `${delay}s`,
										"--puff-size": `${5.2 * chimney.scale * scene.scale}px`,
										"--puff-rise": `${150 * chimney.scale * scene.scale}px`,
									} as CSSProperties
								}
							/>
						))}
					</div>
				);
			})}
		</div>
	);
}
