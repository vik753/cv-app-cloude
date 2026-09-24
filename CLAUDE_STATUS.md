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
- Added three children (`SceneChildren.tsx`) on the open grass left of the хати — two boys and their sister. One chases, one runs off and jumps, the smallest hops about; barefoot in long shirts in summer, in trousers and shoes in autumn. The girl keeps the same bell silhouette all year — a dress in the warm months, a coat cut just as wide in winter — with coloured stockings, hair down her back and a ribbon, so she reads as a girl in every season. In winter the three of them do nothing but roll a snowman, then stand round it until they are called in.
- The winter yard children now play round the finished snowman until the light goes (to ~0.57 of the cycle) instead of leaving as soon as it is built, and the skaters stay out on the ice just as long. The snowman is drawn before them so they always cross on its near side.
- Added the household's wheat field (`SceneField.tsx`, `FIELD`/`fieldRow`/`mownAt` in `services/landscape.ts`): a plot of worked land at the top of the slope, left of the хати and above the yard, with a bare margin along its near edge. Its outline is the same the year round and never straight — both edges follow a deterministic ripple, and because the two bands that meet on a boundary read the same curve, no gap ever opens between them. The headland round it carries sunflowers, shrubs and grass.
- Nothing on the plot appears from nowhere. What the women sow in spring comes up as green shoots the same afternoon; the crop stands higher and turns from green to gold across the summer day; it is mown and bound through the autumn one; and it lies bare under the snow. Height and colour are two CSS custom properties (`--grow`, `--ear-*`) set on the field once a frame, so the whole crop and the sunflowers with it grow and ripen for the cost of a few style writes rather than a per-stalk repaint. Cut bands uncover a stubble layer generated from the same rows.
- Added the folk who work the plot (`SceneFieldFolk.tsx`). The two women are in everyday folk dress — вишиванка, керсетка, плахта, apron and red boots; one in a wreath with ribbons and a braid, the other in a хустка, both in sheepskins in winter. They sow the bare plot with seed baskets all spring, walk up to weed it through the summer, bind it into sheaves in autumn, and in winter, with nothing growing, only go from one хата to the other.
- At the harvest a man goes up with them and mows ahead of them with a scythe — a slow wind-up and one quick stroke, over and over, in a straw бриль and a belted сорочка. The blade sweeps round in the plane of the ground, which from the side is mostly the snath reaching out and drawing back in, so the stroke is a small rotation of the arms and a large stretch of the scythe. He and the binders are routed off the same schedule the field cuts itself on (`mownAt`/`BIND_LAG`), so nobody is ever bending over wheat that is still standing.
- All of them are drawn in front of the field and keep to its near margin, so nothing growing is ever nearer than they are.
- Three different children come down out of the village for the ice (`ICE_LOOKS`/`SKATER_*` in `SceneChildren.tsx`): they walk down the slope in single file, left of the snowman, put their skates on at the water's edge and then scatter over the frozen river. Their routes are measured against the ice, so the walk down is a depth easing from about -145 to nothing, and `Kid` takes a `scale` function that reads that depth so they grow as they come downhill.
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
- `npx tsc -b` and `npx eslint src/components/SceneChildren.tsx` after the children work; the winter, summer and autumn yard checked in the running app with Playwright screenshots
- `npm run build`, `npx eslint` on the changed files and `npm run test` after the field work; all four seasons of the field, the women and the harvest checked in the running app with Playwright screenshots, including the figures enlarged out of the live DOM
- `npm run build`, `npx eslint src/` and `npm run test` after the growth, ragged edges, headland and mower work; the crop checked at several points of the spring, summer and autumn days, and the scythe stroke sampled across its cycle out of the live DOM

## 2026-09-21 — Agent team, quality gate, and the full FSD migration

A team of five agents now lives in `.claude/agents/`, with their shared conventions,
target architecture and permission levels in `.claude/team/`. Each owns a zone of the
tree and must ask before leaving it; the reviewer has no write access at all.

