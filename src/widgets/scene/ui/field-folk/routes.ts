import type { Season } from "@/widgets/scene/lib/season";
import type { Waypoint } from "@/widgets/scene/lib/choreography";
import { BANDS, BIND_LAG, FIELD, fieldRow, mownAt } from "@/widgets/scene/lib/landscape";

export type WorkMode = "hidden" | "walk" | "sow" | "tend" | "bind" | "mow" | "stand";

/* --- where they are, hour by hour ---

   Spring, summer and autumn are written against the field: the ground is its near
   edge and `d` is how far up the plot they have gone. Winter is written against the
   meadow the хати stand on, the way the revellers' walk is. */

export const fieldGround = () => FIELD.nearY;
/* smaller the further up the plot they are */
export const upField = (base: number) => (at: { d: number }) => base * (1 + at.d / 400);

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

export const MOWING: Waypoint<WorkMode>[] = [
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

const BINDING: [Waypoint<WorkMode>[], Waypoint<WorkMode>[]] = [
	binding(BIND_LAG, -7, 4),
	binding(BIND_LAG + 0.012, -10, 22),
];

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

export const ROUTES: Record<Season, [Waypoint<WorkMode>[], Waypoint<WorkMode>[]]> = {
	spring: SOWING,
	summer: TENDING,
	autumn: BINDING,
	winter: VISITING,
};

export const TOOLS: Record<Season, "basket" | "sickle" | "none"> = {
	spring: "basket",
	summer: "none",
	autumn: "none",
	winter: "none",
};

/* the stretch of the day she is out for: from when she leaves the хата to when the
   route puts her back behind it */
export const bounds = (route: Waypoint<WorkMode>[]) => {
	const out = route.findIndex((point) => point.mode !== "hidden");
	const back = route.findIndex((point, index) => index > out && point.mode === "hidden");
	return [route[out].f, route[back].f] as const;
};
