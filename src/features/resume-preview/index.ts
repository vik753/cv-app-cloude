/* Only the sheet itself leaves this slice. The zoom stepper, the page-count estimate and
   the quote drawn once per mount are internal — printing goes through the preview's own
   markup, so nothing outside needs a handle on them. */
export { ResumePreview } from "@/features/resume-preview/ui/ResumePreview";
