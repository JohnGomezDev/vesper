'use client';

import { useSyncExternalStore } from 'react';
import { NOW_TICK_MS } from '@/modules/night/constants/night.constants';

function subscribeToNow(onChange: () => void): () => void {
  const interval = setInterval(onChange, NOW_TICK_MS);

  return () => clearInterval(interval);
}

function getNowSnapshot(): number {
  return Math.floor(Date.now() / NOW_TICK_MS) * NOW_TICK_MS;
}

function getServerNowSnapshot(): number {
  return 0;
}

/**
 * Client clock sampled every 15 minutes (SPEC §10).
 *
 * `Date.now()` never runs during render (React's purity rule) and the server
 * snapshot is `0`, which keeps the first paint and hydration identical. The
 * tick is also the local timer that recalculates the current night after
 * midnight or sunrise.
 */
export function useNow(): number {
  return useSyncExternalStore(subscribeToNow, getNowSnapshot, getServerNowSnapshot);
}
