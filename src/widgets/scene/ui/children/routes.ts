import type { Waypoint } from "@/widgets/scene/lib/choreography";
import { riverTopAt, upperGround } from "@/widgets/scene/lib/landscape";

export type KidMode = "hidden" | "run" | "stand" | "jump" | "glide";

/* --- out on the open grass to the left of the хати: one chases, one runs off,
   the smallest hops about --- */
export const yardGround = (x: number) => upperGround(x);

export const CHASER: Waypoint<KidMode>[] = [
	{ f: 0, x: 960, d: 16, mode: "hidden" },
	{ f: 0.13, x: 960, d: 16, mode: "run" },
	{ f: 0.176, x: 1150, d: 24, mode: "stand" },
	{ f: 0.196, x: 1150, d: 24, mode: "run" },
	{ f: 0.242, x: 980, d: 19, mode: "run" },
	{ f: 0.286, x: 1140, d: 27, mode: "stand" },
	{ f: 0.304, x: 1140, d: 27, mode: "run" },
	{ f: 0.352, x: 966, d: 18, mode: "stand" },
	{ f: 0.386, x: 966, d: 18, mode: "hidden" },
	{ f: 1, x: 966, d: 18, mode: "hidden" },
];

export const RUNAWAY: Waypoint<KidMode>[] = [
	{ f: 0, x: 1020, d: 26, mode: "hidden" },
	{ f: 0.132, x: 1020, d: 26, mode: "run" },
	{ f: 0.17, x: 1166, d: 18, mode: "run" },
	{ f: 0.214, x: 1010, d: 28, mode: "jump" },
	{ f: 0.232, x: 1010, d: 28, mode: "run" },
	{ f: 0.278, x: 1162, d: 22, mode: "run" },
	{ f: 0.33, x: 996, d: 26, mode: "run" },
	{ f: 0.364, x: 1040, d: 20, mode: "stand" },
	{ f: 0.388, x: 1040, d: 20, mode: "hidden" },
	{ f: 1, x: 1040, d: 20, mode: "hidden" },
];

export const LITTLE_ONE: Waypoint<KidMode>[] = [
	{ f: 0, x: 1086, d: 22, mode: "hidden" },
	{ f: 0.14, x: 1086, d: 22, mode: "run" },
	{ f: 0.172, x: 1014, d: 24, mode: "jump" },
	{ f: 0.19, x: 1014, d: 24, mode: "stand" },
	{ f: 0.216, x: 1014, d: 24, mode: "run" },
	{ f: 0.254, x: 1104, d: 17, mode: "jump" },
	{ f: 0.272, x: 1104, d: 17, mode: "run" },
	{ f: 0.318, x: 1046, d: 25, mode: "stand" },
	{ f: 0.348, x: 1046, d: 25, mode: "run" },
	{ f: 0.38, x: 1090, d: 21, mode: "hidden" },
	{ f: 1, x: 1090, d: 21, mode: "hidden" },
];

/* The three of them do nothing else all winter: roll the parts up, set them one on
   another, and then play round the finished thing until the light goes. They cross
   in front of it rather than behind, so they are always deeper than it is there. */
export const ROLLER_ONE: Waypoint<KidMode>[] = [
	{ f: 0, x: 1000, d: 22, mode: "hidden" },
	{ f: 0.125, x: 1000, d: 22, mode: "run" },
	{ f: 0.148, x: 1046, d: 24, mode: "stand" },
	{ f: 0.176, x: 1046, d: 24, mode: "run" },
	{ f: 0.206, x: 1006, d: 20, mode: "stand" },
	{ f: 0.224, x: 1006, d: 20, mode: "run" },
	{ f: 0.25, x: 1042, d: 26, mode: "stand" },
	{ f: 0.29, x: 1042, d: 26, mode: "run" },
	{ f: 0.318, x: 1126, d: 30, mode: "run" },
	{ f: 0.336, x: 1126, d: 30, mode: "jump" },
	{ f: 0.354, x: 1126, d: 30, mode: "run" },
	{ f: 0.39, x: 1000, d: 29, mode: "run" },
	{ f: 0.408, x: 1000, d: 29, mode: "stand" },
	{ f: 0.428, x: 1000, d: 29, mode: "run" },
	{ f: 0.456, x: 1104, d: 27, mode: "run" },
	{ f: 0.474, x: 1104, d: 27, mode: "jump" },
	{ f: 0.492, x: 1104, d: 27, mode: "run" },
	{ f: 0.522, x: 1034, d: 28, mode: "stand" },
	{ f: 0.542, x: 1034, d: 28, mode: "run" },
	{ f: 0.566, x: 986, d: 22, mode: "hidden" },
	{ f: 1, x: 986, d: 22, mode: "hidden" },
];

