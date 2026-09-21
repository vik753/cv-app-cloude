import type { Season } from "@/hooks/useDayNightCycle";
import { ease, lerp, onRoute, presence, set, show, TAU, useCycleFrame, type Waypoint } from "@/hooks/useSceneClock";
import { BANDS, BIND_LAG, FIELD, fieldRow, mownAt, upperGround } from "@/services/landscape";
import { useRef } from "react";

/* The folk who work the plot. The two women's year is the field's: they come out in
   spring to sow it, walk up to tend it while the wheat stands through the summer,
   and bind it into sheaves across the autumn day — and in winter, with nothing
   growing, they only go from one хата to the other. At the harvest a man goes up
   with them and mows ahead of them with a scythe, band by band, and they gather
   what he has laid down behind him.

   They are drawn in front of the whole field, which is right as long as they keep
   to the bare margin along its near edge: nothing growing is ever nearer than they
   are. In spring there is no crop to stand behind, so then they walk the rows. */

type WorkMode = "hidden" | "walk" | "sow" | "tend" | "bind" | "mow" | "stand";
type Headwear = "wreath" | "scarf";

interface Dress {
	blouse: string;
	bodice: string;
	skirt: string;
	skirtTrim: string;
	apron: string;
	trim: string;
	hair: string;
	/* the хустка she ties on in winter — and all year, for the one who wears one */
	scarf: string;
	/* her sheepskin, which covers the плахта once the snow comes */
	sheepskin: string;
	sheepskinDark: string;
	head: Headwear;
}

const DRESSES: [Dress, Dress] = [
	{
		blouse: "#f7f3e8",
		bodice: "#2f5d8a",
		skirt: "#9c3b2e",
		skirtTrim: "#e0b855",
		apron: "#efe6d2",
		trim: "#c0392b",
		hair: "#6b4a2f",
		scarf: "#3d7bb8",
		sheepskin: "#d8c9a8",
		sheepskinDark: "#bda884",
		head: "wreath",
	},
	{
		blouse: "#f4efe2",
		bodice: "#2f4a3a",
		skirt: "#7a3b4a",
		skirtTrim: "#e0b855",
		apron: "#e8dcc4",
		trim: "#c9a14a",
		hair: "#3f2e22",
		scarf: "#d0452f",
		sheepskin: "#c9a97a",
		sheepskinDark: "#ab8a5e",
		head: "scarf",
	},
];

/* the wreath's flowers, and the ribbons hanging from the back of it */
const WREATH = [
	{ x: -2.6, y: -5.2, fill: "#c0392b" },
	{ x: -1.3, y: -6.1, fill: "#e0b855" },
	{ x: 0, y: -6.4, fill: "#f2f2f2" },
	{ x: 1.3, y: -6.1, fill: "#3d7bb8" },
	{ x: 2.6, y: -5.2, fill: "#c0392b" },
];

interface WomanProps {
	dress: Dress;
	/* a basket of seed in spring, a sickle at the harvest */
	tool: "basket" | "sickle" | "none";
	coat: boolean;
	root: React.RefObject<SVGGElement | null>;
	bend: React.RefObject<SVGGElement | null>;
	legNear: React.RefObject<SVGGElement | null>;
	legFar: React.RefObject<SVGGElement | null>;
	armNear: React.RefObject<SVGGElement | null>;
	armFar: React.RefObject<SVGGElement | null>;
}

