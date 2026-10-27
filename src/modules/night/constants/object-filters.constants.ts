import type { TPlanetId } from '@/modules/astronomy/types/astronomy.types';
import type { TBrightnessLabel, TRequiredDarkness } from '@/modules/night/types/night.types';

/** Every target that can generate an observation window; the Sun is excluded. */
export type TWindowObjectId = TPlanetId | 'moon';

/** Static filters per target (SPEC §8.5). */
export interface IObjectFilter {
  /** The Sun must be strictly below this altitude. */
  requiredDarkness: TRequiredDarkness;
  brightnessLabel: TBrightnessLabel;
  /** Only Uranus and Neptune highlight the Moon-free window (SPEC §8.5.5). */
  requiresMoonFreeHighlight: boolean;
}

/**
 * Filter map from SPEC §8.5. The brightness label is static per target (T016
 * execution decision): the task asks for a constant map and the window input
 * has no magnitudes. Uranus and Neptune are always labelled as requiring optics.
 */
export const OBJECT_FILTERS: Record<TWindowObjectId, IObjectFilter> = {
  moon: {
    requiredDarkness: -12,
    brightnessLabel: 'naked-eye',
    requiresMoonFreeHighlight: false,
  },
  mercury: {
    requiredDarkness: -12,
    brightnessLabel: 'naked-eye',
    requiresMoonFreeHighlight: false,
  },
  venus: {
    requiredDarkness: -6,
    brightnessLabel: 'naked-eye',
    requiresMoonFreeHighlight: false,
  },
  mars: {
    requiredDarkness: -12,
    brightnessLabel: 'naked-eye',
    requiresMoonFreeHighlight: false,
  },
  jupiter: {
    requiredDarkness: -6,
    brightnessLabel: 'naked-eye',
    requiresMoonFreeHighlight: false,
  },
  saturn: {
    requiredDarkness: -12,
    brightnessLabel: 'naked-eye',
    requiresMoonFreeHighlight: false,
  },
  uranus: {
    requiredDarkness: -18,
    brightnessLabel: 'telescope',
    requiresMoonFreeHighlight: true,
  },
  neptune: {
    requiredDarkness: -18,
    brightnessLabel: 'telescope',
    requiresMoonFreeHighlight: true,
  },
};

/** Targets in a stable order: the Moon first, then the planets as `TPlanetId`. */
export const WINDOW_OBJECT_IDS: readonly TWindowObjectId[] = [
  'moon',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
];

/** Mercury and Venus need at least this elongation from the Sun (SPEC §8.5.4). */
export const MIN_ELONGATION_DEG = 15;

/** Moon–planet warning below 10° with a Moon illuminated over 20 % (SPEC §8.5.5). */
export const MOON_NOTICE_SEPARATION_DEG = 10;

/** Strong Moon–planet warning below 5° (SPEC §8.5.5). */
export const MOON_STRONG_NOTICE_SEPARATION_DEG = 5;

/** The Moon must be illuminated over this percentage for a warning (SPEC §8.5.5). */
export const MOON_NOTICE_MIN_ILLUMINATION_PCT = 20;

/** Below this illumination the Moon does not spoil the window (SPEC §8.5.5). */
export const MOON_FREE_MAX_ILLUMINATION_PCT = 10;
