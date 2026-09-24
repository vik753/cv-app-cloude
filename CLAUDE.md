# 📋 Project: CV Builder App — React + Tailwind + Vite

## 📖 What this is

A single-page resume builder that opens on the scene. A first-time visitor lands on the
animated day/night village held on its first frame, with one button over it; that click
starts the animation and the soundtrack together, because browsers refuse audio before a
user gesture. From there one button opens the builder — the left column a form, the right
a live preview — and the scene is unmounted entirely while the form is on screen. A
labelled control in the header goes back to it. Anyone with a saved draft skips the
welcome and opens straight in the form.
Export is `window.print()` — there is no PDF library, print styles _are_ the export.

Fully client-side: no backend, no API, no router. Drafts, palette, mode and language
live in `localStorage`. Deployed as a static site to GitHub Pages.

The scene is the heart of the project, not decoration. Treat it accordingly.

## 🗣 Language

**Answer me in whatever language I am writing in. Write English into every file.**

Follow my lead in conversation — if I switch languages, switch with me. Explanations,
reports and discussion are in my language, not the file's.

Everything that lands on disk is English regardless: source code, identifiers, code
comments, documentation, test names, commit messages, PR descriptions, and the team's
own files under `.claude/`. No exceptions for internal notes — "nobody will read this
one" is how a codebase ends up half-translated.

User-facing product copy is a separate matter: the app ships English and Ukrainian,
and those strings live in the i18n dictionaries, not inline in components.

## 🚀 Critical Commands

- **Dev:** `npm run dev`
- **Build:** `npm run build` (runs `tsc -b` then `vite build`)
- **Type-check only:** `npm run typecheck`
- **Lint:** `npm run lint`
- **Test:** `npm run test` (Vitest)
- **Print check:** `npm run print-check` — renders the production build under print media
  at four page sizes; also a CI job
- **Measure:** `npm run lighthouse` — see Performance below
- **Preview build:** `npm run preview`
- **Clean:** `rm -rf dist node_modules`

Node 24, pinned in `.nvmrc`, npm (the lockfile is `package-lock.json`). Both workflows read
`.nvmrc`, so CI uses the same.

## 🛠 Tech Stack

What is actually installed and used:

| Area         | Choice                                                                         |
| ------------ | ------------------------------------------------------------------------------ |
| Framework    | React 19 + Vite 8                                                              |
| Styling      | Tailwind CSS 4 via `@tailwindcss/vite`, plus hand-written CSS in `app/styles/` |
| Global state | Zustand 5                                                                      |
| Forms        | React Hook Form 7 + `@hookform/resolvers`                                      |
| Validation   | Zod 4                                                                          |
| Primitives   | Radix (`react-tooltip`, `react-dropdown-menu`) — wrapped by hand               |
| Icons        | `@phosphor-icons/react`                                                        |
| Tests        | Vitest 4                                                                       |

### Deliberately NOT in this project

Do not reach for these, and do not write code that assumes them:

- **No TanStack Query, no server state.** There is nothing to fetch. Persistence is
  `localStorage`.
- **No shadcn/ui.** There is no `components.json`, no `cn()`, no `clsx`, no CVA.
  `@/shared/ui` holds small hand-written wrappers over Radix primitives, styled
  with plain classes. Add new ones the same way.
- **No router.** One page.
- **No `useOptimistic` / `useActionState`.** Nothing here is async enough to need them.
- **No container queries.** Layout is plain responsive, mobile-first.

Only two external network dependencies at runtime: the YouTube iframe API (scene music)
and `skillicons.dev` (skill icons). Both are optional to the app working.

## 🏗 Architecture

Feature-Sliced Design, migration complete:

```
app        App.tsx, providers, styles/
pages      builder/
widgets    scene/, app-footer/
features   resume-form/, resume-preview/, palette-switch/, language-switch/
entities   resume/
shared     ui/, lib/, i18n/, config/
```

Imports go downward only. A slice is reached through its `index.ts`, never by path into
its internals. **Layer rules, segment rules and the reasoning:
[`.claude/team/ARCHITECTURE.md`](.claude/team/ARCHITECTURE.md).**

### Conventions

Full code style: [`.claude/team/CONVENTIONS.md`](.claude/team/CONVENTIONS.md). Essentials:

