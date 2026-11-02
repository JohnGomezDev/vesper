---
name: Module Structure
description: Use when creating, moving, or editing any file under src/app, src/components, src/lib, or src/modules — decides where components, hooks, services, utils, types, constants, query keys, and Props belong so components and hooks stay free of business logic.
---

# Module Structure

Every file has one responsibility. Decide the destination **before** writing code; never leave a helper, constant, or type in a component or hook "for now".

## Placement table

| You are about to write                                 | Destination                                                   |
| ------------------------------------------------------ | ------------------------------------------------------------- |
| JSX / a React component                                | `modules/<module>/components/<Name>.tsx` or `src/components/` |
| A component's Props interface                          | Same component file — the only type allowed there             |
| State, effects, data-fetching orchestration            | `modules/<module>/hooks/use-<name>.ts`                        |
| A hook's input/output interface                        | `modules/<module>/types/<name>.types.ts`                      |
| A `fetch` / Open-Meteo / API call                      | `modules/<module>/services/<name>.service.ts`                 |
| A pure formatting, parsing, or derivation function     | `modules/<module>/utils/<name>.ts`                            |
| Shared values: messages, timeouts, cache times, limits | `modules/<module>/constants/<name>.constants.ts`              |
| TanStack Query keys                                    | `modules/<module>/constants/<name>.query-keys.ts`             |
| App-wide constants                                     | `src/lib/constants/<name>.constants.ts`                       |
| App-wide types                                         | `src/lib/types/<name>.types.ts`                               |
| A route, layout, or route-only shell                   | `src/app/**`                                                  |

## Hard rules

1. **Components are render-only.** They contain JSX, hook calls, event wiring, and trivial render conditions. No business logic, no API calls, no slug/date/score formatting.
2. **Never declare inside a component:** domain constants, non-Props interfaces or types, exported helpers, or duplicated copy. Move each to its file from the table.
3. **Hooks own React/state/data logic only.** A hook may keep private React state and `useMemo`/`useCallback`, but its input/output interfaces go in `types/`, its constants in `constants/`, and pure algorithms in `utils/`.
4. **Constants files contain values only.** No `interface`, no `type`, no functions.
5. **Types files contain types only.** No runtime values, no constants, no classes.
6. **One component per file.** Split skeletons, bodies, summaries, and empty states into their own files when they grow. The filename must match the component.
7. **Services never render.** They return data or throw; no JSX and no React imports.
8. **Utils are pure.** No React imports, no hooks, no side effects. A util receives everything it needs as arguments.
9. **Private implementation details may stay put.** A regex, a local magic number, or a helper type used only by one util/service can remain there unexported. The rule targets shared/domain values and public types, not algorithm internals.
10. **Props exception.** `interface IXProps` lives with component `X` and nowhere else. Hook input/output interfaces are **not** Props and must go to `types/`.
11. **Pages only route.** `src/app/**` composes server/client components; data fetching belongs in `services/`, server components in `modules/<module>/components/`, and client logic in hooks.
12. **Use the `@/` alias** for internal imports and follow the naming rules in `AGENTS.md` (`I` prefix for interfaces, `T` for type aliases, kebab-case files).

## Decision examples

```tsx
// ❌ Component file mixing responsibilities
function formatResult(result: IResult): string { ... }
const CACHE_MS = 3_600_000;
interface IUseThingResult { ... }

export function ThingCard(): React.JSX.Element { ... }
```

```text
// ✅ Split by responsibility
constants/thing.constants.ts   → CACHE_MS, user-facing messages
types/thing.types.ts           → IUseThingResult, IThingInput
utils/thing.ts                 → formatResult(), pure derivations
hooks/use-thing.ts             → state, effects, data fetching
services/thing.service.ts      → fetch calls
components/ThingCard.tsx       → JSX + hook calls; IXProps stays here
```

```ts
// ❌ Types mixed into a constants file
export type TScoreStep = { max: number; points: number };
export const SCORE_STEPS: readonly TScoreStep[] = [...];

// ✅
// types/score.types.ts
export type TScoreStep = { max: number; points: number };

// constants/score.constants.ts
import type { TScoreStep } from '@/modules/<module>/types/score.types';
export const SCORE_STEPS: readonly TScoreStep[] = [...];
```

```ts
// ❌ Hook defines its own contract
export interface IUseGpsLocationResult { ... }
const GPS_TIMEOUT_MS = 10_000;

// ✅
// types/location.types.ts → IUseGpsLocationResult
// constants/location.constants.ts → GPS_TIMEOUT_MS
```

## Self-check before finishing

- Search the components you touched for `function`, `interface`, `type`, and `const` at module scope. Only the component and its Props interface may remain.
- Search the hooks you touched for interfaces, domain constants, and pure helpers. Move anything that is not React/state logic.
- Confirm constants files contain no types and types files contain no values.
- Confirm every new file is in the folder from the placement table and uses the `@/` alias.
- Run `pnpm typecheck`, `pnpm lint`, and `npx prettier --check` before reporting the change.
