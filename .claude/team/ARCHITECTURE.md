# Target Architecture: Feature-Sliced Design

The current structure is flat (`components/`, `hooks/`, `services/`) and does not match
what `CLAUDE.md` declares. The goal of this refactor is real FSD.

## Layers

Top to bottom; imports may only go downward:

```
app       initialisation, providers, global styles
pages     page-level composition
widgets   self-contained large UI blocks
features  user scenarios (actions)
entities  business entities and their models
shared    reusable code that knows nothing about the domain
```

**Hard rule:** `entities` knows nothing of `features`, `features` know nothing of each
other, `shared` knows nothing above itself. A layer violation is a blocking review
comment, not a matter of taste — it is precisely what turns a project back into a ball
of mud.

Horizontal imports between slices of the same layer are forbidden. If two features need
the same thing, it moves down a layer, into `entities` or `shared`.

## Segments inside a slice

```
<slice>/
  ui/          components
  model/       state, store, business logic, slice hooks
  lib/         pure utilities of the slice
  assets/      svg geometry, images
  types.ts     slice types
  index.ts     PUBLIC API — the only entry point from outside
```

`index.ts` exports only what the outside needs. Everything else is the slice's own
business and can change freely. That is the entire point of the exercise.

## Target tree

```
src/
  app/
    providers/
    styles/            tokens, base, print.css, scene/
    App.tsx
  pages/
    builder/           the resume builder page
  widgets/
    scene/             the whole day/night scene (~4500 lines today)
      ui/              SceneCritters, SceneFlora, SceneField, ...
      model/           routes, timings, useSceneClock, useDayNightCycle
      lib/             seededRandom, landscape, catmull/lerp
      assets/svg/      inline SVG geometry lifted out of the components
      types.ts index.ts
    app-header/
    app-footer/
  features/
    resume-form/
    resume-preview/
    palette-switch/
    language-switch/
    scene-toggle/
  entities/
    resume/            schema, store, types, initial data
  shared/
    ui/                tooltip, BrandLogo, SkillIcon
    lib/               shared utilities and hooks
    i18n/              copy.ts, useLanguage
    config/            constants
    types/
```

## File size limits

- A `.tsx` component: up to 200 lines. More than that means another component is
  hiding inside it.
- A model or utility file: up to 300 lines.
- SVG geometry (long `d=` strings, sets of `path`s) does not live in a file with logic.
  It moves to `assets/svg/` as data or as small primitive components.
- Types of a large slice go in `types.ts`, not interleaved with the implementation.

These are guides, not dogma. But a 1347-line file (`SceneCritters.tsx`) is not "how it
turned out" — it is the absence of a boundary.

## Migration order

Migration runs in waves, bottom-up, because the lower layers depend on nobody:

1. `shared` — utilities, i18n, UI atoms, and splitting `index.css` into `app/styles/`.
2. `widgets/scene` — the largest and riskiest piece.
3. `entities/resume` + `features/*` + `pages/builder`; `App.tsx` slims down to composition.

Each wave ends with a full check run and a review. The next wave does not start until
the previous one is accepted.

## Pure moves

Moving a file and changing its logic are **different tasks and different commits**.
A migration wave does not change behaviour: if a test fails afterwards, something broke,
and that is visible immediately. Mix a move with edits and the two become impossible
to tell apart.

## Enforcement

Layer rules are locked in by the linter (`import/no-restricted-paths` or equivalent) so
they cannot be broken by accident. Setting that up is `devops`' job, once wave 1 lands.