export const ROLLER_TWO: Waypoint<KidMode>[] = [
	{ f: 0, x: 1120, d: 26, mode: "hidden" },
	{ f: 0.128, x: 1120, d: 26, mode: "run" },
	{ f: 0.164, x: 1080, d: 21, mode: "stand" },
	{ f: 0.19, x: 1080, d: 21, mode: "run" },
	{ f: 0.214, x: 1124, d: 27, mode: "jump" },
	{ f: 0.232, x: 1124, d: 27, mode: "run" },
	{ f: 0.252, x: 1084, d: 24, mode: "stand" },
	{ f: 0.286, x: 1084, d: 24, mode: "run" },
	{ f: 0.322, x: 996, d: 27, mode: "run" },
	{ f: 0.34, x: 996, d: 27, mode: "stand" },
	{ f: 0.358, x: 996, d: 27, mode: "run" },
	{ f: 0.392, x: 1114, d: 31, mode: "run" },
	{ f: 0.41, x: 1114, d: 31, mode: "jump" },
	{ f: 0.43, x: 1114, d: 31, mode: "run" },
	{ f: 0.462, x: 1016, d: 26, mode: "run" },
	{ f: 0.486, x: 1078, d: 29, mode: "run" },
	{ f: 0.51, x: 1078, d: 29, mode: "stand" },
	{ f: 0.534, x: 1078, d: 29, mode: "run" },
	{ f: 0.562, x: 1140, d: 28, mode: "hidden" },
	{ f: 1, x: 1140, d: 28, mode: "hidden" },
];

export const ROLLER_THREE: Waypoint<KidMode>[] = [
	{ f: 0, x: 1062, d: 30, mode: "hidden" },
	{ f: 0.132, x: 1062, d: 30, mode: "run" },
	{ f: 0.158, x: 1020, d: 28, mode: "jump" },
	{ f: 0.176, x: 1020, d: 28, mode: "run" },
	{ f: 0.212, x: 1100, d: 30, mode: "stand" },
	{ f: 0.236, x: 1100, d: 30, mode: "run" },
	{ f: 0.262, x: 1014, d: 30, mode: "run" },
	{ f: 0.282, x: 1032, d: 31, mode: "stand" },
	{ f: 0.298, x: 1032, d: 31, mode: "jump" },
	{ f: 0.33, x: 1032, d: 31, mode: "run" },
	{ f: 0.362, x: 1136, d: 28, mode: "run" },
	{ f: 0.38, x: 1136, d: 28, mode: "stand" },
	{ f: 0.402, x: 1136, d: 28, mode: "run" },
	{ f: 0.438, x: 994, d: 30, mode: "run" },
	{ f: 0.456, x: 994, d: 30, mode: "jump" },
	{ f: 0.478, x: 994, d: 30, mode: "run" },
	{ f: 0.514, x: 1096, d: 32, mode: "run" },
	{ f: 0.532, x: 1096, d: 32, mode: "jump" },
	{ f: 0.552, x: 1096, d: 32, mode: "run" },
	{ f: 0.572, x: 1148, d: 27, mode: "hidden" },
	{ f: 1, x: 1148, d: 27, mode: "hidden" },
];

/* --- and three others, who come down out of the village for the ice, and stay on
   it until the light goes ---

   Their routes are measured against the frozen river, so the walk down off the
   meadow is a depth that eases from about -145 up at the хати to nothing at the
   water's edge. They shrink with it, which is what the slope looks like. */
