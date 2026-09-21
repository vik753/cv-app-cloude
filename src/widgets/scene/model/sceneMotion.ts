import { createContext, useContext } from "react";

/* Whether the scene is standing still. The welcome screen holds it on its first
   frame — browsers refuse to start audio before a user gesture, so the scene waits
   for the click that starts the music with it — and everything inside the scene has
   to honour that pause, not only the CSS animations.

   The default is "running", so a figure rendered outside the scene behaves exactly
   as it always did. */
export const ScenePausedContext = createContext(false);

export const useScenePaused = () => useContext(ScenePausedContext);
