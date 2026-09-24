import { createContext, useContext } from "react";

/* The node a dropdown should portal into. Radix's default is document.body, and that is
   far enough out of the tree to leave the theme behind: data-palette and data-mode sit
   on .app-shell, so a menu rendered as a child of body resolves every token to its :root
   default — in dark mode, a light panel over a dark app. Portalling into a node that is
   still inside the themed subtree is the only fix available from here; a stylesheet
   cannot reach across a portal.

   The default is null, which is what Radix's container prop already reads as
   document.body, so a menu rendered outside a provider behaves exactly as it did. */
export const PortalContainerContext = createContext<HTMLElement | null>(null);

export const usePortalContainer = () => useContext(PortalContainerContext);
