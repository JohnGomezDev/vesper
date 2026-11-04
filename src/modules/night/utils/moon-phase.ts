import { MOON_PHASE_RANGES } from '@/modules/night/constants/moon-phase.constants';
import type { TMoonIconKey, TMoonPhase } from '@/modules/night/types/night.types';

const DEGREES_IN_CIRCLE = 360;

function normalizeAngle(angleDeg: number): number {
  return ((angleDeg % DEGREES_IN_CIRCLE) + DEGREES_IN_CIRCLE) % DEGREES_IN_CIRCLE;
}

/**
 * Moon phase for the Sun–Moon ecliptic angle published by the USNO (SPEC §8.4).
 *
 * The angle is normalized to `[0, 360)` and matched against half-open ranges of
 * 45°, so a border such as 22.5 belongs to exactly one phase (the waxing
 * crescent in that case). The caller evaluates this at local midnight.
 */
export function getMoonPhaseName(angleDeg: number): TMoonPhase {
  const normalized = normalizeAngle(angleDeg);

  for (const range of MOON_PHASE_RANGES) {
    if (normalized >= range.startDeg && normalized < range.endDeg) {
      return range.phase;
    }
  }

  // Unreachable: the ranges cover [0, 360) without gaps.
  return 'new-moon';
}

/**
 * Icon identifier for a phase. For now it is the identity: T022 replaces the
 * drawing with the conventional phase shape, without rotating it (SPEC §8.4).
 */
export function getMoonPhaseIconKey(phase: TMoonPhase): TMoonIconKey {
  return phase;
}
