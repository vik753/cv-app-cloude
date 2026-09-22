/* Only the sheet itself leaves this slice. The zoom stepper, the page-count estimate and
   the quote drawn once per mount are internal — printing goes through the preview's own
   markup, so nothing outside needs a handle on them. The one handle it does take is a
   `ref` to the sheet: on a narrow screen the preview opens below the form, off screen,
   and the page scrolls it into view. */
export { ResumePreview } from "@/features/resume-preview/ui/ResumePreview";
