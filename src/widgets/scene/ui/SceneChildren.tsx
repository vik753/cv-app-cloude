import type { Season } from "@/widgets/scene/model/useDayNightCycle";
import { Kid } from "@/widgets/scene/ui/children/Kid";
import { ICE_LOOKS, LOOKS, type Outfit } from "@/widgets/scene/ui/children/looks";
import {
	CHASER,
	downhill,
	iceGround,
	LITTLE_ONE,
	ROLLER_ONE,
	ROLLER_THREE,
	ROLLER_TWO,
	RUNAWAY,
	SKATER_ONE,
	SKATER_THREE,
	SKATER_TWO,
	yardGround,
} from "@/widgets/scene/ui/children/routes";

/* The household's three children. In the warm half of the year they tear about the
   yard; in winter they stay up there rolling a snowman. Three others from the
   village come down past them to the river and skate. */

export function YardChildren({ season }: { season: Season }) {
	const outfit: Outfit = season === "summer" ? "summer" : "autumn";
	return (
		<g className='children'>
			<Kid route={CHASER} look={LOOKS[0]} outfit={outfit} ground={yardGround} from={0.13} to={0.386} />
			<Kid route={RUNAWAY} look={LOOKS[1]} outfit={outfit} ground={yardGround} from={0.132} to={0.388} scale={1} />
			<Kid route={LITTLE_ONE} look={LOOKS[2]} outfit={outfit} ground={yardGround} from={0.14} to={0.38} scale={0.82} />
		</g>
	);
}

export function SnowChildren() {
	return (
		<g className='children'>
			<Kid route={ROLLER_ONE} look={LOOKS[0]} outfit='winter' ground={yardGround} from={0.125} to={0.566} />
			<Kid route={ROLLER_TWO} look={LOOKS[1]} outfit='winter' ground={yardGround} from={0.128} to={0.562} scale={1} />
			<Kid
				route={ROLLER_THREE}
				look={LOOKS[2]}
				outfit='winter'
				ground={yardGround}
				from={0.132}
				to={0.572}
				scale={0.82}
			/>
		</g>
	);
}

export function IceChildren() {
	return (
		<g className='children children-ice'>
			<Kid
				route={SKATER_ONE}
				look={ICE_LOOKS[0]}
				outfit='winter'
				ground={iceGround}
				from={0.242}
				to={0.552}
				scale={downhill(1.35)}
			/>
			<Kid
				route={SKATER_TWO}
				look={ICE_LOOKS[1]}
				outfit='winter'
				ground={iceGround}
				from={0.262}
				to={0.558}
				scale={downhill(1.45)}
			/>
			<Kid
				route={SKATER_THREE}
				look={ICE_LOOKS[2]}
				outfit='winter'
				ground={iceGround}
				from={0.252}
				to={0.562}
				scale={downhill(1.15)}
			/>
		</g>
	);
}
