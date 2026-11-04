import { Body, Equator, Horizon, Observer } from 'astronomy-engine';
import { describe, expect, it, vi } from 'vitest';
import { createObserver } from '@/modules/astronomy/services/observer.service';
import {
  getSunPosition,
  getSunTimes,
  getTwilightTimes,
} from '@/modules/astronomy/services/sun.service';
import type { IObserver } from '@/modules/astronomy/types/astronomy.types';
import type { ILocation } from '@/modules/location/types/location.types';
import { TIME_ZONES, utc } from '@/modules/location/utils/__fixtures__/domain-fixtures';
import {
  formatLocalDate,
  formatLocalTime,
  parseLocalDateTime,
} from '@/modules/location/utils/datetime';

const BOGOTA_DATE = '2026-10-19';
const NEW_YORK_DATE = '2026-11-01';
const OSLO_SUMMER_DATE = '2026-06-21';

const BOGOTA_LOCATION: ILocation = {
  slug: 'bogota',
  name: 'Bogotá',
  coordinates: { latitude: 4.61, longitude: -74.08 },
  elevationM: 2586,
  timeZone: TIME_ZONES.bogota,
  isCurated: true,
};

const NEW_YORK_LOCATION: ILocation = {
  slug: 'new-york',
  name: 'Nueva York',
  coordinates: { latitude: 40.71, longitude: -74.01 },
  elevationM: 10,
  timeZone: TIME_ZONES.newYork,
  isCurated: false,
};

const TROMSO_LOCATION: ILocation = {
  slug: 'tromso',
  name: 'Tromsø',
  coordinates: { latitude: 69.65, longitude: 18.96 },
  elevationM: 10,
  timeZone: TIME_ZONES.oslo,
  isCurated: false,
};

const BOGOTA_OBSERVER = createObserver(BOGOTA_LOCATION, 2586);
const NEW_YORK_OBSERVER = createObserver(NEW_YORK_LOCATION, 10);
const TROMSO_OBSERVER = createObserver(TROMSO_LOCATION, 10);

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

  expect(
    differenceMinutes,
    `Expected ${expectedTime} local (${timeZone}), received ${formatLocalTime(actualMs, timeZone)}`,
  ).toBeLessThanOrEqual(toleranceMinutes);
}

/** Geometric altitude without refraction, used to prove `"normal"` is applied. */
function getGeometricSunAltitude(observer: IObserver, instantMs: number): number {
  const date = new Date(instantMs);
  const engineObserver = new Observer(observer.latitude, observer.longitude, observer.elevationM);
  const equator = Equator(Body.Sun, date, engineObserver, true, true);

  return Horizon(date, engineObserver, equator.ra, equator.dec).altitude;
}

describe('createObserver', () => {
  it('uses the elevation already resolved from the forecast', () => {
    expect(createObserver(BOGOTA_LOCATION, 2600)).toEqual({
      latitude: 4.61,
      longitude: -74.08,
      elevationM: 2600,
    });
  });

  it('falls back to the location elevation when the resolved value is not finite', () => {
    expect(createObserver(BOGOTA_LOCATION, Number.NaN).elevationM).toBe(2586);
  });

  it('uses 0 and logs when no elevation is known', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const locationWithoutElevation: ILocation = { ...BOGOTA_LOCATION, elevationM: null };

    expect(createObserver(locationWithoutElevation, Number.NaN).elevationM).toBe(0);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Unknown elevation'));

    warn.mockRestore();
  });
});

describe('getSunPosition', () => {
  it('applies atmospheric refraction when requesting the altitude', () => {
    const { sunriseMs } = getSunTimes(BOGOTA_OBSERVER, BOGOTA_DATE, TIME_ZONES.bogota);
    const sunrise = requireInstant(sunriseMs, 'Bogotá sunrise');

    const refractedAltitude = getSunPosition(BOGOTA_OBSERVER, sunrise).altitudeDeg;
    const geometricAltitude = getGeometricSunAltitude(BOGOTA_OBSERVER, sunrise);

    expect(refractedAltitude).toBeGreaterThan(geometricAltitude + 0.3);
  });

  it('returns a horizontal position inside the valid ranges', () => {
    const localNoon = getSunPosition(BOGOTA_OBSERVER, utc(2026, 10, 19, 17, 0));

    expect(localNoon.altitudeDeg).toBeGreaterThan(60);
    expect(localNoon.altitudeDeg).toBeLessThanOrEqual(90);
    expect(localNoon.azimuthDeg).toBeGreaterThanOrEqual(0);
    expect(localNoon.azimuthDeg).toBeLessThan(360);
  });
});