**Quality gate.** Prettier, ESLint and Vitest were missing or unenforced, so nothing
stopped broken code from landing. husky and lint-staged now run Prettier and ESLint on
staged files, then `tsc` and the full suite. Any error or warning refuses the commit;
the whole sequence takes about four seconds. ESLint runs type-aware rules, and `any`
and `@ts-ignore` are errors. A `ci.yml` runs typecheck, lint, test and build on pull
requests and pushes to `dev` and `main`. Node is pinned to 24 through `.nvmrc`, which
both workflows read.

**Tests.** 117 across 14 files, from 5. Written before the refactor and deliberately
against behaviour rather than structure, so they would survive files changing path —
which is what made the migration verifiable. Coverage is 99% on the entity's model and
81% on the scene's hooks. The scene itself is covered at contract level only: it is
driven by rAF against a CSS animation and cannot be asserted stably.

**Five real defects, found by the new tooling rather than by looking:**

1. A legacy draft without an email was discarded whole on migration. `resumeSchema`
   demanded a valid address while `initialResume` shipped an empty one, so the app's
   own blank state failed its own schema. Guarded now by a test asserting it parses.
2. React Hook Form's validation promise was dropped, surfacing rejections with no
   context.
3. `String(reader.result)` could have written `"[object ArrayBuffer]"` into a user's
   saved photo.
4. The preview's quote could change mid-session: `useMemo` is a cache, not a guarantee.
5. Four autocomplete suggestions could not resolve their own icon.

**FSD migration, complete.** `src/` has no file outside a layer. `components/`, `hooks/`
and `services/` are gone, and so is the root barrel.

|                      | before         | after                        |
| -------------------- | -------------- | ---------------------------- |
| `SceneCritters.tsx`  | 1487           | 65                           |
| `SceneFlora.tsx`     | 859            | 110                          |
| `SceneFieldFolk.tsx` | 733            | 53                           |
| `SceneChildren.tsx`  | 581            | 84                           |
| `App.tsx`            | 254            | 39 + a page slice            |
| `index.css`          | 3449, one file | 18 files under `app/styles/` |

Every wave was proved rather than assumed. Moves by rename detection at 100% similarity;
splits by multiset comparison — source lines, then numeric literals in the minified
bundle, then string literals parsed out with the TypeScript compiler. 9087 string
literals either side of the last wave, zero difference. All 117 tests passed through
every wave.

The layer rules are now enforced by the linter, generated from a layer order and a slice
list so the thirteen blocks cannot drift apart. Every rule was proved to fire against a
real violation before it landed.

**Two undocumented contracts found and written into `CLAUDE.md`:** `.sky-day`, which the
scene clock reads by selector, and `birch-gnaw`, where the hare writes opacity into an
element `SceneFlora` renders. Neither is guarded by the compiler, a test or the linter.

## Next — stage 4, performance

Lighthouse is 35 for performance against 95 / 100 / 91 for the rest. Target is 85+
without losing any of the other three and without the scene looking different.

- Measure a baseline in a clean Chrome profile first. The owner's original run was
  distorted by extensions.
- Build a capture harness for the scene at dawn, day, dusk and night **before** touching
  any CSS. There are no automated visual tests by deliberate decision, so removing an
  effect can only be checked by eye, and the comparison has to exist beforehand.
- `React.lazy` around the scene. It is now a widget with a three-export public API, so
  this is one boundary rather than a tangle of imports.
- `manualChunks` for vendor, scene and icons, paired between frontend-dev and devops —
  chunk boundaries follow the import graph, not the config.
- CSS, in cost order: `backdrop-filter` and `blur` on large always-visible surfaces
  composited over the moving scene; `box-shadow` on the transform-scaled `.print-paper`;
  the paint-triggering `fill` transitions on the season eases, which are authored
  character and need the owner rather than a perf argument.
- One rAF loop instead of one per component, paused when the tab is hidden.
- A bundle budget in CI once the numbers settle.

Backlog, unrelated to performance:

- `resumeStore` does two jobs: the draft and the appearance preferences. The standalone
  palette and mode keys are written by three places and effectively read by none,
  because `persist` has no `partialize` and `merge` lets the blob win. Fix both halves
  together or neither.
- `reader.onerror` is unhandled, so a failed photo read is silent. No size guard either,
  and a large base64 photo can exceed the `localStorage` quota.
- The builder page's `h1` copy is inline with a language ternary rather than in the i18n
  dictionaries.
