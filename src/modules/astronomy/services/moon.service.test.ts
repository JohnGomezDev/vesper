import { describe, expect, it } from 'vitest';
import {
  getMoonInfo,
  getMoonPhase,
  getMoonPosition,
} from '@/modules/astronomy/services/moon.service';
import { createObserver } from '@/modules/astronomy/services/observer.service';
import type { ILocation } from '@/modules/location/types/location.types';
import { TIME_ZONES, utc } from '@/modules/location/utils/__fixtures__/domain-fixtures';
import {
  formatLocalDate,
  getLocalMidnightMs,
  parseLocalDateTime,
} from '@/modules/location/utils/datetime';

const BOGOTA_DATE = '2026-10-19';
const BOGOTA_LOCATION: ILocation = {
  slug: 'bogota',
  name: 'Bogotá',
  coordinates: { latitude: 4.61, longitude: -74.08 },
  elevationM: 2586,
  timeZone: TIME_ZONES.bogota,
  isCurated: true,
};
const BOGOTA_OBSERVER = createObserver(BOGOTA_LOCATION, 2586);

function requireInstant(instantMs: number | null, label: string): number {
  if (instantMs === null) {
    throw new Error(`Expected a non-null instant for ${label}.`);
  }

  return instantMs;
}

function expectLocalTimeWithin(
  instantMs: number | null,
  date: string,
  timeZone: string,
  expectedTime: string,
  toleranceMinutes = 2,
): void {
  const actualMs = requireInstant(instantMs, expectedTime);
  const expectedMs = parseLocalDateTime(`${date}T${expectedTime}`, timeZone);
  const differenceMinutes = Math.abs(actualMs - expectedMs) / 60_000;

  expect(differenceMinutes).toBeLessThanOrEqual(toleranceMinutes);
}

describe('getMoonPhase', () => {
  it('reports a full moon around the known 2026-10-25 full moon', () => {
    const phase = getMoonPhase(Date.UTC(2026, 9, 26, 4, 11));

    expect(phase.angleDeg).toBeGreaterThan(179.5);
    expect(phase.angleDeg).toBeLessThan(180.5);
    expect(phase.illuminationFraction).toBeGreaterThan(0.99);
    expect(phase.illuminationFraction).toBeLessThanOrEqual(1);
  });

  it('reports the waning crescent before the 2026-10-10 new moon', () => {
    const phase = getMoonPhase(Date.UTC(2026, 9, 10, 0, 0));

    expect(phase.angleDeg).toBeGreaterThanOrEqual(337.5);
    expect(phase.angleDeg).toBeLessThan(360);
    expect(phase.illuminationFraction).toBeLessThan(0.01);
  });

  it('keeps the angle in [0, 360) and the illumination in [0, 1]', () => {
    for (let day = 0; day < 30; day += 1) {
      const phase = getMoonPhase(utc(2026, 10, 1) + day * 12 * 3_600_000);

      expect(phase.angleDeg).toBeGreaterThanOrEqual(0);
      expect(phase.angleDeg).toBeLessThan(360);
      expect(phase.illuminationFraction).toBeGreaterThanOrEqual(0);
      expect(phase.illuminationFraction).toBeLessThanOrEqual(1);
    }
  });
});

describe('getMoonPosition', () => {
  it('returns a horizontal position inside the valid ranges', () => {
    const position = getMoonPosition(
      BOGOTA_OBSERVER,
      getLocalMidnightMs(BOGOTA_DATE, TIME_ZONES.bogota),
    );

    expect(position.altitudeDeg).toBeGreaterThanOrEqual(-90);
    expect(position.altitudeDeg).toBeLessThanOrEqual(90);
    expect(position.azimuthDeg).toBeGreaterThanOrEqual(0);
    expect(position.azimuthDeg).toBeLessThan(360);
  });
});

describe('getMoonInfo', () => {
  it('uses local midnight for phase and position in Bogotá', () => {
    const info = getMoonInfo(BOGOTA_OBSERVER, BOGOTA_DATE, TIME_ZONES.bogota);
    const midnightMs = getLocalMidnightMs(BOGOTA_DATE, TIME_ZONES.bogota);
    const midnightPhase = getMoonPhase(midnightMs);

    expect(info.angleDeg).toBe(midnightPhase.angleDeg);
    expect(info.illuminationFraction).toBe(midnightPhase.illuminationFraction);
    expect(info.position).toEqual(getMoonPosition(BOGOTA_OBSERVER, midnightMs));
    expect(info.angleDeg).toBeCloseTo(95.83, 1);
    expect(info.illuminationFraction).toBeCloseTo(0.552, 2);
    expect(info.position.altitudeDeg).toBeCloseTo(2.99, 1);
    expect(info.position.azimuthDeg).toBeCloseTo(247.55, 1);
  });

  it('returns rise and set on the requested local date', () => {
    const info = getMoonInfo(BOGOTA_OBSERVER, BOGOTA_DATE, TIME_ZONES.bogota);

    expect(formatLocalDate(requireInstant(info.riseMs, 'moonrise'), TIME_ZONES.bogota)).toBe(
      BOGOTA_DATE,
    );
    expect(formatLocalDate(requireInstant(info.setMs, 'moonset'), TIME_ZONES.bogota)).toBe(
      BOGOTA_DATE,
    );
    expectLocalTimeWithin(info.riseMs, BOGOTA_DATE, TIME_ZONES.bogota, '12:55');
    expectLocalTimeWithin(info.setMs, BOGOTA_DATE, TIME_ZONES.bogota, '00:15');
  });
});
