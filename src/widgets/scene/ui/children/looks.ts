export type Outfit = "summer" | "autumn" | "winter";

export interface KidLook {
	shirt: string;
	trim: string;
	hair: string;
	hat?: string;
	scarf?: string;
	/* winter greatcoat; the plain tan one if a child has none of their own */
	coat?: string;
	/* she wears a dress the year round, and a ribbon in her hair */
	girl?: boolean;
	bow?: string;
}

/* the three of the homestead: two boys and their sister */
export const LOOKS: KidLook[] = [
	{ shirt: "#f7f4ec", trim: "#c0392b", hair: "#6b4a2f", hat: "#c0392b", scarf: "#3d9bd4" },
	{
		shirt: "#d4607f",
		trim: "#f7e6c8",
		hair: "#8a5a2f",
		hat: "#d4607f",
		scarf: "#f7e6c8",
		coat: "#d4607f",
		girl: true,
		bow: "#f2c14e",
	},
	{ shirt: "#faf6ea", trim: "#4f8a4a", hair: "#a8763f", hat: "#4f8a4a", scarf: "#c0392b" },
];

/* three others from further up the village, who only ever turn up for the ice */
export const ICE_LOOKS: KidLook[] = [
	{ shirt: "#eef2f7", trim: "#e0b23c", hair: "#2f2a24", hat: "#2f5d8a", scarf: "#e0b23c", coat: "#6a8fbf" },
	{ shirt: "#f4ecdc", trim: "#3f6f4a", hair: "#4a3524", hat: "#8a4b2a", scarf: "#3f6f4a", coat: "#c98a2e" },
	{ shirt: "#eef2f7", trim: "#dfe6ef", hair: "#5c4632", hat: "#9c3b2e", scarf: "#dfe6ef", coat: "#4f7a5c" },
];
