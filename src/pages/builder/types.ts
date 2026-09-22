/* The three states the entry flow moves through, in the order a first-time visitor
   meets them: the scene held on its first frame behind a single button, the scene
   running with its music, and the form with the scene switched off. */
export type BuilderView = "welcome" | "scene" | "form";

/* entities/resume publishes Palette but not the mode union, so it is spelled out here.
   One copy for the page: the toolbar and the menu it folds into both carry it. */
export type Mode = "light" | "dark";