function Woman({ dress, tool, coat, root, bend, legNear, legFar, armNear, armFar }: WomanProps) {
	const leg = (ref: React.RefObject<SVGGElement | null>, x: number, shade: number) => (
		<g transform={`translate(${x} -13)`}>
			<g ref={ref}>
				<path d='M-1.7,0 L1.7,0 L1.5,7 L-1.5,7 Z' fill='#f0e8d8' opacity={shade} />
				<path d='M-1.6,6.4 C-1.8,8.6 -1.6,10.6 -1.4,12 L1.7,12 C1.9,10.6 1.9,8.6 1.7,6.4 Z' fill='#9c2f2a' opacity={shade} />
				<path d='M-1.6,11.6 L1.7,11.6 L2.6,13 L-1.6,13 Z' fill='#5c2420' opacity={shade} />
			</g>
		</g>
	);

	const arm = (ref: React.RefObject<SVGGElement | null>, x: number, shade: number, holds: "basket" | "sickle" | "none") => (
		<g transform={`translate(${x} -25)`}>
			<g ref={ref}>
				{/* the sleeve is a shade off the body of the coat, or the whole of her
				    reads as one flat slab at this size */}
				<path d='M-1.1,0 L1.1,0 L0.95,5.8 L-0.95,5.8 Z' fill={coat ? dress.sheepskinDark : dress.blouse} opacity={shade} />
				<path
					d={coat ? "M-1,4.3 L1,4.3 L0.95,5.8 L-0.95,5.8 Z" : "M-1.08,1.3 L1.08,1.3 L1.05,2.6 L-1.05,2.6 Z"}
					fill={coat ? "#efe6d2" : dress.trim}
					opacity={shade}
				/>
				<circle cx={0} cy={6.6} r={1.15} fill='#e8b98f' opacity={shade} />
				{holds === "basket" ? (
					<g transform='translate(0 7.8)' opacity={shade}>
						<path d='M-2.4,-0.6 L2.4,-0.6 L1.9,3.4 L-1.9,3.4 Z' fill='#b08f62' />
						<path d='M-2.5,-0.9 L2.5,-0.9 L2.5,0.1 L-2.5,0.1 Z' fill='#8f7049' />
						<path d='M-1.7,-0.9 C-1.5,-2.6 1.5,-2.6 1.7,-0.9' stroke='#8f7049' strokeWidth={0.5} fill='none' />
						<path d='M-1.7,0.4 L1.7,0.4 L1.5,2 L-1.5,2 Z' fill='#e0b855' />
					</g>
				) : null}
				{holds === "sickle" ? (
					<g transform='translate(0.6 7.2) rotate(-18)' opacity={shade}>
						<path d='M-0.5,-0.8 L0.5,-0.8 L0.5,1.8 L-0.5,1.8 Z' fill='#8f7049' />
						<path d='M0.2,-1 C3.2,-1.6 5.6,-3.8 5.8,-6.8 C4.6,-4.2 2.4,-2.6 0.2,-2.2 Z' fill='#c3ccd6' />
					</g>
				) : null}
			</g>
		</g>
	);

	return (
		<g ref={root} className='critter woman' opacity={0}>
			{leg(legFar, -1.9, 0.86)}
			{leg(legNear, 1.9, 1)}
			{coat ? (
				/* a sheepskin over everything, long enough to hide the плахта */
				<>
					<path d='M0,-19.8 C3.8,-19.4 5.6,-14.4 6.8,-7.6 C3.4,-6.1 -3.4,-6.1 -6.8,-7.6 C-5.6,-14.4 -3.8,-19.4 0,-19.8 Z' fill={dress.sheepskin} />
					<path d='M-6.8,-7.6 C-3.4,-6.1 3.4,-6.1 6.8,-7.6 L6.6,-9.6 C3.3,-8.1 -3.3,-8.1 -6.6,-9.6 Z' fill={dress.sheepskinDark} />
					<path d='M-0.8,-19.6 C-0.6,-14 -0.5,-10.4 -0.6,-7.2 L0.8,-7.2 C0.7,-10.4 0.7,-14 0.9,-19.6 Z' fill={dress.sheepskinDark} />
				</>
			) : (
				<>
					{/* плахта, with the apron over the front of it */}
					<path d='M0,-19.4 C3.6,-19 5.4,-14.6 6.6,-8.2 C3.3,-6.7 -3.3,-6.7 -6.6,-8.2 C-5.4,-14.6 -3.6,-19 0,-19.4 Z' fill={dress.skirt} />
					<path d='M-6.6,-8.2 C-3.3,-6.7 3.3,-6.7 6.6,-8.2 L6.4,-10.1 C3.2,-8.6 -3.2,-8.6 -6.4,-10.1 Z' fill={dress.skirtTrim} />
					<path d='M-2.8,-18.4 C-1,-18 1,-18 2.8,-18.4 L3.4,-8.6 C1.1,-7.5 -1.1,-7.5 -3.4,-8.6 Z' fill={dress.apron} />
					<path d='M-3.36,-9.8 C-1.1,-8.7 1.1,-8.7 3.36,-9.8 L3.4,-8.6 C1.1,-7.5 -1.1,-7.5 -3.4,-8.6 Z' fill={dress.trim} />
				</>
			)}

			{/* everything above the waist bends over the work */}
			<g ref={bend}>
				{arm(armFar, -2.9, 0.86, tool === "basket" ? "basket" : "none")}
				{coat ? (
					<>
						<path d='M-3.7,-19.6 C-4.3,-23.6 -2.4,-26.6 0,-27 C2.4,-26.6 4.3,-23.6 3.7,-19.6 Z' fill={dress.sheepskin} />
						{/* the seam down the front, and the fleece turned out at the collar */}
						<path d='M-0.7,-26.6 C-0.5,-23.6 -0.5,-21.4 -0.6,-19.4 L0.7,-19.4 C0.6,-21.4 0.6,-23.6 0.8,-26.6 Z' fill={dress.sheepskinDark} />
						<path d='M-3,-25.4 C-1.6,-26.2 1.6,-26.2 3,-25.4 L2.8,-23.8 C1.5,-24.6 -1.5,-24.6 -2.8,-23.8 Z' fill='#efe6d2' />
					</>
				) : (
					<>
						<path d='M-3.5,-18.8 C-4.1,-23.4 -2.3,-26.4 0,-26.8 C2.3,-26.4 4.1,-23.4 3.5,-18.8 Z' fill={dress.blouse} />
						{/* керсетка over the вишиванка, so the sleeves stay white */}
						<path d='M-3.3,-18.8 C-3.7,-22 -2.5,-24.2 -1.3,-25.1 L1.3,-25.1 C2.5,-24.2 3.7,-22 3.3,-18.8 Z' fill={dress.bodice} />
						<path d='M-2,-25.4 C-0.7,-25.9 0.7,-25.9 2,-25.4 L2.1,-24.3 C0.7,-24.8 -0.7,-24.8 -2.1,-24.3 Z' fill={dress.trim} />
					</>
				)}

				<g transform='translate(0 -26.8)'>
					{/* her braid and the wreath's ribbons, down her back: drawn before the
					    face so her head covers where they are tied */}
					{dress.head === "wreath" && !coat ? (
						<>
							<path d='M-3,-3.6 C-4.4,-0.6 -4.2,3.4 -3.2,5.6 L-1.5,5 C-2.4,2.8 -2.6,-0.4 -2,-2.8 Z' fill={dress.hair} />
							<path d='M-3.4,5 L-1.6,4.4 L-1.2,6.2 L-3,6.8 Z' fill={dress.trim} />
							<path d='M-3.4,-4.6 C-4.2,-1.6 -4.3,1.6 -3.8,4 L-2.9,3.8 C-3.3,1.4 -3.2,-1.6 -2.5,-4.2 Z' fill='#c0392b' />
							<path d='M-2.6,-5.2 C-3.4,-2.4 -3.5,0.4 -3,2.6 L-2.1,2.4 C-2.5,0.2 -2.4,-2.4 -1.7,-4.8 Z' fill='#3d7bb8' />
						</>
					) : null}
					<circle cx={0} cy={-3.2} r={3} fill='#e8b98f' />
					{dress.head === "wreath" && !coat ? (
						<>
							<path d='M-3,-3.8 C-2.6,-7 2.6,-7.2 3,-3.8 C1,-5 -1,-5 -3,-3.8 Z' fill={dress.hair} />
							{WREATH.map((flower) => (
								<circle key={flower.x} cx={flower.x} cy={flower.y} r={0.85} fill={flower.fill} />
							))}
						</>
					) : (
						/* a хустка over her hair: it wraps the crown and the back of her head
						   and is knotted under the chin, leaving her face open to the front */
						<>
							<path
								d='M0,-7.9 C2.5,-7.9 3.6,-5.8 3.4,-3.1 C3.3,-1.4 2.7,0 1.6,0.9 L0.4,-0.3 C1.4,-1.2 1.8,-2.6 1.7,-4.1 C1,-4.9 -0.6,-5.1 -2,-4.5 C-2.6,-3.3 -2.7,-1.7 -2.4,-0.3 L-3.4,0.7 C-3.8,-0.9 -3.9,-3.1 -3.5,-4.6 C-3.1,-6.6 -1.8,-7.9 0,-7.9 Z'
								fill={dress.scarf}
							/>
							<path d='M-0.3,0.3 L1.3,-0.5 L2.5,1 L0.6,1.8 Z' fill={dress.scarf} />
						</>
					)}
					<circle cx={1.6} cy={-3.2} r={0.55} fill='#2a1c14' />
					<circle cx={-1.3} cy={-2} r={0.8} fill='#e08b7a' opacity={coat ? 0.85 : 0.4} />
					<circle cx={2} cy={-2} r={0.8} fill='#e08b7a' opacity={coat ? 0.85 : 0.4} />
				</g>
				{arm(armNear, 2.9, 1, tool === "sickle" ? "sickle" : "none")}
			</g>
		</g>
	);
}