- `computeCompletion` is résumé knowledge sitting in `pages/builder/lib`.
- `src/assets/hero.png` is referenced by nothing.
- `entities/resume` exports `Palette` but not `Mode`, so the header spells the union out.
- `main.tsx`, `App.test.tsx`, `setupTests.ts` and `test-utils/` sit outside every layer,
  so the boundary lint does not cover them.

## 2026-09-21 (evening) — stage 4 premise disproved, and the entry-flow redesign

**Nothing in this session is committed.** Everything below is in the working tree.
Two independent bodies of work, cleanly separable by path:
infrastructure (`.gitignore`, `.lintstagedrc.json`, `package.json`, `package-lock.json`,
`scripts/`) and the redesign (`src/**`). They must become two commits, not one.

### Performance 35 never existed

The owner re-measured with his own Lighthouse and saved both reports (now in
`artifacts/performance/`, gitignored). Same methodology in all three runs — desktop,
simulated throttling, CPU multiplier 1, DevTools panel:

|             | dev server | our `preview` | deployed site |
| ----------- | ---------- | ------------- | ------------- |
| Performance | 33         | 93            | **96**        |
| LCP         | 22.3 s     | —             | 0.9 s         |
| TBT         | 540 ms     | 80 ms         | 0 ms          |
| Transferred | 42.7 MB    | 287 KiB       | 322 KiB       |

The original 35 was `localhost:5173` — the dev server, serving 79 unbundled `/src/`
modules plus `/@vite/client` — with 150 of the run's 266 requests coming from a Grazie
browser extension. Lighthouse's own `runWarnings` said so in both of the owner's reports.
The deployed site scores **96 / 91 / 100 / 91** with extensions still loaded.

Consequence: the stage's goal ("35 → 85") was never a real target. The owner decided to
narrow stage 4 to the one thing that is genuinely expensive — the scene's sustained cost
on the main thread — and to accept it on engineering metrics rather than the Lighthouse
score. `React.lazy`, `manualChunks` and the CI bundle budget were **dropped**: at 322 KiB,
TBT 0 and TTI 1.1 s they fix nothing that is broken. The only audit not green is
`mainthread-work-breakdown` (2.9 s), of which under a third is scripting; the rest is
Style & Layout, Rendering and "Other" — the scene animating. Even that figure is inflated
by the extension's 150 requests.

### The measurement rig

