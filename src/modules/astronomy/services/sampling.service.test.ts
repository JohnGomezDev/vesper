import { describe, expect, it } from 'vitest';
import { SAMPLE_STEP_MS } from '@/modules/astronomy/constants/sampling.constants';
import { createObserver } from '@/modules/astronomy/services/observer.service';
import { sampleNight } from '@/modules/astronomy/services/sampling.service';
import type { IHorizontalPosition, TPlanetId } from '@/modules/astronomy/types/astronomy.types';
import type { ILocation } from '@/modules/location/types/location.types';
import { TIME_ZONES, utc } from '@/modules/location/utils/__fixtures__/domain-fixtures';

const BOGOTA_LOCATION: ILocation = {
  slug: 'bogota',
  name: 'Bogotá',
  coordinates: { latitude: 4.61, longitude: -74.08 },
  elevationM: 2586,
  timeZone: TIME_ZONES.bogota,
  isCurated: true,
};
const BOGOTA_OBSERVER = createObserver(BOGOTA_LOCATION, 2586);
const START_MS = utc(2026, 10, 19, 22, 0);
const TEN_HOURS_MS = 10 * 3_600_000;

const ALL_PLANETS: readonly TPlanetId[] = [
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
];

function expectValidPosition(position: IHorizontalPosition): void {
  expect(position.altitudeDeg).toBeGreaterThanOrEqual(-90);
  expect(position.altitudeDeg).toBeLessThanOrEqual(90);
  expect(position.azimuthDeg).toBeGreaterThanOrEqual(0);
  expect(position.azimuthDeg).toBeLessThan(360);
}

describe('sampleNight', () => {
  it('produces 61 samples for a 10-hour strip, including both endpoints', () => {
    const endMs = START_MS + TEN_HOURS_MS;
    const samples = sampleNight({ observer: BOGOTA_OBSERVER, startMs: START_MS, endMs });

    expect(samples).toHaveLength(61);
    expect(samples[0].instantMs).toBe(START_MS);
    expect(samples[samples.length - 1].instantMs).toBe(endMs);

    for (let index = 1; index < samples.length; index += 1) {
      expect(samples[index].instantMs - samples[index - 1].instantMs).toBe(SAMPLE_STEP_MS);
    }
  });

  it('keeps the last sample before an end that is not on the grid', () => {
    const endMs = START_MS + TEN_HOURS_MS + 5 * 60_000;
    const samples = sampleNight({ observer: BOGOTA_OBSERVER, startMs: START_MS, endMs });

    expect(samples).toHaveLength(61);
    expect(samples[samples.length - 1].instantMs).toBe(START_MS + TEN_HOURS_MS);
    expect(samples[samples.length - 1].instantMs).toBeLessThan(endMs);
  });

  it('computes the Sun, the Moon and the seven planets for every instant', () => {
    const samples = sampleNight({
      observer: BOGOTA_OBSERVER,
      startMs: START_MS,
      endMs: START_MS + TEN_HOURS_MS,
    });

    for (const sample of samples) {
      expectValidPosition(sample.sun);
      expectValidPosition(sample.moon);

      for (const planetId of ALL_PLANETS) {
        expectValidPosition(sample.planets[planetId]);
      }
    }
  });

  it('rejects an invalid range', () => {
    expect(() =>
      sampleNight({ observer: BOGOTA_OBSERVER, startMs: START_MS, endMs: START_MS - 1 }),
    ).toThrow(RangeError);
    expect(() =>
      sampleNight({ observer: BOGOTA_OBSERVER, startMs: Number.NaN, endMs: START_MS }),
    ).toThrow(RangeError);
  });

  it('stays fast enough to run locally without blocking the render', () => {
    const startedAt = performance.now();

    sampleNight({
      observer: BOGOTA_OBSERVER,
      startMs: START_MS,
      endMs: START_MS + TEN_HOURS_MS,
    });

    expect(performance.now() - startedAt).toBeLessThan(500);
  });
});
