type Headwear = "wreath" | "scarf";

export interface Dress {
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

export const DRESSES: [Dress, Dress] = [
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
