# CV Builder Project Team

Agent definitions live in `.claude/agents/`; the rules they share live here,
in `.claude/team/`.

## Documents

| File                               | Covers                                                               |
| ---------------------------------- | -------------------------------------------------------------------- |
| [CONVENTIONS.md](CONVENTIONS.md)   | code style, TypeScript and React rules, comments, Definition of Done |
| [ARCHITECTURE.md](ARCHITECTURE.md) | target FSD structure, layers, segments, file size limits             |
| [PERMISSIONS.md](PERMISSIONS.md)   | ownership zones and the three approval levels                        |

Every agent reads all three before starting a task.

## Language

Answer the project owner in whatever language he writes in, following his lead.
Everything written to a file is in English regardless — code, comments, docs, test
names, commit messages, and these team files themselves.

## Roster

| Agent           | Role                                                               | Zone                        | Model  |
| --------------- | ------------------------------------------------------------------ | --------------------------- | ------ |
| `frontend-dev`  | FSD refactor, splitting files, features, code splitting            | `src/**/*.ts(x)`            | Opus   |
| `ui-styles`     | CSS, scene visuals, splitting `index.css`, removing costly effects | `*.css`                     | Opus   |
| `qa-engineer`   | Vitest + RTL tests, performance measurement                        | `*.test.ts(x)`, test config | Sonnet |
| `devops`        | commit gate, configs, CI/CD, build, budgets                        | infrastructure              | Sonnet |
| `code-reviewer` | reviews diffs against the rules, holds a veto                      | read-only                   | Opus   |

The team lead assigns tasks, accepts work, resolves zone overlaps, and escalates
anything that needs the owner's decision.

## How work flows

Agents work **sequentially, not in parallel**. The reason is simple: `index.css` and
the shape of `src/` are shared territory, two agents will collide there, and untangling
the conflict costs more than the parallelism saved.

One task cycle:

```
team lead assigns the task
  → agent reads the rules, does the work, runs the checks
  → report to the team lead
  → code-reviewer inspects the diff
  → blockers? back to the author
  → accepted → the team lead commits
```

The next wave does not begin until the reviewer has accepted the previous one.

## Stages

1. **Quality foundation** — `devops`. Prettier, ESLint, Vitest, husky, the commit gate,
   `ci.yml`. A broken commit becomes impossible.
2. **Safety net** — `qa-engineer`. Tests written against the current code, before any
   files move. These are what later prove the refactor broke nothing.
3. **FSD refactor** — `frontend-dev` and `ui-styles`, in three waves:
   `shared` and styles → `widgets/scene` → `entities`/`features`/`pages`.
   Each wave ends with a full check run and a review.
4. **Performance** — `frontend-dev` and `ui-styles`, measured by `qa-engineer`.
   Target: Performance ≥ 85, with no visual loss and no regression in the other scores.
5. **Consolidation** — `CLAUDE.md` brought in line with reality, `CLAUDE_STATUS.md`
   and `README.md` updated.

The order is fixed. Tests before the refactor are the only way to tell "it moved"
from "it broke".

## Three principles

**A move and a rewrite are different commits.** Mix them and review cannot separate
them, and a failing test proves nothing.

**We do not fix things on the way past.** Spotted a problem outside the task? It goes
in the report, not the diff. A sprawling diff cannot be reviewed.

**Hit a boundary — do not route around it.** Stop and ask. Partial work with an honest
account of the blocker beats complete work that broke three rules getting there.
