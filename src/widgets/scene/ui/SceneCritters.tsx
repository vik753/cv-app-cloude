import type { Season } from "@/widgets/scene/lib/season";
import { SnowChildren, YardChildren } from "@/widgets/scene/ui/SceneChildren";
import { Snowman } from "@/widgets/scene/ui/children/Snowman";
import { FieldFolk } from "@/widgets/scene/ui/SceneFieldFolk";
import { Revellers } from "@/widgets/scene/ui/SceneRevellers";
import { HomesteadFence } from "@/widgets/scene/ui/SceneVillage";
import { Cossack } from "@/widgets/scene/ui/critters/Cossack";
import { Dog } from "@/widgets/scene/ui/critters/Dog";
import { Fox } from "@/widgets/scene/ui/critters/Fox";
import { Hare } from "@/widgets/scene/ui/critters/Hare";
import { Hedgehog } from "@/widgets/scene/ui/critters/Hedgehog";
import { Kennel } from "@/widgets/scene/ui/critters/Kennel";
import { HARE_PRINTS, LOWER_PRINTS } from "@/widgets/scene/ui/critters/prints";
import { Tracks } from "@/widgets/scene/ui/critters/Tracks";
import { Wolf } from "@/widgets/scene/ui/critters/Wolf";
import type { Layer } from "@/widgets/scene/ui/critters/rig";

interface CritterProps {
	season: Season;
}

/* on the upper meadow, between the trees and the bush they hide in */
export function UpperCritters({ season }: CritterProps) {
	return (
		<g className={`critters critters-${season}`}>
			{/* up at the field, in front of it: the margin they work from is nearer
			    than anything growing on the plot */}
			<FieldFolk season={season} />
			{season === "winter" ? <Tracks prints={HARE_PRINTS} /> : null}
			<Hare />
			<Hedgehog season={season} />
			{/* he comes out for a smoke whatever the season, and walks behind the fence */}
			<Cossack season={season} />
			{/* of an evening, two neighbours wander from one хата to the other */}
			<Revellers season={season} />
			<HomesteadFence />
			{/* in the warm seasons the children play out here; in winter they are on the river */}
			{season === "winter" ? (
				<>
					{/* the snowman first: they play round it all afternoon, and always on
					    the near side of it */}
					<Snowman />
					<SnowChildren />
				</>
			) : (
				<YardChildren season={season} />
			)}
			<Dog />
			{/* drawn last, so the dog resting inside shows only its muzzle */}
			<Kennel />
		</g>
	);
}

/* on the lower meadow: rendered once behind its trees and once in front of them */
export function LowerCritters({ season, layer }: CritterProps & { layer: Layer }) {
	return (
		<g className={`critters critters-${season}`}>
			{/* tracks lie under everything, so they go with the back layer only */}
			{season === "winter" && layer === "back" ? <Tracks prints={LOWER_PRINTS} /> : null}
			<Fox season={season} layer={layer} />
			<Wolf layer={layer} />
		</g>
	);
}
