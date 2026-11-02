import {
  ASTRONOMICAL_TWILIGHT_MAX_ALTITUDE_DEG,
  NAUTICAL_DARKNESS_MAX_ALTITUDE_DEG,
} from '@/modules/night/constants/darkness.constants';
import { ASTRONOMICAL_NIGHT_MAX_SUN_ALTITUDE_DEG } from '@/modules/night/constants/night.constants';
import type { TDarknessLevel } from '@/modules/night/types/night.types';

/**
 * Darkness level of the Sun altitude (SPEC §4). The levels are cumulative and
 * the boundary belongs to the lighter level because the SPEC uses strict `<`:
 * exactly −6° is daylight, exactly −12° is nautical twilight and exactly −18°
 * is astronomical twilight.
 */
export function getDarknessLevel(sunAltitudeDeg: number): TDarknessLevel {
  if (sunAltitudeDeg < ASTRONOMICAL_NIGHT_MAX_SUN_ALTITUDE_DEG) {
    return 'astronomical-night';
  }

  if (sunAltitudeDeg < ASTRONOMICAL_TWILIGHT_MAX_ALTITUDE_DEG) {
    return 'astronomical-twilight';
  }

  if (sunAltitudeDeg < NAUTICAL_DARKNESS_MAX_ALTITUDE_DEG) {
    return 'nautical-twilight';
  }

  return 'daylight';
}
