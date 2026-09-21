# Permissions and Boundaries

Three levels: what an agent does on its own, what needs the team lead's approval, and
what needs the project owner's (Ihor). Levels are not skipped — the team lead cannot
grant what belongs to the owner.

## Ownership zones

Every file has one owner. Nobody edits another agent's zone; they ask the team lead.

| Zone                                                                                                             | Owner           |
| ---------------------------------------------------------------------------------------------------------------- | --------------- |
| `src/**/*.tsx`, `src/**/*.ts` (logic, components, structure)                                                     | `frontend-dev`  |
| `src/index.css`, `src/app/styles/**`, all CSS and scene visuals                                                  | `ui-styles`     |
| `**/*.test.ts(x)`, `vitest.config.ts`, test helpers and fixtures                                                 | `qa-engineer`   |
| `.github/**`, `.husky/**`, `eslint.config.js`, `.prettierrc`, `tsconfig*.json`, `vite.config.ts`, `package.json` | `devops`        |
| review — no write zone at all                                                                                    | `code-reviewer` |

Overlaps are resolved by the team lead. The common case: `frontend-dev` moves a
component and its styles need to move with it — that is a coordinated pair of tasks,
not licence to edit someone else's file.

## Allowed without asking

- Reading any file in the project.
- Editing files in your own zone, within the assigned task.
- Running `npm run typecheck`, `lint`, `test`, `build`, `dev`.
- Creating files inside your own zone as described in `ARCHITECTURE.md`.
- Reading git history: `git status`, `git diff`, `git log`.

## Requires the team lead's approval

The agent stops and asks. Not "does it and mentions it afterwards".

- Editing a file outside your zone.
- Changing another slice's public API (`index.ts`).
- Creating a layer or slice not described in `ARCHITECTURE.md`.
- Deviating from the assigned task, even when the alternative is better. A better
  solution is a reason to propose it, not a reason to quietly change the task.
- Deleting, disabling or skipping any test.
- Any `eslint-disable`, `@ts-expect-error` or `// @ts-nocheck`.
- Widening scope. "While I was in there, I also fixed…" is forbidden. We do not fix
  things on the way past.
- Any user-visible behaviour change the task did not call for.

## Requires the project owner's approval

The team lead does not grant these; the team lead escalates.

- **Adding, removing or upgrading any dependency** in `package.json`.
- `git push`, opening a PR, any merge into `main`.
- Changing the deployment parts of `.github/workflows/deploy.yml`.
- Changing `.claude/settings.json`, `.claude/agents/**`, `.claude/team/**`.
- Changing `CLAUDE.md`.
- Visible changes to the scene's look or behaviour: timings, palette, cast of
  creatures, set of animations. The scene is authored work, not a pile of divs.
- Deleting files where it is not a pure move.
- Rewriting git history: `rebase`, `reset --hard`, `push --force`.
- Any outbound network access: downloading assets, calling APIs, pulling from a CDN.

## Never allowed

There is no approval path for these. They simply are not done.

- `rm -rf`, bulk deletion, any destructive operation performed blind.
- Reading `.env` or any secret.
- Disabling or bypassing the pre-commit gate; `--no-verify`.
- Committing while checks are failing.
- Green tests achieved by editing the test instead of the code. A test bent to fit
  broken code is worse than no test: it lies.
- `any` and `@ts-ignore` in project code.
- Committing or pushing as an agent. The team lead commits; the owner pushes.

## When you hit a boundary

You hit a limit — do not route around it. Stop, and tell the team lead: what the task
was, exactly where you are stuck, what the options are, and which one you recommend.
Partial work with an honest description of the blocker is worth more than finished work
that broke three rules on the way.

## Reporting

At the end of a task every agent hands the team lead:

1. The list of changed files.
2. What was done, point by point against the task.
3. The actual output of `typecheck` / `lint` / `test` — not a paraphrase.
4. What was **not** done, and why.
5. Problems noticed outside the task's scope, as a list, with no attempt to fix them.

Items 4 and 5 are mandatory. A report without them is incomplete.
