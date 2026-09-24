/* The three states the entry flow moves through, in the order a first-time visitor
   meets them: the scene held on its first frame behind a single button, the scene
   running with its music, and the form with the scene switched off. */
export type BuilderView = "welcome" | "scene" | "form";
