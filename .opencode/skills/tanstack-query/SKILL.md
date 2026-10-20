---
name: TanStack Query
description: Use when adding or editing data fetching in Vesper — TanStack Query v5 query keys, query hooks, QueryClient setup, staleTime/gcTime, invalidation, and retry policy.
---

# TanStack Query

## Query keys

Centralize all query keys per module in a `*.query-keys.ts` file. Use the factory pattern so keys are composable and easy to invalidate.

```typescript
// /src/modules/test/constants/test.query-keys.ts
export const testKeys = {
  all: () => ['tests'] as const,
  lists: () => [...testKeys.all(), 'list'] as const,
  detail: (slug: string) => [...testKeys.all(), slug] as const,
};
```

## Query hooks — data fetching

```typescript
// /src/modules/test/hooks/use-test.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchData } from '../services/test.service';
import { testKeys } from '../constants/test.query-keys';
import type { ITest } from '../types/test.types';

export function useTest(): ReturnType<typeof useQuery<ITest[]>> {
  return useQuery({
    queryKey: testKeys.lists(),
    queryFn:  fetchData,
    staleTime: // Time defined on SPEC.md
  });
}
```

## QueryClient setups

```typescript
// /src/lib/providers/Providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 60, // 1 h — cada query lo declara explícitamente
            gcTime: 1000 * 60 * 60 * 24, // 24 h en memoria
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}
```

## Rules

- **TanStack Query owns all server state.**
- Every module has its own query-keys file — never share keys across modules.
- Always define `staleTime` explicitly in each query — never rely solely on the default.
- Hooks are always `'use client'` — never call `useQuery` / `useMutation` in a Server Component.
- Prefer `void queryClient.invalidateQueries(...)` over optimistic updates unless the UX explicitly requires it; never invalidate globally — target the exact key.
- Retry policy: do not retry 4xx (except 429, with growing backoff); retry network failures and 5xx.
