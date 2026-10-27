import type { IObserver } from '@/modules/astronomy/types/astronomy.types';
import type { ILocation } from '@/modules/location/types/location.types';

/** Altitude used when the forecast does not report one. */
const UNKNOWN_ELEVATION_M = 0;

/**
 * Builds the reusable observer for astronomy-engine.
 *
 * `elevationM` is the altitude already resolved by the caller (the `elevation`
 * of the forecast response, SPEC §5.4). `location.elevationM` is only a
 * defensive fallback for a non-finite value; it is never used to override a
 * real measurement. When no altitude is known, `0` is used and the unknown
 * value is logged: a missing datum is not silently treated as a measurement.
 */
export function createObserver(location: ILocation, elevationM: number): IObserver {
  const resolvedElevationM = Number.isFinite(elevationM) ? elevationM : location.elevationM;

  if (resolvedElevationM === null || !Number.isFinite(resolvedElevationM)) {
    console.warn(
      `Unknown elevation for "${location.slug}": using ${UNKNOWN_ELEVATION_M} m for the astronomical observer.`,
    );

    return {
      latitude: location.coordinates.latitude,
      longitude: location.coordinates.longitude,
      elevationM: UNKNOWN_ELEVATION_M,
    };
  }

  return {
    latitude: location.coordinates.latitude,
    longitude: location.coordinates.longitude,
    elevationM: resolvedElevationM,
  };
}