/* --- where they are, hour by hour ---

   Spring, summer and autumn are written against the field: the ground is its near
   edge and `d` is how far up the plot they have gone. Winter is written against the
   meadow the хати stand on, the way the revellers' walk is. */

const fieldGround = () => FIELD.nearY;
/* smaller the further up the plot they are */
const upField = (base: number) => (at: { d: number }) => base * (1 + at.d / 400);

/* they come out from behind the near хата and go back the same way */
const DOOR_X = 1274;

const SOWING: [Waypoint<WorkMode>[], Waypoint<WorkMode>[]] = [
	[
		{ f: 0, x: DOOR_X, d: -20, mode: "hidden" },
		{ f: 0.1, x: DOOR_X, d: -20, mode: "walk" },
		{ f: 0.15, x: 1194, d: -10, mode: "walk" },
		{ f: 0.185, x: 1128, d: -9, mode: "walk" },
		{ f: 0.205, x: 1112, d: -10, mode: "sow" },
		{ f: 0.272, x: 916, d: -12, mode: "sow" },
		{ f: 0.292, x: 912, d: -20, mode: "walk" },
		{ f: 0.36, x: 1122, d: -20, mode: "sow" },
		{ f: 0.378, x: 1126, d: -28, mode: "walk" },
		{ f: 0.444, x: 938, d: -28, mode: "sow" },
		{ f: 0.462, x: 936, d: -36, mode: "walk" },
		{ f: 0.522, x: 1104, d: -36, mode: "sow" },
		{ f: 0.55, x: 1180, d: -16, mode: "walk" },
		{ f: 0.592, x: DOOR_X, d: -20, mode: "walk" },
		{ f: 0.606, x: DOOR_X, d: -20, mode: "hidden" },
		{ f: 1, x: DOOR_X, d: -20, mode: "hidden" },
	],
	[
		{ f: 0, x: DOOR_X, d: -20, mode: "hidden" },
		{ f: 0.108, x: DOOR_X, d: -20, mode: "walk" },
		{ f: 0.158, x: 1190, d: -14, mode: "walk" },
		{ f: 0.194, x: 1120, d: -16, mode: "walk" },
		{ f: 0.214, x: 1104, d: -17, mode: "sow" },
		{ f: 0.282, x: 926, d: -19, mode: "sow" },
		{ f: 0.302, x: 922, d: -26, mode: "walk" },
		{ f: 0.37, x: 1112, d: -26, mode: "sow" },
		{ f: 0.388, x: 1116, d: -34, mode: "walk" },
		{ f: 0.454, x: 948, d: -34, mode: "sow" },
		{ f: 0.472, x: 946, d: -41, mode: "walk" },
		{ f: 0.53, x: 1092, d: -41, mode: "sow" },
		{ f: 0.558, x: 1176, d: -18, mode: "walk" },
		{ f: 0.598, x: DOOR_X, d: -20, mode: "walk" },
		{ f: 0.612, x: DOOR_X, d: -20, mode: "hidden" },
		{ f: 1, x: DOOR_X, d: -20, mode: "hidden" },
	],
];