describe('getSunTimes', () => {
  it('returns the Bogotá sunrise and sunset on the requested local date', () => {
    const { sunriseMs, sunsetMs } = getSunTimes(BOGOTA_OBSERVER, BOGOTA_DATE, TIME_ZONES.bogota);

    expect(formatLocalDate(requireInstant(sunriseMs, 'sunrise'), TIME_ZONES.bogota)).toBe(
      BOGOTA_DATE,
    );
    expect(formatLocalDate(requireInstant(sunsetMs, 'sunset'), TIME_ZONES.bogota)).toBe(
      BOGOTA_DATE,
    );
    expectLocalTimeWithin(sunriseMs, BOGOTA_DATE, TIME_ZONES.bogota, '05:41');
    expectLocalTimeWithin(sunsetMs, BOGOTA_DATE, TIME_ZONES.bogota, '17:40');
  });

  it('uses the place zone across the America/New_York fall-back change', () => {
    const { sunriseMs, sunsetMs } = getSunTimes(
      NEW_YORK_OBSERVER,
      NEW_YORK_DATE,
      TIME_ZONES.newYork,
    );

    expect(formatLocalDate(requireInstant(sunriseMs, 'sunrise'), TIME_ZONES.newYork)).toBe(
      NEW_YORK_DATE,
    );
    expect(formatLocalDate(requireInstant(sunsetMs, 'sunset'), TIME_ZONES.newYork)).toBe(
      NEW_YORK_DATE,
    );
    expectLocalTimeWithin(sunriseMs, NEW_YORK_DATE, TIME_ZONES.newYork, '06:26');
    expectLocalTimeWithin(sunsetMs, NEW_YORK_DATE, TIME_ZONES.newYork, '16:52');
  });

  it('returns null without throwing during the polar day', () => {
    expect(getSunTimes(TROMSO_OBSERVER, OSLO_SUMMER_DATE, TIME_ZONES.oslo)).toEqual({
      sunriseMs: null,
      sunsetMs: null,
    });
  });
});

describe('getTwilightTimes', () => {
  it('finds the Bogotá twilight crossings for the requested local date', () => {
    const twilights = getTwilightTimes(BOGOTA_OBSERVER, BOGOTA_DATE, TIME_ZONES.bogota);

    for (const instantMs of [
      twilights.dawn6Ms,
      twilights.dusk6Ms,
      twilights.dawn12Ms,
      twilights.dusk12Ms,
      twilights.dawn18Ms,
      twilights.dusk18Ms,
    ]) {
      expect(formatLocalDate(requireInstant(instantMs, 'twilight'), TIME_ZONES.bogota)).toBe(
        BOGOTA_DATE,
      );
    }

    expectLocalTimeWithin(twilights.dawn6Ms, BOGOTA_DATE, TIME_ZONES.bogota, '05:20');
    expectLocalTimeWithin(twilights.dusk6Ms, BOGOTA_DATE, TIME_ZONES.bogota, '18:02');
    expectLocalTimeWithin(twilights.dawn12Ms, BOGOTA_DATE, TIME_ZONES.bogota, '04:55');
    expectLocalTimeWithin(twilights.dusk12Ms, BOGOTA_DATE, TIME_ZONES.bogota, '18:26');
    expectLocalTimeWithin(twilights.dawn18Ms, BOGOTA_DATE, TIME_ZONES.bogota, '04:31');
    expectLocalTimeWithin(twilights.dusk18Ms, BOGOTA_DATE, TIME_ZONES.bogota, '18:51');
  });

  it('returns null crossings during the polar day', () => {
    expect(getTwilightTimes(TROMSO_OBSERVER, OSLO_SUMMER_DATE, TIME_ZONES.oslo)).toEqual({
      dusk6Ms: null,
      dawn6Ms: null,
      dusk12Ms: null,
      dawn12Ms: null,
      dusk18Ms: null,
      dawn18Ms: null,
    });
  });
});
