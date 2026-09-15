# 📋 Project: [Project Name] - React + Tailwind + Vite

## 🚀 Critical Commands

- **Dev:** `npm run dev`
- **Build/Type-check:** `npm run build` (runs tsc and vite build)
- **Lint:** `npm run lint`
- **Test:** `npm run test` (Vitest)
- **Clean:** `rm -rf dist node_modules`

## 🛠 Tech Stack & Architecture

- **Framework:** React 19+ (Vite)
- **Styling:** Tailwind CSS 4 (Utility-first, no custom CSS modules)
- **State:** Zustand (Global), TanStack Query (Server State)
- **Components:** shadcn/ui (Radix-based, located in `@/components/ui`)
- **Validation:** Zod + React Hook Form

## 📐 Coding Standards

- **Components:** Use functional components with `export function Name()`.
- **Props:** Prefer interface over type for props.
- **Hooks:** Colocate feature-specific hooks in `hooks/` within the feature folder.
- **Reactivity:** Use `useOptimistic` for UI feedback and `useActionState` for form logic.
- **Design:** Follow the "Mobile First" responsive pattern. Use `@container` for container queries.
- Feature-Sliced ​​Design: app / pages / widgets / features / entities / sharedю.
- Components: functional only (no class components).
- API calls: exclusively via TanStack Query hooks.
- Imports: absolute paths using `@/`

## 📁 Directory Strategy

- `src/`
  - `components/` - components
  - `components/ui/` - Shared atomic components (shadcn)
  - `hooks/` - business logic
  - `services/` - API/Query logic
  - `index.ts` - Clean public API for the feature

## ⚠️ Known Constraints & Gotchas

- **Images:** Always use `loading="lazy"` and explicit `width`/`height` to avoid layout shift.
- **Tailwind:** Do not use `@apply` in CSS files unless absolutely necessary for 3rd-party overrides.
- **Type Safety:** Ensure `strict: true` in `tsconfig.json`. No `any` allowed.

## 🤖 Agent Instructions (Claude-Specific)

- **Planning:** Always start in **Plan Mode** (`Shift + Tab`) for multi-file changes.
- **Refactoring:** Before editing a component, check if it should be broken down into the `features/` directory.
- **Memory:** Update `CLAUDE_STATUS.md` at the end of each session with the current progress.

## What I don't want you to do:

- Do not use `useEffect` for data fetching — use TanStack Query only.
- Do not mutate Zustand state directly — use actions only.
- Do not add new dependencies without discussion.
- Do not ignore TypeScript errors using `@ts-ignore`.

# The Twelve Factors:

## [I. Codebase](https://12factor.net/codebase)

### One codebase tracked in revision control, many deploys

## [II. Dependencies](https://12factor.net/dependencies)

### Explicitly declare and isolate dependencies

## [III. Config](https://12factor.net/config)

### Store config in the environment

## [IV. Backing services](https://12factor.net/backing-services)

### Treat backing services as attached resources

## [V. Build, release, run](https://12factor.net/build-release-run)

### Strictly separate build and run stages

## [VI. Processes](https://12factor.net/processes)

### Execute the app as one or more stateless processes

## [VII. Port binding](https://12factor.net/port-binding)

### Export services via port binding

## [VIII. Concurrency](https://12factor.net/concurrency)

### Scale out via the process model

## [IX. Disposability](https://12factor.net/disposability)

### Maximize robustness with fast startup and graceful shutdown

## [X. Dev/prod parity](https://12factor.net/dev-prod-parity)

### Keep development, staging, and production as similar as possible

## [XI. Logs](https://12factor.net/logs)

### Treat logs as event streams

## [XII. Admin processes](https://12factor.net/admin-processes)

### Run admin/management tasks as one-off processes
