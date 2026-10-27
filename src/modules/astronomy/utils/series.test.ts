import { describe, expect, it } from 'vitest';
import type { IHorizontalPosition, INightSample } from '@/modules/astronomy/types/astronomy.types';
import { findCulmination, findMaxAltitude } from '@/modules/astronomy/utils/series';

function position(altitudeDeg: number): IHorizontalPosition {
  return { altitudeDeg, azimuthDeg: 90 };
}

function buildSample(
  instantMs: number,
  moonAltitudeDeg: number,
  jupiterAltitudeDeg = 0,
): INightSample {
  return {
    instantMs,
    sun: position(-20),
    moon: position(moonAltitudeDeg),
    planets: {
      mercury: position(0),
      venus: position(0),
      mars: position(0),
      jupiter: position(jupiterAltitudeDeg),
      saturn: position(0),
      uranus: position(0),
      neptune: position(0),
    },
  };
}

describe('findMaxAltitude', () => {
  it('returns the highest altitude and its instant', () => {
    const samples = [
      buildSample(1_000, 10, 5),
      buildSample(2_000, 50, 20),
      buildSample(3_000, 20, 70),
    ];

    expect(findMaxAltitude(samples, 'moon')).toEqual({ altitudeDeg: 50, instantMs: 2_000 });
    expect(findMaxAltitude(samples, 'jupiter')).toEqual({
      altitudeDeg: 70,
      instantMs: 3_000,
    });
  });

  it('resolves a tie with the first instant', () => {
    const samples = [buildSample(1_000, 10), buildSample(2_000, 40), buildSample(3_000, 40)];

    expect(findMaxAltitude(samples, 'moon')).toEqual({ altitudeDeg: 40, instantMs: 2_000 });
  });

  it('returns null for an empty series', () => {
    expect(findMaxAltitude([], 'moon')).toBeNull();
  });
});

describe('findCulmination', () => {
  it('marks the sampled culmination as approximate', () => {
    const samples = [buildSample(1_000, 10), buildSample(2_000, 55), buildSample(3_000, 30)];

    expect(findCulmination(samples, 'moon')).toEqual({
      culminationMs: 2_000,
      peakAltitudeDeg: 55,
      approximate: true,
    });
  });

  it('returns null for an empty series', () => {
    expect(findCulmination([], 'saturn')).toBeNull();
  });
});
