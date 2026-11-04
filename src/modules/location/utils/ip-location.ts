import type { ICoordinates } from '@/modules/location/types/location.types';
import {
  isValidLatitude,
  isValidLongitude,
  roundCoordinates,
} from '@/modules/location/utils/coordinates';

/** Stable identifier of a location resolved only from IP coordinates (SPEC §6.1). */
export const APPROXIMATE_LOCATION_ID = 'ubicacion-aproximada';

/** Geolocation headers documented by Vercel (verification-notes.md §7). */
const LATITUDE_HEADER = 'x-vercel-ip-latitude';
const LONGITUDE_HEADER = 'x-vercel-ip-longitude';

/**
 * Reads the approximate location of the visitor from the Vercel IP headers
 * (SPEC §6.1).
 *
 * Both headers are required; a missing one, a non-numeric value or a value out
 * of the valid range yields `null`, so the caller falls back to the curated
 * Bogotá page. The result is rounded to two decimals with the same helper used
 * by every slug and cache key.
 */
export function readApproximateLocation(headerList: Headers): ICoordinates | null {
  const latitudeHeader = headerList.get(LATITUDE_HEADER);
  const longitudeHeader = headerList.get(LONGITUDE_HEADER);

  if (latitudeHeader === null || longitudeHeader === null) {
    return null;
  }

  const latitude = Number.parseFloat(latitudeHeader);
  const longitude = Number.parseFloat(longitudeHeader);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
    return null;
  }

  return roundCoordinates({ latitude, longitude });
}
