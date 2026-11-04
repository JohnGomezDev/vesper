import type { ICoordinates } from '@/modules/location/types/location.types';
import { roundCoordinates } from '@/modules/location/utils/coordinates';

/**
 * Session-only cache of display names chosen by the user (SPEC §8.1, §7.3).
 *
 * It is a module-level `Map`, so it lives as long as the browser tab and is
 * never persisted. Keying by rounded coordinates matches the slug and the
 * TanStack Query key, so two places closer than ~1 km intentionally collapse
 * into one entry. Server rendering starts with an empty cache, which keeps the
 * first paint identical to the client hydration.
 */
const namesByCoordinates = new Map<string, string>();

function getKey(coordinates: ICoordinates): string {
  const rounded = roundCoordinates(coordinates);

  return `${rounded.latitude},${rounded.longitude}`;
}

/** Stores the name of a place selected by search or GPS for this session. */
export function rememberLocationName(coordinates: ICoordinates, name: string): void {
  const normalizedName = name.trim();

  if (normalizedName === '') {
    namesByCoordinates.delete(getKey(coordinates));

    return;
  }

  namesByCoordinates.set(getKey(coordinates), normalizedName);
}

/** Returns the name remembered for these coordinates, or `null` on a cold link. */
export function recallLocationName(coordinates: ICoordinates): string | null {
  return namesByCoordinates.get(getKey(coordinates)) ?? null;
}