/* summer: up to the plot to weed it, working along the margin below the crop */
const TENDING: [Waypoint<WorkMode>[], Waypoint<WorkMode>[]] = [
	[
		{ f: 0, x: DOOR_X, d: -20, mode: "hidden" },
		{ f: 0.1, x: DOOR_X, d: -20, mode: "walk" },
		{ f: 0.15, x: 1190, d: -9, mode: "walk" },
		{ f: 0.19, x: 1096, d: -10, mode: "walk" },
		{ f: 0.21, x: 1092, d: -10, mode: "tend" },
		{ f: 0.28, x: 1092, d: -10, mode: "tend" },
		{ f: 0.3, x: 1092, d: -10, mode: "walk" },
		{ f: 0.34, x: 1008, d: -11, mode: "walk" },
		{ f: 0.36, x: 1004, d: -11, mode: "tend" },
		{ f: 0.43, x: 1004, d: -11, mode: "tend" },
		{ f: 0.45, x: 1004, d: -11, mode: "walk" },
		{ f: 0.49, x: 930, d: -12, mode: "walk" },
		{ f: 0.51, x: 926, d: -12, mode: "tend" },
		{ f: 0.55, x: 926, d: -12, mode: "tend" },
		{ f: 0.566, x: 926, d: -12, mode: "walk" },
		{ f: 0.63, x: 1190, d: -12, mode: "walk" },
		{ f: 0.664, x: DOOR_X, d: -20, mode: "walk" },
		{ f: 0.678, x: DOOR_X, d: -20, mode: "hidden" },
		{ f: 1, x: DOOR_X, d: -20, mode: "hidden" },
	],
	[
		{ f: 0, x: DOOR_X, d: -20, mode: "hidden" },
		{ f: 0.108, x: DOOR_X, d: -20, mode: "walk" },
		{ f: 0.158, x: 1186, d: -6, mode: "walk" },
		{ f: 0.198, x: 1062, d: -7, mode: "walk" },
		{ f: 0.218, x: 1058, d: -7, mode: "tend" },
		{ f: 0.29, x: 1058, d: -7, mode: "tend" },
		{ f: 0.31, x: 1058, d: -7, mode: "walk" },
		{ f: 0.35, x: 976, d: -8, mode: "walk" },
		{ f: 0.37, x: 972, d: -8, mode: "tend" },
		{ f: 0.44, x: 972, d: -8, mode: "tend" },
		{ f: 0.46, x: 972, d: -8, mode: "walk" },
		{ f: 0.5, x: 898, d: -9, mode: "walk" },
		{ f: 0.52, x: 894, d: -9, mode: "tend" },
		{ f: 0.558, x: 894, d: -9, mode: "tend" },
		{ f: 0.574, x: 894, d: -9, mode: "walk" },
		{ f: 0.638, x: 1186, d: -10, mode: "walk" },
		{ f: 0.67, x: DOOR_X, d: -20, mode: "walk" },
		{ f: 0.684, x: DOOR_X, d: -20, mode: "hidden" },
		{ f: 1, x: DOOR_X, d: -20, mode: "hidden" },
	],
];

