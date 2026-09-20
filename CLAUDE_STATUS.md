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
- Renamed the app from Resume Canvas to "not boring CV" with a new `BrandLogo` SVG (a single stacked mark: lowercase "not boring" on top, the tilted page icon plus "CV" centered below), matching `public/favicon.svg` and `public/logo.svg`; localStorage keys keep the `resume-canvas-*` prefix so existing drafts survive.
- Moved the "Draft is saved automatically" indicator to the left side of the header, centered between the logo and the Download PDF button.
- Grouped the Preview toggle beside Download PDF in the header center, moved Clear to the far right, and wrapped the form in a `.form-card` (10px radius, contrasting border, soft shadow) that sits 24px below the header and scrolls at its full length inside the form column.
- Added seasons to the scene: each day+night cycle advances summer → autumn → winter → spring (`nextSeason` in `useDayNightCycle`, `data-season` on the scene layers, all visuals eased in CSS).
- Replaced several pines with six deciduous trees (`SceneFlora.tsx`): apple, birch, maple on the upper meadow; cherry, oak, rowan on the lower one, with the outer trees at the left and right edges. Fixed pines that floated in the sky or stood in the river (`<use>` scaled their positions).
- Autumn: yellow/orange crowns, leaves falling and lying under trees and across the meadows, overcast sky with storm clouds, rain showers, wind gusts carrying leaves. Winter: bare trees, snowfall with blizzard gusts, snow settling on pines/branches, white meadows. Spring: storm clouds roll away, bright sun, snow melts, snowdrops bloom evenly across all meadows (jittered grid), trees still bare (`SceneWeather.tsx`).
- Added a desktop-style minimize button (yellow dot, top-left of the form card): the header and form shrink into a "not boring CV" badge in the bottom-right corner so the scene is unobstructed; clicking the badge restores it. Only offered when the scene is on and the preview is hidden.
- Added two bushes (upper and lower meadow) that follow the seasons like the trees, and spring buds on every twig tip of trees and bushes.
- Added critters (`SceneCritters.tsx`), choreographed per day fraction and driven by one rAF loop per critter that reads the sky's CSS animation clock (no React re-renders): a wolf (night, lower meadow: comes out of the bush, walks at an unhurried pace to an old stump in the middle of the meadow, climbs up and sits on it upright with one hind leg crossed over the other, howls at the moon three times through the night, and goes back into the bush as the moon sets; drawn with two poses — on all fours and seated — sharing one head); a hare (night, upper meadow: out of the bush, hops to the birch, gnaws bark leaving a mark, back home; grey-brown → white in winter); a hedgehog (night: scurries past the hare to the apple tree, carries a fallen apple home on its spines; hibernates in winter with a "zzz" from the bush); a red fox (day, lower meadow: trots in, listens, mouse-pounces nose-first with a snow/grass puff; lean dull summer coat, thick bushy fiery winter coat).
- Apples fall from the apple tree in late summer and autumn and lie under it until the hedgehog takes one.
- Wolf and fox now follow smooth Catmull-Rom routes that weave between the lower trees, stopping to sniff trunks and the bush; each is rendered in two layers (behind/in front of the trees) and the visible copy is picked per frame by depth, so they really pass behind pines and trees.
- Winter tracks in the snow: wolf (paired prints), fox (single line + pounce crater), hare (Y-shaped hop marks); the white winter hare gets a soft blue-grey outline and a shadow so it reads against snow; revealed as each animal walks and gone at the spring thaw.
- Summer meadows: grass tufts and wildflowers (daisies, poppies, cornflowers, buttercups) planted on the shared jittered grid (`plantGrid`); grass dries to straw in autumn, hides under snow in winter, returns green after the spring thaw; flowers bloom one by one each summer.
- Moved landscape geometry (ridges, ground lines, tree/bush placements) to `src/services/landscape.ts`.
- Scene music: minimizing the form opens a small YouTube player card above the badge (official IFrame API, video CDqSj6eOEGY) and fades it in to volume 22; restoring fades it out and unmounts it (`SceneMusic.tsx`). Streaming through YouTube's player keeps no copyrighted audio in the repo and credits the artist; their terms require the player to stay visible and at least 200x200, so it is not hidden.
- Added a minimal footer: author (Ihor Korenets, vik753@gmail.com, 2026) on the left, music credit on the right (track, performer, played via YouTube, rights reserved). Track data lives in `src/services/music.ts` so the player and the credit stay in sync. Hidden when printing.
- Added a small Ukrainian homestead at the right edge of the upper meadow (`SceneVillage.tsx`): three whitewashed хати (two side by side, a third away on the skyline at the edge of the hill) under thatched roofs with dark combed eaves, small windows with curtains and a candle that lights after dark: warm-toned (the night tint flattens brightness, so warmth is what reads), with the flame, the light in the window, the halo around it the spill down the wall and a pool of light thrown out onto the grass in front of the хата (widening with perspective, screen-blended so it lightens the grass) all taking their brightness from one flame loop, guttering hard enough to see (the pool on the grass all but dies away and flares back, the window dips with it) (so the window and the pool on the grass flicker together, as one candle would light both), with the halo, the spill and the pool wavering in shape on loops of their own so the repeat never shows, painted wall flowers, plank doors, a woven wattle fence with clay jugs slipped mouth-down over the tops of the stakes, standing well down the yard and drawn from the critters layer (`HomesteadFence`) so the householder can walk behind it while the dog runs in front, chimney smoke in autumn and winter (`SceneSmoke.tsx`): drawn in the sky layer above the landscape, not inside it, because the map is cropped at the top and a rising column was cut off mid-air on short windows; positions are projected from scene coordinates and follow the viewport, and snow on the thatch in winter.
- Removed both ships (caravel, pirate ship, cannon, wakes) from the river.
- River life (`SceneRiver.tsx`): fish leap out and back through the day on a short ballistic arc (about a second in the air, level horizontal speed, nose first in whichever direction the fish faces), with a ring where each one breaks the surface, and a ring plus spray where it drops back, a snag drifts past at night, and in winter the river freezes over — a translucent lid of ice with snow along the banks, the ripples stilled beneath it and fish still moving under it.
- Added the yard dog and its kennel (`Dog`, `Kennel` in `SceneCritters.tsx`): by day it rests at home — the walking dog is hidden entirely and the kennel shows a muzzle in its doorway instead, breathing, so no legs show below the walls, does the rounds of the хати sniffing corners, lifts a leg at one, a slipper flies out of the window and it bolts home; it sleeps there at night. An original dog, not a likeness of any character.
- Added the householder (`Cossack` in `SceneCritters.tsx`), summer days only: he comes out of the near хата while the dog does its rounds, stands in front of the fence drawing on his pipe — it goes up to his mouth, he draws, takes it away, and only then does the smoke leave his mouth — walks on real legs (hips and ankles swinging, eased in and out of the stride) in trousers bloused into tall black boots, laughs when the slipper finds its mark, then turns and goes back in. Drawn from scratch in everyday folk dress — fur hat with a red crown, embroidered shirt, blue sash with hanging ends, full шаровари gathered under the knee over tall black boots — and not a likeness of anyone.
- Added three children (`SceneChildren.tsx`) on the open grass left of the хати: barefoot in long shirts in summer, in trousers and shoes in autumn; in winter they are down on the frozen river on skates in coats, hats, scarves and mittens, with red cheeks. One chases, one runs off and jumps, the smallest hops about.
- The dog was redrawn around one face — long drooping ears, a wide eye with a highlight, a broad light snout and a deeper chest — so the walking dog and the one at home are plainly the same animal. The kennel shows its whole face in the doorway — ears, wide eyes, broad snout, chin resting on its front paws — and it is bigger to make room.
- Added two neighbours (`SceneRevellers.tsx`) who wander arm in arm from one хата to the other in the evening (0.42–0.6 of the cycle), singing: notes drift up, one waves time, the other swings a bottle; the pair rolls from side to side on two slow sways with a step that never quite lands. Dressed by season — shirts in summer, coats in autumn and spring, sheepskins and hats in winter — and deliberately unlike the smoker at the fence.
- Known gap: on portrait/narrow viewports the landscape is cropped at the sides, so the edge trees can fall outside the view.
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
