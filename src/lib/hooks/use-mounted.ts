'use client';

import { useSyncExternalStore } from 'react';

function subscribe(): () => void {
  return () => undefined;
}

function getClientSnapshot(): boolean {
  return true;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * `false` during the server render and the hydration pass, `true` afterwards.
 * Everything that depends on the device clock or on browser-only state must
 * wait for this flag (SPEC §7.6, §10).
 */
export function useMounted(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