- Functional components only, named exports: `export function Name()`. No default exports.
- Props via `interface NameProps`, not `type`.
- Absolute imports through `@/`.
- `verbatimModuleSyntax` is on — type imports **must** be `import type`, or the build fails.
- Formatting is Prettier's job: tabs, `printWidth` 120, double quotes in TS, single in JSX.
- Comments explain _why_, in `/* */`, in English. Match the density of the file you are in.

## ⚠️ Known Constraints & Gotchas

**The `.sky-day` contract.** `useSceneClock` reads the scene clock straight off a CSS
animation: `document.querySelector(".sky-day")?.getAnimations()[0]`. Rename that class,
reorder the animations declared on it, or change its duration, and the entire scene
freezes — with no TypeScript error and no failing test. Nothing else in the codebase
guards this. Touch it only deliberately.

**The `birch-gnaw` contract.** The same trap as `.sky-day`, between two components.
`Hare.tsx` gnaws the birch bark by writing opacity straight into
`document.getElementById("birch-gnaw")` — an `<ellipse>` that `SceneFlora` renders, with
`opacity={0}` as its starting state. Neither the id nor that initial zero is guarded by
anything. Drop either while editing the birch and the bark damage simply stops appearing,
with no error anywhere.

**The scene writes to the DOM on purpose.** `requestAnimationFrame` sets `transform`
and `opacity` attributes directly; React renders each figure once. This is a considered
performance decision, not legacy. Do not "fix" it into React state — you will lose both
the frame rate and the smoothness.

**One cycle is 46 seconds.** `CYCLE_MS` appears in `useSceneClock` and `DayNightScene`,
and the CSS keyframes are authored against it. All copies must agree.

**Scene constants are tuned by eye.** `COMET_CUE_MS`, `BANNER_FONT_MIN`, `STAR_COUNT`
and their neighbours were picked to make the picture look right. They are not arbitrary
and do not get "cleaned up".

**`localStorage` keys are a contract with real users.** The live draft key is
`resume-canvas-draft-v2`, written by the Zustand `persist` middleware.
`resume-canvas-draft-v1` is read once, by `readLegacyDraft`, to migrate drafts written
before the shape changed. Alongside them: `resume-canvas-palette`, `resume-canvas-mode-v2`,
`resume-canvas-scene` and `resume-canvas-language`. Renaming any of them silently throws
away someone's saved work. Changing the draft shape means bumping the version suffix and
migrating the old key, not editing it in place.

`readLegacyDraft` validates the merged draft with `resumeSchema`, so that schema has
to accept whatever a half-written draft looks like. It once demanded a valid email while
`initialResume` shipped an empty one, which meant the initial state failed its own schema
and any v1 draft without an email was discarded whole. Fixed, and guarded by a test
asserting `resumeSchema.safeParse(initialResume)` succeeds. Tighten a field here and you
must check it against `initialResume`, or you reintroduce the same class of data loss.

**The palette and the mode each live in one key, and only there.** The draft blob is
narrowed to the draft by `partialize`, and `merge` takes `resume` out of it by name, so
older blobs that still carry a palette and a mode cannot override anything. `setPalette`
and `setMode` are the only writers; `readPalette` and `readChosenMode` the only readers.
A stored mode means the visitor chose it with the switch — without one the app follows
`prefers-color-scheme`, live, through `followSystemMode`, which does nothing once
`modeChosen` is true. That is why the key is `resume-canvas-mode-v2`: the unversioned
`resume-canvas-mode` was written on every load, so it recorded the first visit rather than
a choice, and it is removed on sight instead of migrated. Do not bring back a write on
mount: the moment the key is written without a choice, everyone is pinned again.

**Printing is the export.** Anything under `@media print` is load-bearing product
behaviour. Verify printing after touching layout.

**Images:** always `loading="lazy"` with explicit `width`/`height`, to avoid layout shift.
Currently honoured in all three `<img>` tags — keep it that way.

**Tailwind:** no `@apply`, except to override a third-party style.

**Type safety:** `strict: true`. No `any`, no `@ts-ignore`. `noUnusedLocals` and
`noUnusedParameters` are on, so dead variables break the build.

**Base path:** Vite builds with `base: "/cv-app-cloude/"` for GitHub Pages. Asset
references must survive that prefix — test against `npm run preview`, not just `dev`.

## ⚡ Performance

The stage opened to fix this found nothing to fix. The Performance score of **35** that
started it was measured against the dev server with browser extensions loaded: 79
unbundled `/src/` modules, 42.7 MB transferred, and 150 of the run's 266 requests coming
from an extension. Measured properly, the deployed site scores **96 / 91 / 100 / 91**.
Those four are the regression guard now — none of them may drop.

