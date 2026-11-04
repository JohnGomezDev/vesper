import { describe, expect, it } from 'vitest';
import {
  MOON_PHASE_LABELS_ES,
  MOON_PHASE_RANGES,
} from '@/modules/night/constants/moon-phase.constants';
import type { TMoonPhase } from '@/modules/night/types/night.types';
import { getMoonPhaseIconKey, getMoonPhaseName } from '@/modules/night/utils/moon-phase';

describe('getMoonPhaseName', () => {
  it.each([
    { angleDeg: 0, expected: 'new-moon' },
    { angleDeg: 22.49, expected: 'new-moon' },
    { angleDeg: 22.5, expected: 'waxing-crescent' },
    { angleDeg: 67.49, expected: 'waxing-crescent' },
    { angleDeg: 67.5, expected: 'first-quarter' },
    { angleDeg: 112.49, expected: 'first-quarter' },
    { angleDeg: 112.5, expected: 'waxing-gibbous' },
    { angleDeg: 157.49, expected: 'waxing-gibbous' },
    { angleDeg: 157.5, expected: 'full-moon' },
    { angleDeg: 202.49, expected: 'full-moon' },
    { angleDeg: 202.5, expected: 'waning-gibbous' },
    { angleDeg: 247.49, expected: 'waning-gibbous' },
    { angleDeg: 247.5, expected: 'last-quarter' },
    { angleDeg: 292.49, expected: 'last-quarter' },
    { angleDeg: 292.5, expected: 'waning-crescent' },
    { angleDeg: 337.49, expected: 'waning-crescent' },
    { angleDeg: 337.5, expected: 'new-moon' },
    { angleDeg: 359.99, expected: 'new-moon' },
  ] as const)('maps $angleDeg to $expected', ({ angleDeg, expected }) => {
    expect(getMoonPhaseName(angleDeg)).toBe(expected);
  });

  it('belongs the exact 22.5 border to the waxing crescent', () => {
    expect(getMoonPhaseName(22.5)).toBe('waxing-crescent');
    expect(getMoonPhaseName(22.49)).toBe('new-moon');
  });

  it('normalizes negative and out-of-range angles to [0, 360)', () => {
    expect(getMoonPhaseName(-22.5)).toBe('new-moon');
    expect(getMoonPhaseName(382.5)).toBe('waxing-crescent');
    expect(getMoonPhaseName(-337.5)).toBe('waxing-crescent');
    expect(getMoonPhaseName(720)).toBe('new-moon');
  });
});

describe('MOON_PHASE_LABELS_ES', () => {
  it('has the eight Spanish names from the SPEC', () => {
    expect(MOON_PHASE_LABELS_ES).toEqual({
      'new-moon': 'Luna nueva',
      'waxing-crescent': 'Luna creciente',
      'first-quarter': 'Cuarto creciente',
      'waxing-gibbous': 'Gibosa creciente',
      'full-moon': 'Luna llena',
      'waning-gibbous': 'Gibosa menguante',
      'last-quarter': 'Cuarto menguante',
      'waning-crescent': 'Luna menguante',
    });
  });

  it('has a label for every phase in the ranges', () => {
    for (const range of MOON_PHASE_RANGES) {
      expect(MOON_PHASE_LABELS_ES[range.phase]).toBeTruthy();
    }
  });

  it('only contains the eight phase keys', () => {
    const expectedKeys: TMoonPhase[] = [
      'new-moon',
      'waxing-crescent',
      'first-quarter',
      'waxing-gibbous',
      'full-moon',
      'waning-gibbous',
      'last-quarter',
      'waning-crescent',
    ];

    expect(Object.keys(MOON_PHASE_LABELS_ES).sort()).toEqual([...expectedKeys].sort());
  });
});

describe('getMoonPhaseIconKey', () => {
  it('returns the phase as the icon key', () => {
    const phases: TMoonPhase[] = [
      'new-moon',
      'waxing-crescent',
      'first-quarter',
      'waxing-gibbous',
      'full-moon',
      'waning-gibbous',
      'last-quarter',
      'waning-crescent',
    ];

    for (const phase of phases) {
      expect(getMoonPhaseIconKey(phase)).toBe(phase);
    }
  });
});
