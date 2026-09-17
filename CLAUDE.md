# 📋 Project: CV Builder App — React + Tailwind + Vite

## 🚀 Critical Commands

- **Dev:** `npm run dev`
- **Build/Type-check:** `npm run build` (runs tsc and vite build)
- **Lint:** `npm run lint`
- **Test:** `npm run test` (Vitest)
- **Clean:** `rm -rf dist node_modules`

## 🛠 Tech Stack

- **Framework:** React 19+ (Vite)
- **Styling:** Tailwind CSS 4 (utility-first, no custom CSS modules)
- **State:** Zustand (global), TanStack Query (server state)
- **Components:** shadcn/ui (Radix-based, located in `@/components/ui`)
- **Validation:** Zod + React Hook Form

## 🏗 Architecture

- **Methodology:** Feature-Sliced Design — `app / pages / widgets / features / entities / shared`
- **Components:** Functional only, exported as `export function Name()` (no class components)
- **Props:** Prefer `interface` over `type`
- **Hooks:** Colocate feature-specific hooks in `hooks/` within the feature folder
- **API calls:** Exclusively via TanStack Query hooks (no `useEffect` fetching)
- **Imports:** Absolute paths using `@/`
- **Reactivity:** Use `useOptimistic` for UI feedback and `useActionState` for form logic
- **Design:** Mobile-first responsive pattern; use `@container` for container queries

## 📁 Directory Structure

- `src/`
  - `components/` — components
  - `components/ui/` — shared atomic components (shadcn)
  - `hooks/` — business logic
  - `services/` — API/query logic
  - `index.ts` — clean public API for the feature

## ⚠️ Known Constraints & Gotchas

- **Images:** Always use `loading="lazy"` and explicit `width`/`height` to avoid layout shift.
- **Tailwind:** Do not use `@apply` in CSS files unless absolutely necessary for 3rd-party overrides.
- **Type Safety:** Ensure `strict: true` in `tsconfig.json`. No `any` allowed.

## 🤖 Agent Instructions (Claude-Specific)

- **Planning:** Always start in **Plan Mode** (`Shift + Tab`) for multi-file changes.
- **Refactoring:** Before editing a component, check if it should be broken down into the `features/` directory.
- **Memory:** Update `CLAUDE_STATUS.md` at the end of each session with the current progress.

## 🚫 What I Don't Want You to Do

- Do not use `useEffect` for data fetching — use TanStack Query only.
- Do not mutate Zustand state directly — use actions only.
- Do not add new dependencies without discussion.
- Do not ignore TypeScript errors using `@ts-ignore`.

## 🌐 The Twelve Factors

Reference: [12factor.net](https://12factor.net/)

1. **[Codebase](https://12factor.net/codebase)** — One codebase tracked in revision control, many deploys.
2. **[Dependencies](https://12factor.net/dependencies)** — Explicitly declare and isolate dependencies.
3. **[Config](https://12factor.net/config)** — Store config in the environment.
4. **[Backing services](https://12factor.net/backing-services)** — Treat backing services as attached resources.
5. **[Build, release, run](https://12factor.net/build-release-run)** — Strictly separate build and run stages.
6. **[Processes](https://12factor.net/processes)** — Execute the app as one or more stateless processes.
7. **[Port binding](https://12factor.net/port-binding)** — Export services via port binding.
8. **[Concurrency](https://12factor.net/concurrency)** — Scale out via the process model.
9. **[Disposability](https://12factor.net/disposability)** — Maximize robustness with fast startup and graceful shutdown.
10. **[Dev/prod parity](https://12factor.net/dev-prod-parity)** — Keep development, staging, and production as similar as possible.
11. **[Logs](https://12factor.net/logs)** — Treat logs as event streams.
12. **[Admin processes](https://12factor.net/admin-processes)** — Run admin/management tasks as one-off processes.
