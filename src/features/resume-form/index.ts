/* The form is one component from outside, and that is the whole point: its props are the
   draft plus the store's three update actions, so the page never learns about the skill
   and language autocompletes, the react-hook-form binding, or the SectionHeading and
   Field helpers it builds its sections from. */
export { ResumeForm } from "@/features/resume-form/ui/ResumeForm";
