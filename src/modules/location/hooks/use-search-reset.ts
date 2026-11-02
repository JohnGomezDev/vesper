'use client';

import { useSyncExternalStore } from 'react';

/**
 * Search text is transient UI, but Next.js keeps previously visited route
 * subtrees mounted while it restores them from its client cache. A page-local
 * state reset therefore cannot clear the form of a cached slug when we come
 * back to it. This module-level token is shared by every mounted page, so one
 * reset empties the visible form and every cached one before they reappear.
 */
let resetToken = 0;
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): number {
  return resetToken;
}

function getServerSnapshot(): number {
  return 0;
}

export function resetSearch(): void {
  resetToken += 1;

  for (const listener of listeners) {
    listener();
  }
}

export function useSearchResetToken(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
