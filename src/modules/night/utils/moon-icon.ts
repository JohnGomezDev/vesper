import type { TMoonIconKey } from '@/modules/night/types/night.types';

const CENTER = 32;
const RADIUS = 28;
const TOP = CENTER - RADIUS;
const BOTTOM = CENTER + RADIUS;

function clampFraction(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/**
 * SVG path of the illuminated part of the conventional Moon icon (SPEC §8.4).
 *
 * The icon is not rotated and does not model the bright-limb angle. Waxing
 * phases show the right limb and waning phases the left one; the terminator is
 * the ellipse whose width comes from the illuminated fraction. `new-moon`
 * returns an empty path and `full-moon` a full circle.
 */
export function getMoonIconPath(iconKey: TMoonIconKey, illuminationPct: number): string {
  if (iconKey === 'new-moon' || illuminationPct <= 0) {
    return '';
  }

  if (iconKey === 'full-moon' || illuminationPct >= 100) {
    return `M${CENTER} ${TOP} A${RADIUS} ${RADIUS} 0 1 1 ${CENTER} ${BOTTOM} A${RADIUS} ${RADIUS} 0 1 1 ${CENTER} ${TOP} Z`;
  }

  const fraction = clampFraction(illuminationPct / 100);
  const terminatorRadius = Math.max(0.5, RADIUS * Math.abs(1 - 2 * fraction));
  const waxing =
    iconKey === 'waxing-crescent' || iconKey === 'first-quarter' || iconKey === 'waxing-gibbous';
  const limbSweep = waxing ? 1 : 0;
  const terminatorSweep = fraction < 0.5 === waxing ? 0 : 1;

  return `M${CENTER} ${TOP} A${RADIUS} ${RADIUS} 0 0 ${limbSweep} ${CENTER} ${BOTTOM} A${terminatorRadius} ${RADIUS} 0 0 ${terminatorSweep} ${CENTER} ${TOP} Z`;
}
