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
   Opened to lift a Performance score of 35 to 85; that 35 turned out to be the dev
   server with extensions loaded, and the deployed site scored 96. The stage was
   narrowed to the scene's cost on the main thread and accepted on blocking time and
   long tasks, not the score — see Performance in `CLAUDE.md`.
5. **Consolidation** — `CLAUDE.md` brought in line with reality, `CLAUDE_STATUS.md`
   and `README.md` updated.

All five are done. The order was fixed: tests before the refactor are the only way to
tell "it moved" from "it broke".

## What a task costs

A session of this team spent 399k tokens on one agent, 387k on another, and 322k on a
third. The four instruction documents together are about 14k. So the reading is not the
expense — roughly two per cent of it. These rules aim at the other ninety-eight.

**A resumed agent re-pays its entire transcript on every turn.** An agent continued for
the sixth time carries five rounds of history into each new message, so a hundred lines
of CSS can cost three hundred thousand tokens. Continue the same agent when the next
task is about the same code and its context is the reason it will do the job well.
Start a fresh one when the task is somewhere else — a new agent begins at a tenth of the
price and knows everything it needs from a good brief.

**The team lead sets the depth of verification; the agent does not invent it.** "Check it
in a browser" is an instruction a conscientious agent will honour twenty different ways,
and each screenshot costs about as much as fifteen hundred words. The brief says what
proof the task actually needs — one capture at dawn and one at night, or a contrast
figure and no pictures at all — and that is what gets done. An agent that believes the
stated depth is not enough says so and asks, rather than quietly doing more.

**Prefer a number to a picture.** A pixel-difference count, a computed style, a contrast
ratio and a measured rect are all cheap text, and all of them are better evidence than an
impression. Look at an image when the number cannot answer the question — whether
something is _beautiful_, whether a motif still reads as embroidery — and not to confirm
what the measurement already said.

**The brief names the files.** "The preview transition, `layout.css` lines 357–402" costs
nothing to write and removes an entire search. An agent hunting for the right file is
paying to rediscover what the person assigning the work already knew.

None of this is a licence to check less carefully. The thoroughness of this team is what
caught a rig reporting every bundle size as `NaN`, an exit animation that stranded a card
in mid-screen, and an embroidery pattern that vanished in dark mode. Spend the effort
where the risk is, say what you checked and why that was enough, and do not pay twice for
the same certainty.

## Three principles

**A move and a rewrite are different commits.** Mix them and review cannot separate
them, and a failing test proves nothing.

**We do not fix things on the way past.** Spotted a problem outside the task? It goes
in the report, not the diff. A sprawling diff cannot be reviewed.

**Hit a boundary — do not route around it.** Stop and ask. Partial work with an honest
account of the blocker beats complete work that broke three rules getting there.
