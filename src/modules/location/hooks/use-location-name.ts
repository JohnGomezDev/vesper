'use client';

import { useMemo } from 'react';
import type { IUseLocationNameInput } from '@/modules/location/types/location.types';
import { resolveLocationName } from '@/modules/location/utils/location-name';

/**
 * Visible name of the current place, in the order fixed by SPEC §8.1:
 * curated city → name remembered in this session → slug label → approximate
 * location with rounded coordinates.
 */
export function useLocationName({ slug, result }: IUseLocationNameInput): string {
  return useMemo(() => resolveLocationName({ slug, result }), [slug, result]);
}
