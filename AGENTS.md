# AGENTS.md — Vesper

Coding conventions and rules for AI agents working on Vesper. The functional scope lives in `docs/specs/001-vesper/SPEC.md`; this document does not repeat it. This project is **a single Next.js app**. Topic-specific rules live in `.opencode/skills/` (see the **Skills** section at the end).

## Documentation

- Each spec package lives in `docs/specs/NNN-<slug>/` and contains `SPEC.md`, `PLAN.md`, and `tasks/`.
- The SPEC defines what is built and which decisions are closed. The PLAN defines implementation order and exit gates. Tasks are atomic, verifiable units derived from the plan.
- Do not create tasks before the plan is approved. Do not leave spec, plan, or task files loose at the repository root.

# Naming Conventions

- **Language**: always English in code. Spanish is allowed only in UI-facing text and copy.
- **Variables, functions, parameters, hooks**: camelCase.
- **React components**: PascalCase — one component per file, filename matches the component name.
- **Interfaces**: PascalCase with prefix `I` (e.g. `IPost`).
- **Type aliases**: PascalCase with prefix `T` (e.g. `TApiResponse<T>`).
- **Enums**: PascalCase, no prefix (e.g. `PostStatus`).
- **Custom hooks**: camelCase with prefix `use` (e.g. `useAuth`, `usePosts`).
- **TanStack Query keys**: defined as `const` arrays in a dedicated `query-keys.ts` file, camelCase (e.g. `postKeys`).
- **Folders**: kebab-case.
- **Files**:
  - Components: `PascalCase.tsx` (e.g. `PostCard.tsx`).
  - Hooks, utils, services: kebab-case (e.g. `use-auth.ts`, `fetch-client.ts`).
  - Types: kebab-case with suffix `.types.ts` (e.g. `post.types.ts`).
  - Constants: kebab-case with suffix `.constants.ts`.
- **CSS / Tailwind**: utility-first; no custom class names unless encapsulating a repeated pattern via `@apply` in a dedicated `.css` module.

# Project Structure

## Stack

- Next.js 16 — App Router
- TypeScript
- Tailwind CSS v4
- TanStack Query v5
- Native `fetch` (no axios)
- React Hook Form
- astronomy-engine — local astronomical calculations (no network)
- Open-Meteo — weather and geocoding (free plan, no API key)
- Hosting: Vercel

## Project layout

```
    src/
      app/                      # Next.js App Router — routing only (all pages go here)
        layout.tsx
        page.tsx
        not-found.tsx
        error.tsx
        globals.css             # Tailwind v4 entry + theme tokens
      components/               # Only shared UI components
      modules/                  # web feature modules
        <module-name>/
          components/
          hooks/                # TanStack Query hooks and more hooks
            use-<file-name>.ts
          services/             # Services to call fetch
            <file-name>.service.ts
          types/
            <file-name>.types.ts
          constants/            # TanStack Query key constants and additional module constants
            <file-name>.query-keys.ts # Query key constants
      lib/
        api/
          api-client.ts         # createFetchClient
        providers/
          Providers.tsx         # QueryClientProvider
        constants/
          routes.constants.ts   # web routes
```

## Key rules

- `app/` contains **only** page and layout files. Zero business logic, zero direct API calls.
- All data fetching logic lives in `modules/<module>/hooks/` via TanStack Query.
- All API calls live in `modules/<module>/services/`.
- Internal imports use the `@/` alias (points to `src/`).
- Routes are never hardcoded in components — always import from `lib/constants/routes.constants.ts`.

## Route constants

Routes are never hardcoded in components. The app has its own routes file:

```typescript
// /src/lib/constants/routes.constants.ts
export const ROUTES = {
  home: '/',
  clima: {
    detail: (slug: string) => `/clima/${slug}`,
  },
  legal: {
    terms: '/terminos',
    privacy: '/privacidad',
  },
} as const;
```

Take this routes as an example of the required structure.

# Tooling & Config

## TypeScript

- `strict: true` — no exceptions.
- `noImplicitAny: true`, `strictNullChecks: true`.
- **No `as` type assertions** unless casting from a known-safe generic (e.g. event targets). Prefer type guards.
- **No `// @ts-ignore` or `// @ts-expect-error`** without an explanatory comment immediately above.

## ESLint

Extends `next/core-web-vitals` + `eslint-config-next/typescript`. The config lives in `eslint.config.mjs` at the project root (ESLint flat config).

```javascript
// eslint.config.mjs
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        },
        { selector: 'function', format: ['camelCase', 'PascalCase'] },
        { selector: 'parameter', format: ['camelCase'] },
        { selector: 'class', format: ['PascalCase'] },
        { selector: 'interface', format: ['PascalCase'], prefix: ['I'] },
        { selector: 'typeAlias', format: ['PascalCase'], prefix: ['T'] },
      ],
      'react/display-name': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);
```

## Prettier

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "semi": true,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

`prettier-plugin-tailwindcss` runs automatically to sort Tailwind classes — never sort them manually. Prettier config is defined once at the app root.

## Tailwind CSS

Tailwind v4, configured in CSS — there is no `tailwind.config`. Theme tokens are declared with `@theme` in the global stylesheet.

```css
/* src/app/globals.css */
@import 'tailwindcss';

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
}
```

## Environment variables

- Public variables (browser-accessible): prefix `NEXT_PUBLIC_`.
- Server-only variables: no prefix — never import in Client Components.
- App must have `.env.example` at its root.
- This app uses no API keys (Open-Meteo is free and keyless).

## Git conventions

|        | Convention            | Example                           |
| ------ | --------------------- | --------------------------------- |
| Branch | `feat/<feature-name>` | `feat/test-feature`               |
| Commit | `feat: <description>` | `feat: add form to locate cities` |

Confirm commit messages with the user before committing.

# Skills

Topic-specific detail rules. Load the matching skill when the work touches it; do not repeat its content here.

| Skill                | When to use it                                                                                                       |
| -------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `component-patterns` | Creating or editing components and pages: anatomy, composition, loading/error/empty states, `next/image`, animation. |
| `tanstack-query`     | Data fetching: query keys, query hooks, `QueryClient`, `staleTime`/`gcTime`, invalidation, and retries.              |
| `react-hook-form`    | Forms and inputs (e.g. the location search), validation, and field-level errors.                                     |
