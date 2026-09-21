import type { Season } from "@/widgets/scene/model/useDayNightCycle";
import { upperGround } from "@/widgets/scene/lib/landscape";
import { DRESSES } from "@/widgets/scene/ui/field-folk/dress";
import { Reaper } from "@/widgets/scene/ui/field-folk/Reaper";
import { bounds, fieldGround, MOWING, ROUTES, TOOLS } from "@/widgets/scene/ui/field-folk/routes";
import { Worker } from "@/widgets/scene/ui/field-folk/Worker";

/* The folk who work the plot. The two women's year is the field's: they come out in
   spring to sow it, walk up to tend it while the wheat stands through the summer,
   and bind it into sheaves across the autumn day — and in winter, with nothing
   growing, they only go from one хата to the other. At the harvest a man goes up
   with them and mows ahead of them with a scythe, band by band, and they gather
   what he has laid down behind him.

   They are drawn in front of the whole field, which is right as long as they keep
   to the bare margin along its near edge: nothing growing is ever nearer than they
   are. In spring there is no crop to stand behind, so then they walk the rows. */

export function FieldFolk({ season }: { season: Season }) {
	const [first, second] = ROUTES[season];
	/* winter is written against the meadow the хати stand on, the rest against the
	   field's near edge */
	const ground = season === "winter" ? upperGround : fieldGround;
	const [fromA, toA] = bounds(first);
	const [fromB, toB] = bounds(second);

	return (
		<g className='field-folk'>
			{/* he works deeper up the plot than they do, so he goes in behind them */}
			{season === "autumn" ? <Reaper route={MOWING} ground={ground} /> : null}
			<Worker
				route={first}
				dress={DRESSES[0]}
				tool={TOOLS[season]}
				season={season}
				ground={ground}
				tempo={1}
				from={fromA}
				to={toA}
			/>
			<Worker
				route={second}
				dress={DRESSES[1]}
				tool={TOOLS[season]}
				season={season}
				ground={ground}
				tempo={0.88}
				from={fromB}
				to={toB}
			/>
		</g>
	);
}
