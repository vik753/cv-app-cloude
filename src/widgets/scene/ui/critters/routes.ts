import { BIRCH_TREE, KENNEL, LOWER_BUSH, STUMP, STUMP_SEAT, UPPER_BUSH } from "@/widgets/scene/lib/landscape";
import type { Waypoint } from "@/widgets/scene/lib/choreography";
import type { Mode, Segment } from "@/widgets/scene/ui/critters/rig";

/* The routes that are read from outside the figure that walks them: the wolf's, the
   fox's and the hare's leave prints in the snow, and the kennel has to know when the
   dog is home. The rest of the cast keeps its route in its own file. */

/* lower meadow at night: follows a scent trail in wide curves between the trees,
   slipping behind some and passing in front of others, stops to sniff the pine and
   the bush and to look around, then sits and howls at the moon, and bolts at dawn */
export const WOLF: Waypoint<Mode>[] = [
	{ f: 0, x: LOWER_BUSH.x + 4, d: 74, mode: "hidden" },
	{ f: 0.612, x: LOWER_BUSH.x + 12, d: 80, mode: "walk" },
	{ f: 0.644, x: 502, d: 90, mode: "walk" },
	{ f: 0.662, x: 548, d: 94, mode: "sniff", facing: 1 },
	{ f: 0.678, x: 548, d: 94, mode: "walk" },
	{ f: 0.708, x: STUMP.x - 22, d: 100, mode: "walk" },
	/* up onto the stump, and there he stays for most of the night */
	{ f: 0.724, x: STUMP.x - 5, d: STUMP_SEAT, mode: "sit" },
	{ f: 0.902, x: STUMP.x - 5, d: STUMP_SEAT, mode: "sit" },
	{ f: 0.922, x: STUMP.x - 24, d: 100, mode: "walk" },
	{ f: 0.968, x: LOWER_BUSH.x + 14, d: 82, mode: "walk" },
	{ f: 0.99, x: LOWER_BUSH.x + 4, d: 74, mode: "hidden" },
	{ f: 1, x: LOWER_BUSH.x + 4, d: 74, mode: "hidden" },
];

/* the same meadow by day: trots in from the right weaving between the trees,
   stops to sniff the pine, the oak and the cherry, and on the way freezes to listen
   for a mouse under the grass (or the snow), leaps and dives nose-first */
export const FOX: Waypoint<Mode>[] = [
	{ f: 0.14, x: 1700, d: 60, mode: "trot" },
	{ f: 0.15, x: 1570, d: 74, mode: "trot" },
	{ f: 0.157, x: 1480, d: 86, mode: "trot" },
	{ f: 0.165, x: 1330, d: 66, mode: "trot" },
	{ f: 0.17, x: 1266, d: 46, mode: "sniff", facing: -1 },
	{ f: 0.182, x: 1266, d: 46, mode: "trot" },
	{ f: 0.19, x: 1160, d: 90, mode: "trot" },
	{ f: 0.196, x: 1060, d: 108, mode: "trot" },
	{ f: 0.199, x: 1036, d: 104, mode: "sniff", facing: -1 },
	{ f: 0.209, x: 1036, d: 104, mode: "trot" },
	{ f: 0.217, x: 930, d: 76, mode: "trot" },
	{ f: 0.221, x: 910, d: 70, mode: "listen", facing: -1 },
	{ f: 0.235, x: 910, d: 70, mode: "crouch", facing: -1 },
	{ f: 0.241, x: 910, d: 70, mode: "pounce", facing: -1 },
	{ f: 0.253, x: 850, d: 72, mode: "dive", facing: -1 },
	{ f: 0.265, x: 850, d: 72, mode: "shake", facing: -1 },
	{ f: 0.273, x: 850, d: 72, mode: "trot" },
	{ f: 0.283, x: 740, d: 96, mode: "trot" },
	{ f: 0.295, x: 600, d: 78, mode: "trot" },
	{ f: 0.304, x: 480, d: 90, mode: "trot" },
	{ f: 0.313, x: 400, d: 88, mode: "trot" },
	{ f: 0.322, x: 300, d: 58, mode: "trot" },
	{ f: 0.332, x: 180, d: 92, mode: "trot" },
	{ f: 0.336, x: 116, d: 96, mode: "sniff", facing: -1 },
	{ f: 0.347, x: 116, d: 96, mode: "trot" },
	{ f: 0.364, x: -90, d: 70, mode: "hidden" },
];

/* upper meadow at night: bursts out of the bush, hops to the birch in stops and
   starts, gnaws its bark for most of the night and hops home before dawn */
export const HARE: Segment[] = [
	{ until: 0.614, mode: "hidden", x: [UPPER_BUSH.x + 8, UPPER_BUSH.x + 8], facing: -1 },
	{ until: 0.63, mode: "hop", x: [UPPER_BUSH.x + 8, UPPER_BUSH.x - 38], facing: -1, hops: 3 },
	{ until: 0.648, mode: "look", x: [UPPER_BUSH.x - 38, UPPER_BUSH.x - 38], facing: -1 },
	{ until: 0.664, mode: "hop", x: [UPPER_BUSH.x - 38, BIRCH_TREE.x + 14], facing: -1, hops: 3 },
	{ until: 0.858, mode: "gnaw", x: [BIRCH_TREE.x + 14, BIRCH_TREE.x + 14], facing: -1 },
	{ until: 0.872, mode: "look", x: [BIRCH_TREE.x + 14, BIRCH_TREE.x + 14], facing: 1 },
	{ until: 0.894, mode: "hop", x: [BIRCH_TREE.x + 14, UPPER_BUSH.x + 10], facing: 1, hops: 5 },
	{ until: 1, mode: "hidden", x: [UPPER_BUSH.x + 10, UPPER_BUSH.x + 10], facing: 1 },
];

/* The yard dog. Through the day it lies in its kennel with its muzzle out, then
   does the rounds of the хати, sniffing the corners; at one of them it lifts a leg,
   a slipper comes flying out of the window, and it bolts back home. At night it
   sleeps. */
export const DOG: Waypoint<Mode>[] = [
	{ f: 0, x: KENNEL.x + 4, d: 20, mode: "rest" },
	{ f: 0.16, x: KENNEL.x + 4, d: 20, mode: "walk" },
	{ f: 0.186, x: 1252, d: 24, mode: "sniff" },
	{ f: 0.212, x: 1252, d: 24, mode: "walk" },
	{ f: 0.246, x: 1404, d: 26, mode: "sniff" },
	{ f: 0.27, x: 1404, d: 26, mode: "walk" },
	{ f: 0.29, x: 1336, d: 22, mode: "mark" },
	{ f: 0.319, x: 1336, d: 22, mode: "run" },
	{ f: 0.347, x: KENNEL.x + 4, d: 20, mode: "rest" },
	{ f: 0.55, x: KENNEL.x + 4, d: 20, mode: "sleep" },
	{ f: 1, x: KENNEL.x + 4, d: 20, mode: "sleep" },
];
