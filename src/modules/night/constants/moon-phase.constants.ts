import type { TMoonPhase } from '@/modules/night/types/night.types';

/** Spanish display name for every Moon phase (SPEC §8.4). */
export const MOON_PHASE_LABELS_ES: Record<TMoonPhase, string> = {
  'new-moon': 'Luna nueva',
  'waxing-crescent': 'Luna creciente',
  'first-quarter': 'Cuarto creciente',
  'waxing-gibbous': 'Gibosa creciente',
  'full-moon': 'Luna llena',
  'waning-gibbous': 'Gibosa menguante',
  'last-quarter': 'Cuarto menguante',
  'waning-crescent': 'Luna menguante',
};

/**
 * Half-open phase ranges of 45° centred on the USNO values (SPEC §8.4).
 *
 * The new Moon range wraps around 0°, so it appears twice: `[0, 22.5)` and
 * `[337.5, 360)`. `getMoonPhaseName` normalizes the angle to `[0, 360)` first
 * and walks this table in order.
 */
export const MOON_PHASE_RANGES: ReadonlyArray<{
  phase: TMoonPhase;
  startDeg: number;
  endDeg: number;
}> = [
  { phase: 'new-moon', startDeg: 0, endDeg: 22.5 },
  { phase: 'waxing-crescent', startDeg: 22.5, endDeg: 67.5 },
  { phase: 'first-quarter', startDeg: 67.5, endDeg: 112.5 },
  { phase: 'waxing-gibbous', startDeg: 112.5, endDeg: 157.5 },
  { phase: 'full-moon', startDeg: 157.5, endDeg: 202.5 },
  { phase: 'waning-gibbous', startDeg: 202.5, endDeg: 247.5 },
  { phase: 'last-quarter', startDeg: 247.5, endDeg: 292.5 },
  { phase: 'waning-crescent', startDeg: 292.5, endDeg: 337.5 },
  { phase: 'new-moon', startDeg: 337.5, endDeg: 360 },
];