`lighthouse` added as a devDependency (owner-approved), plus `chrome-launcher`
(owner-approved, declared explicitly rather than relying on npm hoisting it out of
lighthouse's tree). `npm run lighthouse` builds, serves the production build through
`vite preview` on the real base path, and writes a JSON report plus a readable summary
into `artifacts/performance/`. `npm run lighthouse -- --desktop` is a reference-only pass.
Not wired into the commit gate or CI: a full run takes minutes.

Two findings worth keeping:

**Simulated throttling cannot see this app's problem.** Same build, same mobile profile,
only `throttlingMethod` differing: `simulate` → Performance 92, TBT 80 ms; `devtools`
(real CPU throttling) → 52 and 5,060 ms. `simulate` estimates CPU cost from the network
waterfall, which is a reasonable model for a page whose cost is loading and a useless one
for a page whose cost is an animation that never stops. Acceptance runs therefore use
`devtools`; the `simulate` run is kept only as a regression guard for Accessibility, Best
Practices and SEO. Do not "fix" the rig back to the friendlier number — the summary header
explains this to whoever reads it next.

**Lighthouse sometimes cannot compute TBT for this app at all**, failing with
`NO_TTI_CPU_IDLE_PERIOD`: it waits for the main thread to go quiet and never gets it.
That is not a broken rig. It is the clearest statement of the problem we have.

**TBT is too noisy to accept on.** Three runs gave median 5,504 ms with a spread of
2,656 ms — 48% of the value, wider than any improvement we could honestly claim. Stable
by comparison: long-task count (median 20, **spread 0**), main-thread time (3%), bootup
(7%). Acceptance should lead with long-task count and main-thread time; TBT is reported
second. Printing the spread, not just the median, is what exposed this.

**The baseline has NOT been taken.** The numbers above were captured on a loaded machine
(load average 11) while two orphaned `vite preview` processes were running, and before the
rig could prove it was measuring its own build. Treat them as provisional. The real
baseline must be taken against the redesigned app, on a quiet machine.

Reviewed twice, thoroughly. Round one: four blockers, including a rig that could measure
a _stale foreign server_'s older `dist/` and report it as valid data. Round two: two
regressions introduced by the fixes — every raw bundle size printed as `NaN`, and a SIGINT
handler that called `process.exit` in the first listener, which stopped chrome-launcher's
own listener from ever running and so leaked a detached headless Chrome animating the
scene forever, on the machine whose wall-clock numbers are the acceptance metric. All
fixed and each fix proved by execution.

The server-identity fix is worth understanding before touching it: `waitForServer` polls
**this build's own content-hashed asset path**, parsed from `vite build`'s stdout, not the
bare page. A stale `dist/` cannot produce today's hash, so the check holds regardless of
timing. A pure liveness check was demonstrably foolable here.

**Open: the rig has not had its third review round.** The fixes exist; no reviewer has
signed them off. That is the first thing to do next session.

### The entry flow redesign (owner's request)

Three states replace "form with the scene running behind it forever":

1. **Welcome** — first visit only. The scene mounted but frozen on its first frame, one
   centred button, no music. The pause is load-bearing, not decorative: browsers refuse
   audio before a user gesture, and the click on this button _is_ that gesture, which is
   what lets the music start with the animation instead of silently failing.
2. **Scene** — animation and music running, a button top-left, the YouTube player moved to
   the top-right. The form is unmounted, not hidden.
3. **Form** — the scene unmounted entirely, clock and all. A labelled control in the header
   returns to state 2. The top-left button then reads "Continue" instead of
   "Start building your CV".

Returning visitors skip the welcome: it appears only when the draft still equals
`initialResume`. The persist key alone proves nothing — the store writes it on first
render. `resume-canvas-scene` keeps its old meaning, so anyone who switched the background
off opens in the form and stays there.

Dark mode no longer follows the sky (there is no sky in state 3). It follows
`prefers-color-scheme`, with the header switch overriding for the session.

**The paused scene costs nothing, and this was measured**: 17 `requestAnimationFrame`
calls in total on the welcome screen and 0 over the next three seconds, against ~2,040 per
two seconds once running. Each of the sixteen loops poses its figure once and stops — not
"never runs", which would leave the figures in the neutral positions React mounts them in
and show a jumble instead of a dawn.

Something the task brief missed and frontend-dev caught: **parts of the scene are SMIL**
(river ripples, the banner cloth, birds, the station's lights). `animation-play-state`
cannot reach SMIL, so the pause also calls `pauseAnimations()` on each `<svg>` root.
Without it the welcome frame would be half alive.

The `.sky-day` contract was verified in a browser rather than reasoned about: while paused
the selector still returns the animation, `currentTime` holds, and it advances again on
resume.

`ui-styles` landed the visual half: `app/styles/entry.css` (the three entry buttons, the
welcome layer, the ornament), `app/styles/scene/paused.css` (the freeze), and the music
card moved to the top right. CSS only; no markup was touched. Cost: +4.64 kB raw,
+1.00 kB gzip.

The freeze was proved, not assumed: two screenshots seven seconds apart on the welcome
screen differ by **0 of 1,296,000 pixels** with the rule, and by 95% without it. The
`!important` on `animation-play-state` is deliberate and explained in the file — every
scene animation uses the `animation` shorthand, which resets play-state to `running`, and
some are seasonal selectors with higher specificity than any pause selector, so a longhand
rule would lose whatever the import order.

The ornament is a masked ring rather than `border-image`, because only that lets the
shimmer be clipped to the stitches instead of sweeping over them — one effect, not two.
The motif is a 24×24 tile composed here on a 4-unit stitch grid, 90°-symmetric so one
asset serves all four sides. Colours are literals in every palette and mode. The buttons
carry their own linen surface, so the ornament never depends on the sky: verified at dawn,
noon, dusk and night, where the unstyled button had been literally invisible. Label
contrast 14.37:1; the ornament is pseudo-element content, so no screen reader announces
it; the shimmer is `display: none` under reduced motion.

**The scene itself is unchanged**, measured rather than eyeballed: 0.147–0.491% of pixels
differ across the four phases, against 0.054–0.140% between two runs of the _same_ code —
i.e. the residual is rAF-posed figures landing a frame apart, not styling.

### Open decisions for the owner

- **The frosted-glass look over the scene is now unreachable.** The form only ever renders
  with the scene off, so `.app-shell.scene-active` is dead. This follows directly from
  "the animation turns off completely"; getting it back needs a different definition of
  state 3.
- **Existing users have junk in `resume-canvas-mode`.** The old code wrote it from the sky
  phase on every load, so the stored value records what the sky happened to be doing, not
  a preference. With the sky gone, that arbitrary value is what the form opens on.

### Outstanding work

- Third review round on the rig, then commit it as its own commit.
- Six tests in `src/App.test.tsx` assert controls the redesign removed (the mountains
  toggle, the minimise dot, the badge). They are red on purpose and belong to
  `qa-engineer`; three need only a click-through-the-new-states fix, three assert removed
  behaviour. Nobody may edit a test to make a build pass.
- Dead CSS inventory exists; deletion is a **separate commit** from the new styling.
- New tests for the three states and for first-visit versus returning.
- `PERMISSIONS.md`'s zone table assigns no owner to `scripts/**` or `.gitignore`.
- Housekeeping done: two orphaned `vite preview` processes (this repo and
  `/private/tmp/cv-app-before-lazy`) were killing measurement accuracy and were killed.

### Two `ui-styles` calls left for the owner to accept or overrule

1. **The music card got `z-index: 3`.** The top right is where the sun, moon and birds fly
   on `.scene-front` (z-index 2), so without it the sun painted over the player. Side
   effect: the card's 420ms slide-out now crosses the form header instead of the footer.
2. **On screens ≤560px the top-left button moves to the bottom left.** The player is 220px
   of a 390px screen and now owns the top right; keeping both up top made the card cover
   half the button. The alternative is a ~134px button with a three-line label.

### One thing to check before the dead-CSS deletion

**All six remaining `backdrop-filter` declarations in the project live inside the dead
blocks** (five in the `.app-shell.scene-active` glass block, one on `.window-badge`).
Deleting them leaves the codebase with zero `backdrop-filter`, which makes the performance
paragraph in `CLAUDE.md` — "10 `backdrop-filter` … on large, always-visible surfaces
composited over the moving scene" — describe a code path that can no longer occur. That
paragraph needs rewriting in the same commit. The two live `filter` declarations in
`weather.css` are unaffected. Separately, `.glass-alpha-slider` was already dead at HEAD
and is not a casualty of this redesign.

The shimmer is a permanent repaint on the form screen, which previously had none: CDP
measured `TaskDuration` 0.146s over 5s against 0.003s without it (0.248s vs 0.000s on the
welcome screen). `LayoutDuration` is zero throughout — it paints, it never lays out. The
owner asked for the shimmer on all three buttons, so it was not second-guessed; making it
composited would need a real child element, i.e. markup.

## 2026-09-22 — the first trustworthy baseline, and the polish pass

Committed: the entry buttons settled after the owner looked at them (`40dc3fc`), the dead
styling deleted (`c0647d2`), `CLAUDE.md` brought in line with the performance the project
actually has (`227e0a5`).

### Baseline, taken against the new design at `227e0a5`

Mobile, `devtools` throttling, three runs, median with best-worst spread. Machine load
average 9.24, no foreign preview servers, and the rig confirmed it was serving this build
by its own content hash.

|                            | old design (provisional) | new design          |
| -------------------------- | ------------------------ | ------------------- |
| Total blocking time        | 5,504 ms (spread 2,656)  | **0 ms (spread 0)** |
| Main-thread time on our JS | 21,916 ms                | **279 ms**          |
| bootup-time                | 3,207 ms                 | **213 ms**          |
| Long tasks, count          | 20                       | **3**               |
| Long tasks, total          | 2,258 ms                 | **372 ms**          |
| Performance under devtools | 52, 52, 50               | **90, 91, 91**      |

Regression guard, mobile simulated: Performance 87 (informational), **Accessibility 96**,
Best Practices 100, SEO 90. Accessibility rose from 90 — the entry buttons carry real text
labels where the old controls carried icons.

Bundle unchanged at one chunk, 641.67 kB raw / 199.01 kB gzip, plus 71.52 kB / 15.75 kB of
CSS after the deletion.

**Read these numbers precisely.** Lighthouse measures the initial load, and the initial
load is now the welcome screen with the scene frozen. The running scene costs exactly what
it always cost; what changed is that it no longer runs during load, nor while anyone is
filling in the form. That is a real improvement for a real visitor, but "the scene got
cheaper" would be false. The old-design column is also provisional: it was captured on a
loaded machine before the rig could prove it was measuring our own build.

One thing worth keeping: `NO_TTI_CPU_IDLE_PERIOD` no longer occurs. Every run computed
blocking time, with zero spread. Lighthouse previously could not find a quiet moment on
the main thread at all, so this is independent evidence that the pause works — not just
our own count of animation frames.

### Decisions the owner made, so nobody later reads them as defects

- **In dark mode the embroidery's black thread is invisible** (contrast 1.03–1.46:1) and
  the ornament reads as a red frame rather than вишиванка. Measured, reported with three
  options, and **deliberately left as it is**. Light mode is unaffected.
- **The button over the scene cannot follow the chosen palette**, because `data-palette`
  and `data-mode` live on `.app-shell`, which does not exist while the scene is on screen.
  It always uses the `:root` defaults. Left that way on purpose; fixing it would mean
  lifting those attributes to `<html>`, which touches the whole app.
- `.welcome-button` is `inline-block`, not the shared `inline-flex`, because a flex
  container makes each text run its own item and strips the spaces around the coloured
  brand span — the label rendered with no gaps around it.

### Still open

- The rig has **never had its third review round**. The two regressions the reviewer found
  (every raw bundle size printed as `NaN`, and a SIGINT handler that leaked a detached
  headless Chrome) are fixed and the fixes are proved, but unreviewed.
- Not deployed. GitHub Pages still serves the old design; the owner has not been asked for
  a push to `main`.
- `backdrop-filter: none !important` on `.print-paper` is a cancel with nothing left to
  cancel. One line, whenever someone wants it.
- `.scene-music`'s comment still says the card sits above the badge; the badge is gone and
  the card moved to the top right.
- `.print-note` has no screen-mode styling at all now — pre-existing, not caused by the
  deletion.
- `.app-shell`'s `position`/`z-index` pair is live but unexercised: nothing stacks against
  it any more, and the scene's own z-indexes are written against it.
- Nothing guards a CSS deletion. The suite passed identically before and after 268 lines
  came out; the only real check was a screenshot comparison done by hand.

## 2026-09-22 (later) — the header on a phone

Committed: the phone header and the scroll to the preview (`dacaef6`), its styling and
two dead rules removed (`2860a98`).

Below 560px four controls stay visible — the brand, Download PDF, the preview toggle and
the embroidered button back to the scene, which keeps its ornament and loses its visible
text while keeping its accessible name — and four fold into one flat menu: colour mode,
palette, interface language and Clear. Flat rather than nested: a submenu at 390px has
nowhere to fly out to and costs a keyboard user two steps per choice. The two
arrangements are **not** both rendered with CSS hiding one, because that puts two
controls with the same accessible name in the tree, which is how an accessibility score
is quietly given back. One `matchMedia` boolean decides.

The palette and language rows are exported from their own slices and reused by the
switchers they came from, so each set of options exists once.

**The scroll to the preview is not a breakpoint.** It measures how much of the preview is
actually on screen and acts only when most of it is not. The first version used the
toolbar's 560px and therefore did nothing between 561 and 900px, where the columns have
already stacked — a feature silently dead across a 340px band. `visibleFraction` divides
the visible part by `min(panelHeight, viewportHeight)`, so a panel taller than the screen
is not judged against a height it could never reach. Beside the form it measures 1.0,
stacked below it measures 0. There is a trap recorded in the code: the switched-off
preview sits near the top of the page at `opacity: 0` and measures as 0.87 visible, so
the measurement has to wait for the entrance transition to land.

The header keeps two rows on a phone, and this was measured rather than guessed: one row
needs 445px in English and 463px in Ukrainian against a 390px viewport, and the only way
to find those 50px is to delete both text labels, including Download PDF's.

Clear's row colours its icon, not its label: the danger red is 4.56:1 resting and 4.26:1
highlighted, so as text it fails the moment anyone points at it, and no tint rescues it.
An icon answers to 3:1.

Two accessible names were wrong and are fixed: the language switcher had its group name
hardcoded in English inside the component, and Clear answered to the whole warning
sentence, which is unusable in a screen reader's list of buttons. The sentence is still
the tooltip.

### Open, and worth taking first next session

- **The settings menu never sees the palette or the mode.** It is portalled to
  `document.body`, and `data-palette`/`data-mode` live on `.app-shell`, so every token
  resolves to its `:root` value: in dark mode the phone's settings menu is a light panel
  over a dark app, measured identical in all six palette/mode combinations. This is
  pre-existing — the desktop palette dropdown has always been portalled the same way —
  but it matters far more now that this menu is the only way to reach four settings on a
  phone. **It cannot be fixed in CSS**; the portalled node has no themed ancestor. Either
  pass Radix a `container` pointing at the shell, or lift `data-mode`/`data-palette` to
  `<html>`. The second also fixes the scene button's inability to follow the palette,
  recorded earlier as a deliberate non-fix — if that decision is revisited, these two
  are one job.
- **The YouTube iframe holds the first tab stop for about three seconds after leaving the
  scene.** The music card outlives the switch by one fade, and while it is there `Tab`
  lands inside the player rather than on the toolbar — twelve presses to escape it.
- **Neither menu's open/close animation is switched off under `prefers-reduced-motion`.**
  Pre-existing, one selector list.
- **The hidden preview still occupies the layout**: with the preview off at 390px the
  document is roughly 1,300px longer than it looks, so there is a long empty scroll below
  the form. Raised with the owner, not yet decided.
- `.header-menu-*` no longer needs the doubled `.palette-menu-*` classes in the markup;
  dropping them is now a free two-file change, after which renaming the family to one
  neutral name is cosmetic.

### None of this session's product work has been reviewed

The measurement rig was reviewed twice and its fixes are still waiting on a third round.
The entry-flow redesign, the ornament, the dead-CSS deletion, the phone header and the
preview scroll have had **no** review pass at all — they were verified by their authors
in a browser, thoroughly and with numbers, and committed on that basis. That is the
honest state, and a reviewer should see them before this goes anywhere near `main`.

**Not deployed.** GitHub Pages still serves the version from before all of it.

## 2026-09-23 — the debts, and one blocker that must be fixed before `main`

### Do not merge this branch yet

**The draggable music card can end up entirely off screen.** YouTube's terms require
their player to stay visible, so this is a licence problem and not only a bug. The review
found two paths, both because the clamp only runs _during_ a gesture:

- The resize effect in `useDraggableCard.ts` is gated on `enabled`, and `cardRef`
  re-applies the stored offset on remount without clamping it. So: drag the card to the
  left edge of a wide window, open the builder, resize the window or rotate the phone,
  go back to the scene — the card mounts with a stale offset and renders outside the
  viewport with the music playing. The comment above that effect names this exact
  scenario as the reason it exists; the gate one line below is what lets it happen.
- `measureBox` can be called inside the 400ms `music-in` keyframe, where the rect is
  displaced by up to 320px, so the bounds are computed against a phantom base position.

The fix, not yet written: re-clamp when a node attaches and when `enabled` turns true, and
measure the base box from `offsetLeft`/`offsetTop` rather than from a rect a keyframe is
in the middle of moving. `frontend-dev`'s zone.

Everything else in the review was sound: no path loses a draft, `.sky-day`, `birch-gnaw`
and the three `CYCLE_MS` copies are intact, the `localStorage` keys are unchanged, and no
layer or public-API rule is broken. Two items it flagged as needing the owner's approval —
`puppeteer-core` and the edits under `.claude/team/**` — had it; that is simply not
visible from the commit history.

### Closed today

The print check (`npm run print-check`, four combinations, and it was proved by being made
to fail); `scripts/` and the dotfiles have owners; the dead `preview-entering` state, the
duplicated `Mode` union and a stale comment are gone; `visibleFraction` and `clampOffset`
are tested, 133 tests now; the portalled menus and the tooltips see the theme; an open menu
or tooltip no longer prints over the résumé; the hidden preview no longer holds a box.

**Coverage, read properly.** 63% of statements overall, but that figure is dominated by
the scene's figures, which are rAF-driven against a CSS animation and are deliberately not
unit-tested. The layers that can be tested are in good shape — `widgets/scene/lib` and
`shared/i18n` at 100%, `app` at 92% — and the real gap was the two functions written this
week, made pure and exported _specifically_ to be testable and then not tested. Both are
covered now; `visibility.ts` is at 100%.

**Tooltips.** The surface is a token: `:root` resolves it to the old inversion so light
mode is unchanged, and each dark palette overrides it with an off-white carrying its own
cast. Contrast 11.5 / 12.2 / 9.0 to one against 11px type. The owner asked for light but
not stark white, and the luminance drop is about a fifth from white.

### Open questions for the owner

- **The empty space under the form did not reproduce at the size described.** The hidden
  panel really is huge — 1,467px on an empty draft, 3,040px on a filled one, because the
  résumé rewraps to roughly a character a line in a zero-width track — but it shares a grid
  row with the form and only lengthens the document when it is _taller_ than the form
  column. On the shipped draft and on a realistic one it is not, and the document height
  does not move; only a text-heavy draft showed a saving, of 487px. The fix is right in
  mechanism and is worth keeping regardless, because it also stops the browser laying out a
  full résumé at zero width on every keystroke. But if the owner measured ~1,300px, it was
  with his own draft or at a width we did not try, and it is worth asking which.
- **`useDayNightCycle` is dead code in a public API.** Nothing calls it since the entry-flow
  redesign, yet `widgets/scene/index.ts` still exports it and the barrel's comment justifies
  it by a consumer that no longer exists. It also holds the third of the three `CYCLE_MS`
  copies, kept in sync by hand for a hook nobody calls. Deleting it needs the owner, and
  `Season`/`nextSeason` live in the same file and are imported by 17 others, so they need a
  home whose name is not a hook — a rename, and a separate commit.
- **The colour mode is pinned to whatever the system said on the first visit.** `readMode`
  consults `prefers-color-scheme` only when no key is stored, but the key is written on
  every mount. The README promises the system preference is followed until the user says
  otherwise. Fixing it means telling "seeded from the system" from "chosen by hand", which
  lands squarely in the palette/mode double-storage gotcha `CLAUDE.md` says must be fixed in
  both halves or neither.
- **`CLAUDE.md` says Node 22.** `.nvmrc`, `package.json#engines`, both workflows and the new
  README all say 24. The README is right.

### Smaller, recorded rather than fixed

- `PREVIEW_ENTER_MS = 360` is commented as "the same number layout.css transitions the
  columns over". That number no longer exists in the stylesheet — the fade replaced it with
  240ms in and 200ms out. The behaviour is accidentally still correct, because 360 > 240,
  but the real coupling is now undocumented. This is the "two copies of a number" trap, and
  it has already sprung once, silently.
- `print-audit.mjs`'s blank-page signal is `innerText`, and its comment claims that comes
  back empty for `display: none` as well as `visibility: hidden`. Only the second half is
  true: `innerText` falls back to `textContent` for an unrendered element. It does not
  weaken the check today, because print forces the preview to `display: block` and the other
  two assertions are geometric — but the comment promises a guard it does not provide.
- Tests worth having: nothing covers `DayNightScene`'s `paused` prop, and nothing walks the
  `resume-canvas-scene === "off"` entry path — the returning-visitor branch.
- `useSceneClock.test.ts` tests `lib/choreography`, not `useSceneClock`, and a comment in
  `DayNightScene.test.tsx` points readers at it for "the maths itself", which makes the
  misnomer load-bearing.
- `.app-shell[data-palette="cream"][data-mode="light"]` does not exist; cream light falls
  through to `:root`. It works, and it is why the tooltip token had to default there.
