---
name: Component Patterns
description: Use when creating or editing React components or pages in Vesper — named exports, props interfaces, composition rules, loading/error/empty states, page shells under app/, next/image usage, and respecting prefers-reduced-motion.
---

# Component Patterns

- No business logic inside components besides from hooks calls.

**Rule**: push `'use client'` as far down the tree as possible. A page can be a Server Component that imports one small Client Component leaf — that is the preferred pattern.

## Component anatomy

```tsx
// /src/modules/test/components/TestCard.tsx
"use client"; // only if needed

import type { ITest } from "../types/test.types";

interface ITestCardProps {
  test: ITest;
  className?: string;
}

export function TestCard({
  test,
  className,
}: ITestCardProps): React.JSX.Element {
  return (
    <div className={className}>
      <h2>{test.title}</h2>
      <p>{test.description}</p>
    </div>
  );
}
```

- Always export as a **named export** — no default exports for components.
- Always type props with an interface prefixed `I` (e.g. `IPostCardProps`).
- Always declare the return type explicitly: `React.JSX.Element` or `React.ReactNode`.
- Never put data fetching directly inside a component — delegate to a hook or receive via props.

## Composition rules

- **One component per file.** Co-located sub-components are allowed only when they are never used outside that file, and must be clearly commented.
- **Props over context** for passing data between parent and child. Use context only for truly cross-cutting concerns (theme, auth status).
- **Avoid prop drilling beyond 2 levels.** Lift state or use a hook instead.
- **No anonymous arrow components.** Always use named function declarations or named `const`.

## Loading and error states

Every Client Component that fetches data must handle three states explicitly:

```tsx
export function TestList(): React.JSX.Element {
  const { data, isLoading, isError } = useTest();

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorState message="No se pudieron cargar los datos." />;
  if (!data?.length) return <EmptyState message="Aún no hay datos." />;

  return (
    <ul>
      {data.map((item) => (
        <TestCard key={item.id} item={item} />
      ))}
    </ul>
  );
}
```

## Page components (`app/` files)

Page files are thin shells. They own the route, set metadata, and compose module components:

```tsx
// /src/app/page.tsx
import { TestListContainer } from "@/modules/test/components/TestListContainer";

export const metadata = { title: "Test" };

export default function TestPage(): React.JSX.Element {
  return <TestListContainer />;
}
```

- Pages never contain JSX beyond layout composition.
- Pages never import the HTTP client or TanStack Query directly.

## Images and animation

- All images use `next/image` with explicit `width`, `height`, and `alt`.
- Animation is allowed (CSS or Framer Motion) but must respect `prefers-reduced-motion`.