/* Autumn: the mower takes the crop right to left, a band at a time, and the two of
   them follow one band behind him binding what he has laid down. Both routes are
   built from the same schedule the field cuts itself on, so nobody is ever bending
   over wheat that is still standing. */
const BAND = fieldRow(FIELD.cropFrom);
const bandX = (band: number) => BAND.from + ((BAND.to - BAND.from) * (band + 0.5)) / BANDS;

const MOWING: Waypoint<WorkMode>[] = [
	{ f: 0, x: DOOR_X, d: -20, mode: "hidden" },
	{ f: 0.094, x: DOOR_X, d: -20, mode: "walk" },
	{ f: 0.148, x: bandX(BANDS - 1) + 26, d: -13, mode: "walk" },
	...Array.from({ length: BANDS }, (_, i) => {
		const band = BANDS - 1 - i;
		return { f: mownAt(band), x: bandX(band), d: -13 - (band % 2), mode: "mow" as const };
	}),
	{ f: mownAt(0) + 0.03, x: bandX(0) - 18, d: -13, mode: "mow" },
	{ f: mownAt(0) + 0.06, x: bandX(0) - 18, d: -13, mode: "stand" },
	{ f: 0.55, x: bandX(3), d: -12, mode: "walk" },
	{ f: 0.61, x: 1190, d: -13, mode: "walk" },
	{ f: 0.646, x: DOOR_X, d: -20, mode: "walk" },
	{ f: 0.66, x: DOOR_X, d: -20, mode: "hidden" },
	{ f: 1, x: DOOR_X, d: -20, mode: "hidden" },
];

const binding = (lag: number, depth: number, drift: number): Waypoint<WorkMode>[] => [
	{ f: 0, x: DOOR_X, d: -20, mode: "hidden" },
	{ f: 0.104 + lag * 0.2, x: DOOR_X, d: -20, mode: "walk" },
	{ f: mownAt(BANDS - 1) + lag - 0.03, x: bandX(BANDS - 1) + 30, d: depth, mode: "walk" },
	...Array.from({ length: BANDS }, (_, i) => {
		const band = BANDS - 1 - i;
		return { f: mownAt(band) + lag, x: bandX(band) + drift, d: depth - (band % 2), mode: "bind" as const };
	}),
	{ f: mownAt(0) + lag + 0.04, x: bandX(0) + drift, d: depth, mode: "stand" },
	{ f: 0.57, x: bandX(3), d: depth, mode: "walk" },
	{ f: 0.624, x: 1188, d: depth - 2, mode: "walk" },
	{ f: 0.656, x: DOOR_X, d: -20, mode: "walk" },
	{ f: 0.67, x: DOOR_X, d: -20, mode: "hidden" },
	{ f: 1, x: DOOR_X, d: -20, mode: "hidden" },
];

const BINDING: [Waypoint<WorkMode>[], Waypoint<WorkMode>[]] = [binding(BIND_LAG, -7, 4), binding(BIND_LAG + 0.012, -10, 22)];

