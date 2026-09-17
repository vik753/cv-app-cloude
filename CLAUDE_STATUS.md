# Project Status

## Completed

- Migrated the resume editor to a feature-based `src/features/resume/` structure.
- Added Zustand with persisted local resume state.
- Added Zod resume schema and React Hook Form integration.
- Migrated component styling from SCSS Modules to Tailwind CSS 4.
- Added strict TypeScript configuration.
- Added a Vitest schema test and `npm run test` script.
- Preserved English default UI and Ukrainian language switching.
- Preserved local-only draft persistence, photo upload, resume preview, and browser PDF printing.
- Added backward-compatible reading of the previous `resume-canvas-draft-v1` local draft format.
- Organized resume data, localization, model, hooks, and components into dedicated source folders.
- Removed empty legacy directories and unused Vite SVG scaffold assets.
- Simplified the source layout to `src/components`, `src/hooks`, `src/services`, and `src/index.ts` according to the updated directory strategy.
- Configured and applied absolute `@/` imports through Vite and TypeScript aliases.
- Added a print-only A4 layout that hides the editor UI, removes the preview note, and flows work entries across two columns.
- Aligned the on-screen resume preview with the print layout and increased preview typography for readability.
- Moved skills, education, and certificates above work experience and presented them as three clear summary cards.
- Reworked the summary grid so Skills spans the full width, with Education and Courses below in equal columns.
- Compactly aligned the Skills label with its badges so badges flow immediately beside it and wrap across rows.
- Centered the Work experience heading and tightened the two-column experience entries.
- Moved shared preview structure into non-print-specific layout classes so screen preview and PDF use the same grid.
- Expanded the HTML layout to full width and gave the live preview the larger desktop column for readability.
- Restored a balanced 50/50 editor-preview desktop layout and made Work experience heading span both experience columns in HTML and PDF.
- Changed experience entries to full-width blocks stacked vertically in both preview and PDF.
- Added skill-icons.dev icons for supported skills in the editor and live preview, with the existing fallback for unsupported skills.
- Added icon-based skill autocomplete with filtering, mouse selection, and keyboard navigation.
- Began the Resume Canvas split-desk redesign from the handoff: independent Blurple/Cream and light/dark themes, persisted theme controls, completion meter, zoom/page toolbar, new GitHub and LinkedIn fields, and education/courses below work experience.
- Added Phosphor React icons and responsive themed shell styling for the redesign.
- Replaced the river's dashed current markers with a caravel, a pirate ship trailing it, and a cannon whose ball splashes ahead of the caravel.
- Added drifting ripple rows clipped to the river outline, plus bow waves and stern wakes on both ships.
- Added three comets a night, each in its own band of sky and its own direction, an ISS crossing the night sky with blinking panel lights, and a daily biplane towing a banner with a random resume quote.
- Sized the banner so long quotes stretch the cloth instead of shrinking the type below a readable size.
- Moved the sun, moon, birds and all flybys into a fixed layer above the app shell so they stay visible over the form.

## Verification

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run test` after adding skill icon coverage
- `npm run typecheck` after handoff implementation
- `npm run lint` after handoff implementation
- `npm run test` after handoff implementation
- `npm run build` after handoff implementation
- `npm run build`, `npm run test`, and `npx eslint` on the changed files after the scene work

## Next

- Add stronger persistence migration/version handling for existing drafts.
- Add component and interaction tests for language switching, draft reset, skills, experience, and photo upload.
- Replace browser print export with a dedicated A4 PDF renderer when PDF layout control is required.
