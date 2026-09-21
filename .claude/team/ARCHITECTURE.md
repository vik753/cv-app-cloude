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
  config/      inert data tables the slice reads, with no logic and no state
  assets/      svg geometry, images
  types.ts     slice types
  index.ts     PUBLIC API — the only entry point from outside
```

`index.ts` exports only what the outside needs. Everything else is the slice's own
business and can change freely. That is the entire point of the exercise.

**The public API sits at the unit of encapsulation, not at a fixed depth.** For
`widgets`, `features` and `entities` that unit is the **slice**, so the barrels are
`widgets/scene/index.ts` and `entities/resume/index.ts` — never `widgets/index.ts` or
`entities/index.ts`. A layer-wide barrel would drag every slice in the layer through one
file and defeat the code splitting we need in stage 4.

`shared` is the exception, because it has segments rather than slices: its entry points
are `@/shared/ui`, `@/shared/lib` and `@/shared/i18n`, with no `shared/index.ts` above
them. Do not copy that shape upward by analogy — it is a consequence of `shared` having
no slices, not a pattern.

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
      lib/             landscape, catmull/lerp
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
      ui/              SkillIcon
  shared/
    ui/                tooltip, BrandLogo
    lib/               seededRandom, other pure utilities
    i18n/              copy.ts, useLanguage
    config/            constants
    types/
```

`SkillIcon` sits in `entities/resume`, not in `shared/ui`, and the reason is worth
stating because it is the trap this whole layer rule exists to catch. It takes a skill
_name_ and resolves it to an icon URL itself. That resolution is knowledge about
résumés, and `shared` is by definition the layer that has none. Putting it in `shared`
would mean `shared` importing from `entities` — upward through the layers — the moment
`skillIcons.ts` lands in its proper slice.

The general test: a component is not `shared` because it is small or reused. It is
`shared` because it would still make sense in a completely different product.

## File size limits

- A `.tsx` component: up to 200 lines. More than that means another component is
  hiding inside it.
- A model or utility file: up to 300 lines.
- SVG geometry follows cohesion, not line count. A file holding **one figure** keeps its
  own geometry: a wolf's `path` data belongs beside the wolf's choreography, because
  understanding the wolf means reading both. Geometry moves to `assets/svg/` only when it
  is shared between figures, or when one file carries the geometry of several unrelated
  ones — which is the actual defect in a 1477-line file holding eight animals. Splitting
  it by figure fixes that; splitting each figure again into shape-plus-motion would mean
  opening two files to understand one creature.
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