/* winter: nothing to do up there, so it is only from one хата to the other */
const VISITING: [Waypoint<WorkMode>[], Waypoint<WorkMode>[]] = [
	[
		{ f: 0, x: 1266, d: -22, mode: "hidden" },
		{ f: 0.12, x: 1266, d: -22, mode: "walk" },
		{ f: 0.2, x: 1400, d: -19, mode: "walk" },
		{ f: 0.244, x: 1484, d: -18, mode: "walk" },
		{ f: 0.27, x: 1484, d: -18, mode: "stand" },
		{ f: 0.42, x: 1484, d: -18, mode: "stand" },
		{ f: 0.47, x: 1380, d: -20, mode: "walk" },
		{ f: 0.54, x: 1266, d: -22, mode: "walk" },
		{ f: 0.556, x: 1266, d: -22, mode: "hidden" },
		{ f: 1, x: 1266, d: -22, mode: "hidden" },
	],
	[
		{ f: 0, x: 1254, d: -25, mode: "hidden" },
		{ f: 0.128, x: 1254, d: -25, mode: "walk" },
		{ f: 0.208, x: 1392, d: -22, mode: "walk" },
		{ f: 0.252, x: 1470, d: -21, mode: "walk" },
		{ f: 0.278, x: 1470, d: -21, mode: "stand" },
		{ f: 0.428, x: 1470, d: -21, mode: "stand" },
		{ f: 0.478, x: 1370, d: -23, mode: "walk" },
		{ f: 0.548, x: 1254, d: -25, mode: "walk" },
		{ f: 0.564, x: 1254, d: -25, mode: "hidden" },
		{ f: 1, x: 1254, d: -25, mode: "hidden" },
	],
];

interface WorkerProps {
	route: Waypoint<WorkMode>[];
	dress: Dress;
	tool: "basket" | "sickle" | "none";
	season: Season;
	ground: (x: number) => number;
	/* how fast she gets through the work, so the two of them are never in step */
	tempo: number;
	from: number;
	to: number;
}

function Worker({ route, dress, tool, season, ground, tempo, from, to }: WorkerProps) {
	const root = useRef<SVGGElement>(null);
	const bend = useRef<SVGGElement>(null);
	const legNear = useRef<SVGGElement>(null);
	const legFar = useRef<SVGGElement>(null);
	const armNear = useRef<SVGGElement>(null);
	const armFar = useRef<SVGGElement>(null);
	const heading = useRef<1 | -1>(-1);
	const winter = season === "winter";

	useCycleFrame((f, seconds) => {
		const at = onRoute(route, f);
		if (!at || at.mode === "hidden") {
			show(root, 0);
			return;
		}
		const { x, d, mode } = at;
		if (Math.abs(at.dx) > 0.05) heading.current = at.dx > 0 ? 1 : -1;
		show(root, presence(f, from, to, 0.005));

		const beat = seconds * tempo;
		let stoop = 0;
		let lift = 0;
		let legs: [number, number];
		let arms: [number, number];
		switch (mode) {
			case "walk": {
				const step = Math.sin(beat * 1.3 * TAU);
				legs = [step * 16, -step * 16];
				arms = [-step * 15, step * 15];
				lift = (Math.cos(beat * 2.6 * TAU) - 1) * 0.3;
				break;
			}
			case "sow": {
				/* a slow pace, and one wide throw of the arm to every other step */
				const step = Math.sin(beat * 0.85 * TAU);
				const cast = Math.sin(beat * 0.85 * TAU - 0.9);
				legs = [step * 11, -step * 11];
				arms = [-64 + cast * 62, 6];
				stoop = 5;
				break;
			}
			case "tend": {
				/* bent over the rows, working down one and up the next */
				const reach = Math.sin(beat * 0.55 * TAU);
				stoop = 46 + reach * 9;
				legs = [6, -7];
				arms = [-96 - reach * 16, -34];
				break;
			}
			case "bind": {
				/* down after an armful of what he has cut, and up again with it */
				const gather = Math.sin(beat * 0.5 * TAU);
				stoop = 52 + gather * 13;
				legs = [8, -9];
				arms = [-104 - gather * 24, -92 - gather * 20];
				break;
			}
			default: {
				const idle = Math.sin(beat * 0.3 * TAU);
				legs = [3, -4];
				arms = [-9 + idle * 5, 8 - idle * 4];
				stoop = idle * 2;
			}
		}
		const s = winter ? 0.86 : upField(0.86)(at);
		set(root, `translate(${x.toFixed(1)} ${(ground(x) + d + lift).toFixed(1)}) scale(${(heading.current * s).toFixed(3)} ${s.toFixed(3)})`);
		set(bend, `rotate(${stoop.toFixed(1)} 0 -19)`);
		set(legNear, `rotate(${legs[0].toFixed(1)})`);
		set(legFar, `rotate(${legs[1].toFixed(1)})`);
		set(armNear, `rotate(${arms[0].toFixed(1)})`);
		set(armFar, `rotate(${arms[1].toFixed(1)})`);
	});

	return (
		<Woman dress={dress} tool={tool} coat={winter} root={root} bend={bend} legNear={legNear} legFar={legFar} armNear={armNear} armFar={armFar} />
	);
}

