# Project Status

The current picture, not a diary. What happened and when is in `git log` and the merged
pull requests (#7–#17); this file says how things stand now, what was decided on purpose,
and what is still open. Rewrite sections when they stop being true — do not append.

_Last consolidated: 2026-09-24._

## Where things stand

- All five stages of the team's plan are done (see `.claude/team/README.md`).
- `main` holds everything up to PR #17. The consolidation pass (the dead
  `useDayNightCycle` deleted, the colour-mode fix, the print check in CI, new tests and
  small debts) is in a pull request from `dev`.
- 145 tests in 18 files, all green. `npm run print-check` 8/8.

## The app

**Entry flow.** Three states: `welcome` (the scene mounted but frozen on its first frame,
one button, no music), `scene` (animation and music, a button to the builder), `form` (the
scene unmounted entirely). The welcome's click is the user gesture browsers require
before audio, which is why it exists. `readInitialView` skips the welcome for anyone
whose draft differs from `initialResume`, and for anyone whose `resume-canvas-scene` is
`off`. The persist key alone proves nothing: the store writes it on first render.

**The scene** (`widgets/scene`). Four seasons, one per 46-second day/night cycle. Cast,
each file under `ui/`: wolf, hare, hedgehog, fox, yard dog and kennel, householder
(`critters/`); six deciduous trees, bushes, flowers, snowdrops (`flora/`, `SceneFlora`);
the хати, fence and candle light (`SceneVillage`); chimney smoke (`SceneSmoke`, in the sky
layer so short windows do not crop it); the river, fish, snag and winter ice
(`SceneRiver`); the yard children, snowman and skaters (`children/`, `SceneChildren`); the
wheat field and the folk who sow, weed, mow and bind it (`SceneField`, `field-folk/`);
the evening revellers; storks; weather. Flybys — comets, the ISS, the banner plane — sit
in a layer above the rest.

- Figures are posed by `useCycleFrame` straight into the DOM from the `.sky-day` clock.
  React renders each drawing once. Paused, each loop draws one frame and stops; SMIL
  (ripples, banner, birds, station lights) is stopped separately with `pauseAnimations()`.
- The field's cut, the mower and the binders all run off one schedule (`mownAt`,
  `BIND_LAG` in `lib/landscape.ts`), so nobody bends over standing wheat.
- `Season` and `nextSeason` live in `lib/season.ts`.

**The builder.** Form left, live preview right, stacked below 900px. Below 560px the
header keeps four controls and folds colour mode, palette, language and Clear into one
flat menu — decided by `useCompactViewport` (`COMPACT_QUERY`), not by CSS hiding, so
there are never two controls with one accessible name. A test holds that query to the
header's breakpoint in `panels.css`. On a phone, showing the preview scrolls to it when
most of it is off screen (`visibleFraction`, measured rather than a breakpoint).

**Music.** The official YouTube player (terms: visible, at least 200×200), top right,
draggable by a grip, clamped on screen on attach, on enable and on resize, `inert` while
not playing.

**Theming.** Three palettes × light/dark on `.app-shell`. Portalled menus and tooltips
render into the shell through `PortalContainerContext`, so they see the theme. The mode
follows `prefers-color-scheme` live until the switch is used; a hand choice is stored in
`resume-canvas-mode-v2` and wins from then on.

**Export** is `window.print()`. The print sheet takes the width it is given, capped at
210mm, with its own 16mm padding; menus and tooltips are hidden; the preview is forced
visible even when toggled off on screen.

## Tooling

- **Commit gate**: Prettier, ESLint (type-aware, FSD boundaries generated from one layer
  list), `tsc`, the full suite. About five seconds.
- **CI** (`ci.yml`): `check` (typecheck, lint, test, build) and `print` (the print check,
  on the runner's own Chrome). The `print` job has not yet run on GitHub.
- **`npm run print-check`**: builds, serves through `vite preview`, renders under print
  media at A4, US Letter, A4 with 10mm and with 0.5in margins, preview on and off. Fails
  on a blank sheet, horizontal or bottom overflow, or unequal side insets. Proved by
  re-injecting each historical bug and watching it fail.
- **`npm run lighthouse`**: mobile, `throttlingMethod: "devtools"`, three runs, median and
  spread. Refuses to run if port 4173 is busy, and confirms it is serving this build by
  polling the build's own content-hashed asset. `simulate` is kept only as a guard for
  Accessibility, Best Practices and SEO — it cannot see an animation's cost. Its third
  review round never happened.

## Baselines

Initial load (the welcome screen, scene frozen), mobile, devtools throttling:

| Metric                     | Value       |
| -------------------------- | ----------- |
| Total blocking time        | 0 ms        |
| Main-thread time on our JS | ~210–280 ms |
| Long tasks                 | 2–3         |
| Performance (devtools)     | 90–92       |

Regression guard, simulated: Accessibility 96, Best Practices 100, SEO 90 — none may
drop. Deployed site, desktop: 96 / 91 / 100 / 91. Bundle: one chunk, ~640 kB raw /
~200 kB gzip, deliberately unsplit.

These numbers describe the load. The running scene costs what it always did; what
changed is that it no longer runs during load or behind the form.

## Decided on purpose — not defects

- **Dark mode hides the embroidery's black thread** (contrast ~1.0–1.5:1). Left as is.
- **The buttons over the scene use the `:root` palette**, because `data-palette` lives on
  `.app-shell`, which does not exist while the scene is on screen.
- **Tooltips in dark palettes are a soft off-white** tinted per palette (`--tooltip-surface`).
- **The music card has `z-index: 3`** so the sun does not pass over it, and **below 560px
  the scene→form button sits bottom left** so the player does not cover it.
- **No frosted glass**: the form never has a scene behind it any more.
- **Stage 4 was accepted on blocking time and long tasks, not on the score.**
- **Everyone's colour mode resets to the system once.** The unversioned
  `resume-canvas-mode` was written on every load and could not tell a choice from a first
  visit, so it is ignored and removed; anyone who had picked a mode picks it again.
  Accepted by the owner.
- **The empty space under the form is gone**, confirmed by the owner after the hidden
  preview stopped holding a box.
- `.welcome-button` is `inline-block`: a flex container strips the spaces around the
  coloured brand span.

## Open

**Worth doing**

- On narrow portrait screens the landscape is cropped at the sides and the edge trees
  fall out of the view.
- `DayNightScene.tsx` is 523 lines and carries the plane's and the station's geometry,
  which `ARCHITECTURE.md` places in `assets/svg`.
- A failed photo read (`FileReader`) is silent, and nothing guards a large photo against
  the `localStorage` quota.
- Tooltip in/out animations are not switched off under `prefers-reduced-motion`.
- The README would take a GIF; recording one needs `ffmpeg`.

**Small**

- The builder's `h1` copy is an inline language ternary, not in the i18n dictionaries.
- `computeCompletion` is résumé knowledge sitting in `pages/builder/lib`.
- `src/assets/hero.png` is referenced by nothing.
- `main.tsx`, `App.test.tsx`, `setupTests.ts` and `test-utils/` sit outside every layer,
  so the boundary lint does not see them.
- `.header-menu-*` no longer needs the doubled `.palette-menu-*` classes in its markup.
- `.print-note` has no screen styling.
- Nothing guards a CSS deletion except a screenshot comparison by hand.
