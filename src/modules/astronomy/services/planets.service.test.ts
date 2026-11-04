import { AngleBetween, Body, Equator, Observer } from 'astronomy-engine';
import { describe, expect, it } from 'vitest';
import { createObserver } from '@/modules/astronomy/services/observer.service';
import {
  getAngularSeparation,
  getPlanetInfo,
  getPlanetPosition,
} from '@/modules/astronomy/services/planets.service';
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
const INSTANT_MS = utc(2026, 10, 19, 5, 0);
const MAX_CULMINATION_DELAY_MS = 25 * 3_600_000;

const ALL_PLANETS: readonly TPlanetId[] = [
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
];

const ELONGATION_PLANETS: readonly TPlanetId[] = ['mercury', 'venus'];

function horizontalPosition(altitudeDeg: number, azimuthDeg: number): IHorizontalPosition {
  return { altitudeDeg, azimuthDeg };
}

function requireNumber(value: number | null, label: string): number {
  if (value === null) {
    throw new Error(`Expected a non-null number for ${label}.`);
  }

  return value;
}

describe('getPlanetInfo', () => {
  it.each(ALL_PLANETS)('returns complete data for %s', (planetId) => {
    const info = getPlanetInfo(BOGOTA_OBSERVER, planetId, INSTANT_MS);
    const separation = requireNumber(info.separationFromMoonDeg, 'separationFromMoonDeg');
    const culmination = requireNumber(info.culminationMs, 'culminationMs');

    expect(info.id).toBe(planetId);
    expect(info.position.altitudeDeg).toBeGreaterThanOrEqual(-90);
    expect(info.position.altitudeDeg).toBeLessThanOrEqual(90);
    expect(info.position.azimuthDeg).toBeGreaterThanOrEqual(0);
    expect(info.position.azimuthDeg).toBeLessThan(360);
    expect(Number.isFinite(info.magnitude)).toBe(true);
    expect(separation).toBeGreaterThanOrEqual(0);
    expect(separation).toBeLessThanOrEqual(180);
    expect(info.culminationApproximate).toBe(false);
    expect(culmination).toBeGreaterThanOrEqual(INSTANT_MS);
    expect(culmination).toBeLessThanOrEqual(INSTANT_MS + MAX_CULMINATION_DELAY_MS);
  });

  it('returns elongation only for Mercury and Venus', () => {
    for (const planetId of ALL_PLANETS) {
      const info = getPlanetInfo(BOGOTA_OBSERVER, planetId, INSTANT_MS);

      if (ELONGATION_PLANETS.includes(planetId)) {
        const elongation = requireNumber(info.elongationDeg, 'elongationDeg');

        expect(elongation).toBeGreaterThanOrEqual(0);
        expect(elongation).toBeLessThanOrEqual(180);
      } else {
        expect(info.elongationDeg).toBeNull();
      }
    }
  });

  it('matches the confirmed elongation values for Mercury and Venus', () => {
    const mercury = getPlanetInfo(BOGOTA_OBSERVER, 'mercury', INSTANT_MS);
    const venus = getPlanetInfo(BOGOTA_OBSERVER, 'venus', INSTANT_MS);

    expect(mercury.elongationDeg).toBeCloseTo(23.84, 1);
    expect(venus.elongationDeg).toBeCloseTo(10.63, 1);
  });

  it('uses AngleBetween on equatorial vectors for the Moon separation', () => {
    const engineObserver = new Observer(
      BOGOTA_OBSERVER.latitude,
      BOGOTA_OBSERVER.longitude,
      BOGOTA_OBSERVER.elevationM,
    );
    const date = new Date(INSTANT_MS);
    const moonVector = Equator(Body.Moon, date, engineObserver, true, true).vec;
    const jupiterVector = Equator(Body.Jupiter, date, engineObserver, true, true).vec;
    const expectedSeparation = AngleBetween(moonVector, jupiterVector);

    expect(getPlanetInfo(BOGOTA_OBSERVER, 'jupiter', INSTANT_MS).separationFromMoonDeg).toBeCloseTo(
      expectedSeparation,
      6,
    );
  });
});

describe('getPlanetPosition', () => {
  it('matches the position returned by the full planet info', () => {
    const info = getPlanetInfo(BOGOTA_OBSERVER, 'jupiter', INSTANT_MS);

    expect(getPlanetPosition(BOGOTA_OBSERVER, 'jupiter', INSTANT_MS)).toEqual(info.position);
  });
});

describe('getAngularSeparation', () => {
  it('returns 0 for the same position', () => {
    const position = horizontalPosition(30, 120);

    expect(getAngularSeparation(position, position)).toBeCloseTo(0, 10);
  });

  it('returns 90 degrees between the zenith and the horizon', () => {
    expect(getAngularSeparation(horizontalPosition(90, 0), horizontalPosition(0, 0))).toBeCloseTo(
      90,
      6,
    );
  });

  it('returns 90 degrees between two perpendicular horizon directions', () => {
    expect(getAngularSeparation(horizontalPosition(0, 0), horizontalPosition(0, 90))).toBeCloseTo(
      90,
      6,
    );
  });

  it('returns 180 degrees between opposite horizon directions', () => {
    expect(getAngularSeparation(horizontalPosition(0, 0), horizontalPosition(0, 180))).toBeCloseTo(
      180,
      6,
    );
  });

  it('is symmetric and bounded to [0, 180]', () => {
    const a = horizontalPosition(-12, 340);
    const b = horizontalPosition(41, 75);

    expect(getAngularSeparation(a, b)).toBeCloseTo(getAngularSeparation(b, a), 10);
    expect(getAngularSeparation(a, b)).toBeGreaterThanOrEqual(0);
    expect(getAngularSeparation(a, b)).toBeLessThanOrEqual(180);
  });
});