const ROUTES: Record<Season, [Waypoint<WorkMode>[], Waypoint<WorkMode>[]]> = {
	spring: SOWING,
	summer: TENDING,
	autumn: BINDING,
	winter: VISITING,
};

const TOOLS: Record<Season, "basket" | "sickle" | "none"> = {
	spring: "basket",
	summer: "none",
	autumn: "none",
	winter: "none",
};

/* --- the mower ---

   He works ahead of them with a scythe: a slow wind-up and then one quick stroke
   through the standing crop, over and over, stepping on a little with each. The
   blade sweeps round in the plane of the ground, which from the side is mostly a
   matter of it reaching out and drawing back in again — so the stroke is a small
   rotation of the arms and a large stretch of the snath, not a big swing of it. */
function Mower({
	root,
	bend,
	legNear,
	legFar,
	swing,
	sweep,
}: {
	root: React.RefObject<SVGGElement | null>;
	bend: React.RefObject<SVGGElement | null>;
	legNear: React.RefObject<SVGGElement | null>;
	legFar: React.RefObject<SVGGElement | null>;
	swing: React.RefObject<SVGGElement | null>;
	sweep: React.RefObject<SVGGElement | null>;
}) {
	const leg = (ref: React.RefObject<SVGGElement | null>, x: number, shade: number) => (
		<g transform={`translate(${x} -15)`}>
			<g ref={ref}>
				<path d='M-2,0 L2,0 L1.8,7.6 L-1.8,7.6 Z' fill='#4a5a6b' opacity={shade} />
				<path d='M-1.9,7 C-2.1,9.4 -1.9,11.6 -1.7,13 L1.9,13 C2.1,11.6 2.1,9.4 1.9,7 Z' fill='#3b2f26' opacity={shade} />
				<path d='M-1.9,12.6 L1.9,12.6 L3,14.2 L-1.9,14.2 Z' fill='#2e231d' opacity={shade} />
			</g>
		</g>
	);

	return (
		<g ref={root} className='critter mower' opacity={0}>
			{leg(legFar, -2.2, 0.86)}
			{leg(legNear, 2.2, 1)}
			<g ref={bend}>
				{/* a long linen сорочка, belted, over the trousers */}
				<path d='M-5,-15.4 C-5.8,-21 -3.2,-26.4 0,-26.9 C3.2,-26.4 5.8,-21 5,-15.4 Z' fill='#f4efe4' />
				<path d='M-4.6,-25.4 C-2.2,-26.4 2.2,-26.4 4.6,-25.4 L3.9,-23.8 C1.9,-24.6 -1.9,-24.6 -3.9,-23.8 Z' fill='#b8402f' />
				<path d='M-5.1,-18.4 C-2.4,-17.2 2.4,-17.2 5.1,-18.4 L5,-16.2 C2.4,-15 -2.4,-15 -5,-16.2 Z' fill='#7a5c38' />
				<g transform='translate(0 -26.9)'>
					<circle cx={0} cy={-3.4} r={3.2} fill='#e8b98f' />
					<circle cx={1.8} cy={-3.8} r={0.6} fill='#2a1c14' />
					<path d='M-0.6,-1.8 C0.6,-2.4 2.2,-2.2 3,-1.4 C2.5,-0.2 1.5,0.6 0.5,0.8 C1.3,-0.1 1.6,-0.8 1.3,-1.2 Z' fill='#4a3524' />
					{/* a straw бриль against the sun */}
					<path d='M-5.6,-5.2 C-3,-6.6 3,-6.6 5.6,-5.2 L5.4,-3.9 C2.8,-5.1 -2.8,-5.1 -5.4,-3.9 Z' fill='#d9b96a' />
					<path d='M-3.2,-5.4 C-2.8,-9.4 2.8,-9.4 3.2,-5.4 C1,-6.4 -1,-6.4 -3.2,-5.4 Z' fill='#e0c478' />
				</g>
				<g ref={swing}>
					{/* both arms out to the snath, a shade off the shirt so they read */}
					<path d='M-2.6,-24.2 L2.8,-24.6 L7,-18.4 L4.6,-16.8 Z' fill='#e4dcc6' />
					<path d='M1.4,-21.4 L4,-21.8 L6.6,-17.8 L4.4,-16.6 Z' fill='#d6ccb2' />
					<circle cx={5.6} cy={-17} r={1.3} fill='#e8b98f' />
					<g transform='translate(5.6 -17)'>
						<g ref={sweep}>
							{/* the snath, and the blade lying along the ground at the end of it */}
							<path d='M-1.2,-1.2 L0.6,0.2 L11,15.4 L8.6,16.4 Z' fill='#9c7a4e' />
							<path d='M9.2,15 C16.4,12.4 24.6,12.8 30.8,15.4 C24.2,14.4 16.6,15 9.4,16.3 Z' fill='#d7dee6' />
							<path d='M9.4,16.3 C16.6,15 24.2,14.4 30.8,15.4 C23.8,16 16.2,16.9 9.6,17.9 Z' fill='#8d99a6' />
							<path d='M3,5 L5.2,3.8 L6.4,6 L4.2,7.2 Z' fill='#7a5c38' />
						</g>
					</g>
				</g>
			</g>
		</g>
	);
}