export const iceGround = (x: number) => riverTopAt(x) + 26;

/* full size on the ice, the size of a child up in the yard when they set off */
export const downhill = (onIce: number) => (at: { d: number }) => onIce * (1 + at.d / 430);

/* They come down the slope in single file, left of the snowman the others are
   rolling, and put their skates on at the water's edge before scattering. */
export const SKATER_ONE: Waypoint<KidMode>[] = [
	{ f: 0, x: 1012, d: -136, mode: "hidden" },
	{ f: 0.242, x: 1012, d: -136, mode: "run" },
	{ f: 0.264, x: 952, d: -116, mode: "run" },
	{ f: 0.286, x: 890, d: -70, mode: "run" },
	{ f: 0.304, x: 846, d: -18, mode: "run" },
	{ f: 0.314, x: 826, d: 0, mode: "stand" },
	{ f: 0.33, x: 826, d: 0, mode: "glide" },
	{ f: 0.358, x: 440, d: -4, mode: "glide" },
	{ f: 0.39, x: 880, d: 4, mode: "glide" },
	{ f: 0.418, x: 400, d: -2, mode: "glide" },
	{ f: 0.444, x: 760, d: 3, mode: "glide" },
	{ f: 0.47, x: 300, d: -4, mode: "glide" },
	{ f: 0.5, x: 900, d: 2, mode: "glide" },
	{ f: 0.53, x: 1060, d: -2, mode: "glide" },
	{ f: 0.552, x: 1180, d: 0, mode: "hidden" },
	{ f: 1, x: 1180, d: 0, mode: "hidden" },
];

export const SKATER_TWO: Waypoint<KidMode>[] = [
	{ f: 0, x: 1006, d: -132, mode: "hidden" },
	{ f: 0.262, x: 1006, d: -132, mode: "run" },
	{ f: 0.284, x: 946, d: -114, mode: "run" },
	{ f: 0.306, x: 884, d: -66, mode: "run" },
	{ f: 0.324, x: 838, d: -14, mode: "run" },
	{ f: 0.336, x: 818, d: 3, mode: "stand" },
	{ f: 0.352, x: 818, d: 3, mode: "glide" },
	{ f: 0.378, x: 440, d: 3, mode: "glide" },
	{ f: 0.404, x: 860, d: -5, mode: "glide" },
	{ f: 0.428, x: 520, d: 2, mode: "glide" },
	{ f: 0.45, x: 220, d: 4, mode: "glide" },
	{ f: 0.478, x: 660, d: -4, mode: "glide" },
	{ f: 0.506, x: 280, d: 2, mode: "glide" },
	{ f: 0.534, x: 800, d: 3, mode: "glide" },
	{ f: 0.558, x: 1020, d: 0, mode: "hidden" },
	{ f: 1, x: 1020, d: 0, mode: "hidden" },
];

export const SKATER_THREE: Waypoint<KidMode>[] = [
	{ f: 0, x: 1020, d: -141, mode: "hidden" },
	{ f: 0.252, x: 1020, d: -141, mode: "run" },
	{ f: 0.274, x: 958, d: -120, mode: "run" },
	{ f: 0.296, x: 896, d: -72, mode: "run" },
	{ f: 0.314, x: 850, d: -16, mode: "run" },
	{ f: 0.326, x: 830, d: 6, mode: "stand" },
	{ f: 0.342, x: 830, d: 6, mode: "glide" },
	{ f: 0.372, x: 1100, d: -3, mode: "glide" },
	{ f: 0.392, x: 1100, d: -3, mode: "stand" },
	{ f: 0.416, x: 620, d: 5, mode: "glide" },
	{ f: 0.44, x: 340, d: 1, mode: "glide" },
	{ f: 0.466, x: 700, d: 5, mode: "glide" },
	{ f: 0.484, x: 700, d: 5, mode: "stand" },
	{ f: 0.512, x: 980, d: -2, mode: "glide" },
	{ f: 0.54, x: 560, d: 4, mode: "glide" },
	{ f: 0.562, x: 380, d: 1, mode: "hidden" },
	{ f: 1, x: 380, d: 1, mode: "hidden" },
];
