/* The page is one component and one vocabulary from outside: App owns which of the
   three entry states is showing and hands it down, and nothing else crosses the line.
   The header, the completion maths and the welcome screen stay inside — they are
   composition, not API. */
export { BuilderPage } from "@/pages/builder/ui/BuilderPage";
export type { BuilderView } from "@/pages/builder/types";
