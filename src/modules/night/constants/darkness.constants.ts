import type { TDarknessLevel } from '@/modules/night/types/night.types';

/** Sun altitudes that separate the darkness levels (SPEC §4). */
export const NAUTICAL_DARKNESS_MAX_ALTITUDE_DEG = -6;
export const ASTRONOMICAL_TWILIGHT_MAX_ALTITUDE_DEG = -12;

/** Spanish label of each darkness level. */
export const DARKNESS_LEVEL_LABELS_ES: Record<TDarknessLevel, string> = {
  daylight: 'Cielo claro',
  'nautical-twilight': 'Crepúsculo náutico',
  'astronomical-twilight': 'Crepúsculo astronómico',
  'astronomical-night': 'Noche astronómica',
};