function Reaper({ route, ground }: { route: Waypoint<WorkMode>[]; ground: (x: number) => number }) {
	const root = useRef<SVGGElement>(null);
	const bend = useRef<SVGGElement>(null);
	const legNear = useRef<SVGGElement>(null);
	const legFar = useRef<SVGGElement>(null);
	const swing = useRef<SVGGElement>(null);
	const sweep = useRef<SVGGElement>(null);
	const heading = useRef<1 | -1>(-1);
	const [from, to] = bounds(route);

	useCycleFrame((f, seconds) => {
		const at = onRoute(route, f);
		if (!at || at.mode === "hidden") {
			show(root, 0);
			return;
		}
		const { x, d, mode } = at;
		if (Math.abs(at.dx) > 0.05) heading.current = at.dx > 0 ? 1 : -1;
		show(root, presence(f, from, to, 0.005));

		/* every branch below sets all four */
		let stoop: number;
		let arc: number;
		let reach: number;
		let legs: [number, number];
		if (mode === "mow") {
			/* one stroke in three of the cycle, then the long swing back */
			const phase = (seconds * 0.5) % 1;
			const cutting = phase < 0.34;
			const p = ease(cutting ? phase / 0.34 : (phase - 0.34) / 0.66);
			arc = cutting ? lerp(20, -16, p) : lerp(-16, 20, p);
			reach = 0.5 + Math.sin(Math.PI * p) * (cutting ? 0.78 : 0.26);
			stoop = 20 + (cutting ? lerp(-5, 7, p) : lerp(7, -5, p));
			/* and half a step on with every stroke */
			legs = [7 + Math.sin(phase * TAU) * 7, -8 - Math.sin(phase * TAU) * 6];
		} else if (mode === "walk") {
			const step = Math.sin(seconds * 1.3 * TAU);
			legs = [step * 17, -step * 17];
			arc = -30;
			reach = 0.46;
			stoop = 2;
		} else {
			legs = [4, -5];
			arc = -34;
			reach = 0.4;
			stoop = 3;
		}
		const s = upField(0.9)(at);
		set(root, `translate(${x.toFixed(1)} ${(ground(x) + d).toFixed(1)}) scale(${(heading.current * s).toFixed(3)} ${s.toFixed(3)})`);
		set(bend, `rotate(${stoop.toFixed(1)} 0 -17)`);
		set(legNear, `rotate(${legs[0].toFixed(1)})`);
		set(legFar, `rotate(${legs[1].toFixed(1)})`);
		set(swing, `rotate(${arc.toFixed(1)} 2 -22)`);
		set(sweep, `scale(${reach.toFixed(3)} 1)`);
	});

	return <Mower root={root} bend={bend} legNear={legNear} legFar={legFar} swing={swing} sweep={sweep} />;
}

/* the stretch of the day she is out for: from when she leaves the хата to when the
   route puts her back behind it */
const bounds = (route: Waypoint<WorkMode>[]) => {
	const out = route.findIndex((point) => point.mode !== "hidden");
	const back = route.findIndex((point, index) => index > out && point.mode === "hidden");
	return [route[out].f, route[back].f] as const;
};

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
			<Worker route={first} dress={DRESSES[0]} tool={TOOLS[season]} season={season} ground={ground} tempo={1} from={fromA} to={toA} />
			<Worker route={second} dress={DRESSES[1]} tool={TOOLS[season]} season={season} ground={ground} tempo={0.88} from={fromB} to={toB} />
		</g>
	);
}
