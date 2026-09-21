# 📋 Project: CV Builder App — React + Tailwind + Vite

## 📖 What this is

A single-page resume builder. The left column is a form, the right is a live preview,
and behind both runs an animated day/night village scene with its own soundtrack.
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
- **Preview build:** `npm run preview`
- **Clean:** `rm -rf dist node_modules`

Node 22, npm (the lockfile is `package-lock.json`). CI uses the same.

## 🛠 Tech Stack

What is actually installed and used:

| Area         | Choice                                                                        |
| ------------ | ----------------------------------------------------------------------------- |
| Framework    | React 19 + Vite 8                                                             |
| Styling      | Tailwind CSS 4 via `@tailwindcss/vite`, plus a large hand-written `index.css` |
| Global state | Zustand 5                                                                     |
| Forms        | React Hook Form 7 + `@hookform/resolvers`                                     |
| Validation   | Zod 4                                                                         |
| Primitives   | Radix (`react-tooltip`, `react-dropdown-menu`) — wrapped by hand              |
| Icons        | `@phosphor-icons/react`                                                       |
| Tests        | Vitest 4                                                                      |

### Deliberately NOT in this project

Do not reach for these, and do not write code that assumes them:

- **No TanStack Query, no server state.** There is nothing to fetch. Persistence is
  `localStorage`.
- **No shadcn/ui.** There is no `components.json`, no `cn()`, no `clsx`, no CVA.
  `@/components/ui` holds small hand-written wrappers over Radix primitives, styled
  with plain classes. Add new ones the same way.
- **No router.** One page.
- **No `useOptimistic` / `useActionState`.** Nothing here is async enough to need them.
- **No container queries.** Layout is plain responsive, mobile-first.

Only two external network dependencies at runtime: the YouTube iframe API (scene music)
and `skillicons.dev` (skill icons). Both are optional to the app working.

## 🏗 Architecture

### Current

Flat: `src/components/`, `src/hooks/`, `src/services/`, with a root `src/index.ts` barrel.

### Target — Feature-Sliced Design

```
app / pages / widgets / features / entities / shared
```

A refactor to FSD is in progress. **Full spec, layer rules and the migration plan:
[`.claude/team/ARCHITECTURE.md`](.claude/team/ARCHITECTURE.md).** Read it before moving
any file. While the migration runs, both shapes exist — check which wave has landed
before assuming a path.

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

**The scene writes to the DOM on purpose.** `requestAnimationFrame` sets `transform`
and `opacity` attributes directly; React renders each figure once. This is a considered
performance decision, not legacy. Do not "fix" it into React state — you will lose both
the frame rate and the smoothness.

**One cycle is 46 seconds.** `CYCLE_MS` appears in `useSceneClock`, `useDayNightCycle`
and `DayNightScene`, and the CSS keyframes are authored against it. All copies must agree.

**Scene constants are tuned by eye.** `COMET_CUE_MS`, `BANNER_FONT_MIN`, `STAR_COUNT`
and their neighbours were picked to make the picture look right. They are not arbitrary
and do not get "cleaned up".

**`localStorage` keys are a contract with real users.** `resume-canvas-draft-v1`,
`resume-canvas-palette`, `resume-canvas-mode`, `resume-canvas-scene`, plus the language
key. Renaming one silently throws away someone's saved draft. Changing the draft shape
means bumping the `-v1` suffix and handling the old one.

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

Known problem, being worked on. Lighthouse: Performance **35**, Accessibility 95,
Best Practices 100, SEO 91. Target is Performance ≥ 85 **without** losing any of the
other three and without changing how the scene looks.

Main causes: the whole scene ships in the initial bundle (628 KB JS), `index.css` is
3449 lines with 52 `@keyframes`, and there are 11 `backdrop-filter` and 12 `filter`
declarations animating.

When measuring, use a clean Chrome profile — extensions distort the result badly.

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
