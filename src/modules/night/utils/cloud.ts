import type { TCloudClass } from '@/modules/night/types/night.types';

/** Layer weights from SPEC §8.5: low blocks the most, high the least. */
const CLOUD_LAYER_WEIGHTS = {
  low: 0.5,
  mid: 0.35,
  high: 0.15,
} as const;

const DECIMAL_FACTOR = 10;

function roundToOneDecimal(value: number): number {
  return Math.round(value * DECIMAL_FACTOR) / DECIMAL_FACTOR;
}

/**
 * Weighted cloud cover for one hour (SPEC §8.5):
 * `nube = 0,50·low + 0,35·mid + 0,15·high`.
 *
 * A missing layer makes the hour unknown and returns `null`; it is never
 * replaced by zero. The result is expressed in percent, rounded to one decimal
 * (T015 execution decision, see the task log).
 */
export function computeCloudCover(
  low: number | null,
  mid: number | null,
  high: number | null,
): number | null {
  if (low === null || mid === null || high === null) {
    return null;
  }

  const value =
    CLOUD_LAYER_WEIGHTS.low * low + CLOUD_LAYER_WEIGHTS.mid * mid + CLOUD_LAYER_WEIGHTS.high * high;

  return roundToOneDecimal(value);
}

/**
 * Cloud cover class (SPEC §8.5). The border belongs to the better class:
 * ideal ≤ 10, good ≤ 20, acceptable ≤ 30, fair ≤ 40, poor > 40.
 */
export function classifyCloudCover(value: number): TCloudClass {
  if (value <= 10) {
    return 'ideal';
  }

  if (value <= 20) {
    return 'good';
  }

  if (value <= 30) {
    return 'acceptable';
  }

  if (value <= 40) {
    return 'fair';
  }

  return 'poor';
}
