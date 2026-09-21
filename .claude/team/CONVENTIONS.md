# Code Style and Team Conventions

Required reading for every agent. This style is derived from the existing code, not
invented: new code should be indistinguishable from the code next to it.

## Language

Answer the project owner in whatever language he writes in, following his lead.
Write English into every file — code, identifiers, comments, docs, test names, commit
messages. This includes internal team files nobody outside will read.

## Formatting

Enforced by Prettier, checked on pre-commit. Do not argue with the formatter by hand.

| Setting                  | Value                           |
| ------------------------ | ------------------------------- |
| Indentation              | tabs                            |
| `printWidth`             | 120                             |
| Quotes in TS/JS          | double                          |
| Quotes in JSX attributes | single (`jsxSingleQuote: true`) |
| Semicolons               | yes                             |
| Trailing comma           | `all`                           |
| Arrow parens             | `always`                        |

Lines over 120 characters are acceptable only where they cannot be broken — long
Tailwind class strings. That is not a reason to raise `printWidth`.

## TypeScript

- `strict: true`. `any` is forbidden. `@ts-ignore` is forbidden.
- `@ts-expect-error` only with a justifying comment on the same line, and only with
  the team lead's approval.
- `verbatimModuleSyntax` is enabled, so type imports must be `import type { X }` or
  `import { type X }`. Without it the build fails.
- `noUnusedLocals` and `noUnusedParameters` are on — dead variables break the build.
- `as` is not a tool for silencing a type error. If a type does not line up, fix the
  type, not the call site.

## React

- Function components only, named exports only: `export function ComponentName() {}`.
  No default exports, no `React.FC`.
- Props are declared with `interface ComponentNameProps`, not `type`.
- Hooks belonging to one feature live next to it, not in a shared pile.
- Data is never fetched in `useEffect`.
- Zustand state changes through actions, never by mutation.

## Naming

- Components and their files: `PascalCase.tsx`.
- Hooks: `useThing.ts`. Utilities and models: `camelCase.ts`.
- Module-level tuning constants: `SCREAMING_SNAKE_CASE` (`CYCLE_MS`, `STAR_COUNT`).
  This is an established idiom in the scene code — keep it.
- Folders: `kebab-case`.

## Imports

- Absolute only, through `@/`. Relative `../../` between layers is forbidden; relative
  imports inside a single slice are fine.
- Importing from another slice goes through its `index.ts`. Reaching into internals
  (`@/features/resume-form/ui/SkillPicker`) is forbidden.

## Comments

This project has a voice, and it should be kept. Comments here explain **why** rather
than restating the code, are written as prose in `/* */`, and usually sit above a block:

```ts
/* minimizing only makes sense with the scene behind the form and nothing beside it */
const canMinimize = sceneEnabled && !previewVisible;
```

Rules:

- Do not comment the obvious. `/* set the name */` above `setName()` is noise.
- Do comment the non-obvious reason: why this number, why this order, which external
  fact the logic depends on.
- Match the comment density of the surrounding files — no thicker, no thinner.
- When code moves, its comments move with it. Losing them is not an option: in the
  scene they carry timings and decisions recorded nowhere else.

## Tailwind and CSS

- No `@apply`, except to override a third-party style.
- Utility-first: styles live in the markup unless this is a reusable scene pattern.
- Custom CSS is `ui-styles`' territory; nobody else edits it.

## Images

- Always `loading="lazy"` with explicit `width`/`height`, or we get layout shift.

## Git

- Commit messages in English, present tense, following the project's history:
  `feat: give the household a wheat field`.
- One commit, one meaningful change. "Moved files" and "changed logic" never share a
  commit — otherwise review cannot tell them apart.
- Only the team lead commits. Agents leave their work in the working tree.

## Definition of Done

A task is not done until all of this is green:

```
npm run typecheck   # zero errors
npm run lint        # zero errors, zero warnings
npm run test        # all passing
npm run build       # builds
```

The report to the team lead must include the actual output of these commands.
"Seems to work" is not a report.