`npm run lighthouse` is the rig. It measures the production build through `preview`, never
`dev`, and refuses to run rather than measure something that is not this build.
**Do not steer by the Performance score.** A load-time score cannot see an animation that
never stops: the same build scores 92 under simulated throttling and 52 under real CPU
throttling. The acceptance metrics are blocking time, main-thread time, bootup and
long-task count, taken with `throttlingMethod: "devtools"` over three runs and reported as
a median **and a spread**. The spread is not decoration — it is what tells you whether an
improvement is real. On the old design it was what exposed blocking time as too noisy to
judge anything by: median 5,504 ms with a spread of 2,656 ms, while long-task count held
rock steady at 20.

What is genuinely expensive is the scene, and only while it is on screen. Under real CPU
throttling Lighthouse sometimes cannot compute blocking time for it at all, failing with
`NO_TTI_CPU_IDLE_PERIOD` because the main thread never goes quiet. That is not a broken
measurement; it is the problem stated precisely. Since the entry-flow redesign the scene
is unmounted whenever the form is up, so it costs nothing while anyone is working, and the
welcome screen freezes it — each animation loop draws one frame and stops.

The bundle is one chunk, about 640 kB raw and 200 kB gzipped, and stays that way
deliberately: 322 KiB transferred, blocking time 0 and TTI 1.1 s on the deployed site mean
code splitting would fix nothing. The stylesheet carries 52 `@keyframes` and two animating
`filter` declarations in `scene/weather.css`, and no `backdrop-filter` at all. The frosted-glass surfaces that used to composite over the moving scene are gone,
because the form never has a scene behind it any more.

When measuring by hand, use a clean Chrome profile and the production build. Extensions
and the dev server between them account for the whole of that 35.

## 🤖 Agent Instructions (Claude-Specific)

- **The team.** Specialised agents live in [`.claude/agents/`](.claude/agents/); their
  shared rules, zones of ownership and permission levels are in
  [`.claude/team/`](.claude/team/). Read
  [`.claude/team/PERMISSIONS.md`](.claude/team/PERMISSIONS.md) before editing anything
  you do not own.
- **Planning:** start in Plan Mode (`Shift + Tab`) for multi-file changes.
- **Refactoring:** before editing a component, check whether it belongs in a different
  layer per `ARCHITECTURE.md`.
- **Moves and rewrites are separate commits.** A file move must not change behaviour;
  otherwise a failing test proves nothing.
- **Memory:** update `CLAUDE_STATUS.md` at the end of each session.

## 🚫 What I Don't Want You to Do

- Do not add, remove or upgrade dependencies without asking me first.
- Do not fetch data in `useEffect`. (There is nothing to fetch — if that changes, we
  discuss the approach first.)
- Do not mutate Zustand state directly — use actions.
- Do not silence TypeScript with `@ts-ignore` or `any`.
- Do not delete, skip or rewrite a test to make a build pass.
- Do not commit with failing checks, and do not bypass hooks with `--no-verify`.
- Do not change how the scene looks or behaves — timings, palette, cast, animations —
  without my say-so. Cheaper is welcome; different is not.
- Do not widen the scope of a task. Spotted something else? Report it, don't fix it.

## 🚢 Deployment

GitHub Pages, via `.github/workflows/deploy.yml` on push to `main`. Build output is
`dist/`. The workflow is not to be modified without asking.

### On the Twelve Factors

[12factor.net](https://12factor.net/) was written for server-side apps with backing
services and processes. This is a static client-side bundle, so most of it does not
apply — there are no processes to scale, no ports to bind, no backing services to attach,
no admin tasks to run. What is worth honouring here:

- **[Codebase](https://12factor.net/codebase)** — one repo, one deploy target.
- **[Dependencies](https://12factor.net/dependencies)** — declared in `package.json`,
  locked in `package-lock.json`, installed with `npm ci` in CI. Never assume a global tool.
- **[Config](https://12factor.net/config)** — anything environment-specific belongs in
  Vite env vars, never hardcoded. (Today there is none beyond `base`.)
- **[Build, release, run](https://12factor.net/build-release-run)** — the build is
  reproducible and separate from serving; `dist/` is an artefact, never edited by hand.
- **[Dev/prod parity](https://12factor.net/dev-prod-parity)** — same Node version locally
  and in CI. Remember `dev` does not apply the Pages base path; `preview` does.
