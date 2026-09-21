/* The page is one component from outside: App renders it with the scene preference and a
   way to flip it, and nothing else crosses the line. The header, the completion maths and
   the minimize-to-a-badge window behaviour stay inside — they are composition, not API. */
export { BuilderPage } from "@/pages/builder/ui/BuilderPage";
