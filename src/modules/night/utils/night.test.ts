import { describe, expect, it } from 'vitest';
import type { TNightWindow } from '@/modules/night/types/night.types';
import {
  DOMAIN_DATES,
  NIGHT_WINDOW_CASES,
  TIME_ZONES,
  utc,
} from '@/modules/location/utils/__fixtures__/domain-fixtures';
import {
  filterHoursInWindow,
  getCurrentNightDate,
  getNightWindow,
} from '@/modules/night/utils/night';

const BOGOTA = TIME_ZONES.bogota;
const NEW_YORK = TIME_ZONES.newYork;
const SANTIAGO = TIME_ZONES.santiago;
const OSLO = TIME_ZONES.oslo;

function availableWindow(startMs: number, endMs: number): TNightWindow {
  return { kind: 'available', startMs, endMs };
}

describe('getNightWindow matrix', () => {
  it.each(NIGHT_WINDOW_CASES)(
    'builds the $date window in $timeZone',
    ({ date, sunset, sunriseNext, timeZone, expected }) => {
      expect(getNightWindow({ date, sunset, sunriseNext, timeZone })).toEqual(expected);
    },
  );
});

describe('getNightWindow', () => {
  it('extends sunset and next sunrise by one hour on each side', () => {
    expect(
      getNightWindow({
        date: '2026-10-19',
        sunset: '2026-10-19T18:00',
        sunriseNext: '2026-10-20T06:00',
        timeZone: BOGOTA,
      }),
    ).toEqual(availableWindow(utc(2026, 10, 19, 22, 0), utc(2026, 10, 20, 12, 0)));
  });

  it('handles a southern hemisphere winter night in Santiago', () => {
    expect(
      getNightWindow({
        date: '2026-06-21',
        sunset: '2026-06-21T17:45',
        sunriseNext: '2026-06-22T07:50',
        timeZone: SANTIAGO,
      }),
    ).toEqual(availableWindow(utc(2026, 6, 21, 20, 45), utc(2026, 6, 22, 12, 50)));
  });

  it('returns no-astronomical-night without sunset', () => {
    expect(
      getNightWindow({
        date: '2026-06-21',
        sunset: null,
        sunriseNext: '2026-06-22T02:00',
        timeZone: 'Europe/Oslo',
      }),
    ).toEqual({ kind: 'no-astronomical-night' });
  });

  it('returns no-astronomical-night without the next sunrise', () => {
    expect(
      getNightWindow({
        date: '2026-06-21',
        sunset: '2026-06-21T23:00',
        sunriseNext: null,
        timeZone: 'Europe/Oslo',
      }),
    ).toEqual({ kind: 'no-astronomical-night' });
  });
});

describe('filterHoursInWindow', () => {
  const BOGOTA_WINDOW = availableWindow(utc(2026, 10, 19, 22, 0), utc(2026, 10, 20, 12, 0));

  it('keeps only the hours that overlap the visible strip', () => {
    const hourlyTimes = [
      '2026-10-19T16:00',
      '2026-10-19T17:00',
      '2026-10-19T18:00',
      '2026-10-19T19:00',
      '2026-10-19T20:00',
      '2026-10-19T21:00',
      '2026-10-19T22:00',
      '2026-10-19T23:00',
      '2026-10-20T00:00',
      '2026-10-20T01:00',
      '2026-10-20T02:00',
      '2026-10-20T03:00',
      '2026-10-20T04:00',
      '2026-10-20T05:00',
      '2026-10-20T06:00',
      '2026-10-20T07:00',
      '2026-10-20T08:00',
    ];

    expect(filterHoursInWindow(hourlyTimes, BOGOTA_WINDOW, BOGOTA)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
    ]);
  });

  it('excludes a row that ends exactly when the strip starts and a row that starts at its end', () => {
    const hourlyTimes = ['2026-10-19T16:00', '2026-10-19T17:00', '2026-10-20T07:00'];

    expect(filterHoursInWindow(hourlyTimes, BOGOTA_WINDOW, BOGOTA)).toEqual([1]);
  });

  it('keeps the overlapping rows of a southern-hemisphere winter night', () => {
    const window = getNightWindow({
      date: DOMAIN_DATES.santiagoWinterNight,
      sunset: '2026-06-21T17:45',
      sunriseNext: '2026-06-22T07:50',
      timeZone: SANTIAGO,
    });

    const hourlyTimes = [
      '2026-06-21T15:00',
      '2026-06-21T16:00',
      '2026-06-22T08:00',
      '2026-06-22T09:00',
    ];

    expect(filterHoursInWindow(hourlyTimes, window, SANTIAGO)).toEqual([1, 2]);
  });

  it('returns an empty list without an astronomical night', () => {
    expect(
      filterHoursInWindow(
        ['2026-06-21T23:00', '2026-06-22T00:00'],
        { kind: 'no-astronomical-night' },
        'Europe/Oslo',
      ),
    ).toEqual([]);
  });

  it('covers a 25-hour night across the fall-back transition without splitting by 24', () => {
    const window = getNightWindow({
      date: '2026-10-31',
      sunset: '2026-10-31T17:50',
      sunriseNext: '2026-11-01T06:30',
      timeZone: NEW_YORK,
    });

    const hourlyTimes = [
      '2026-10-31T17:00',
      '2026-10-31T18:00',
      '2026-10-31T19:00',
      '2026-10-31T20:00',
      '2026-10-31T21:00',
      '2026-10-31T22:00',
      '2026-10-31T23:00',
      '2026-11-01T00:00',
      '2026-11-01T01:00',
      '2026-11-01T01:00',
      '2026-11-01T02:00',
      '2026-11-01T03:00',
      '2026-11-01T04:00',
      '2026-11-01T05:00',
      '2026-11-01T06:00',
      '2026-11-01T07:00',
    ];

    const rows = filterHoursInWindow(hourlyTimes, window, NEW_YORK);

    expect(window).toEqual(availableWindow(utc(2026, 10, 31, 20, 50), utc(2026, 11, 1, 12, 30)));
    expect(rows).toHaveLength(16);
    expect(rows[0]).toBe(0);
    expect(rows[rows.length - 1]).toBe(15);
  });

  it('covers a 23-hour night across the spring-forward transition without splitting by 24', () => {
    const window = getNightWindow({
      date: '2026-03-07',
      sunset: '2026-03-07T17:55',
      sunriseNext: '2026-03-08T07:20',
      timeZone: NEW_YORK,
    });

    const hourlyTimes = [
      '2026-03-07T17:00',
      '2026-03-07T18:00',
      '2026-03-07T19:00',
      '2026-03-07T20:00',
      '2026-03-07T21:00',
      '2026-03-07T22:00',
      '2026-03-07T23:00',
      '2026-03-08T00:00',
      '2026-03-08T01:00',
      '2026-03-08T03:00',
      '2026-03-08T04:00',
      '2026-03-08T05:00',
      '2026-03-08T06:00',
      '2026-03-08T07:00',
    ];

    const rows = filterHoursInWindow(hourlyTimes, window, NEW_YORK);

    expect(window).toEqual(availableWindow(utc(2026, 3, 7, 21, 55), utc(2026, 3, 8, 12, 20)));
    expect(rows).toHaveLength(14);
    expect(rows[0]).toBe(0);
    expect(rows[rows.length - 1]).toBe(13);
  });
});

describe('getCurrentNightDate', () => {
  const SUNRISE_BY_DATE = new Map<string, string | null>([['2026-10-19', '2026-10-19T06:00']]);

  it('returns the previous night at 03:00 local time', () => {
    expect(
      getCurrentNightDate({
        nowMs: utc(2026, 10, 19, 8, 0),
        timeZone: BOGOTA,
        sunriseByDate: SUNRISE_BY_DATE,
      }),
    ).toEqual({ kind: 'night', date: '2026-10-18' });
  });

  it('returns the current day night at 15:00 local time', () => {
    expect(
      getCurrentNightDate({
        nowMs: utc(2026, 10, 19, 20, 0),
        timeZone: BOGOTA,
        sunriseByDate: SUNRISE_BY_DATE,
      }),
    ).toEqual({ kind: 'night', date: '2026-10-19' });
  });

  it('treats the exact sunrise instant as already the current day', () => {
    expect(
      getCurrentNightDate({
        nowMs: utc(2026, 10, 19, 11, 0),
        timeZone: BOGOTA,
        sunriseByDate: SUNRISE_BY_DATE,
      }),
    ).toEqual({ kind: 'night', date: '2026-10-19' });
  });

  it('returns no-current-night when today has no sunrise key', () => {
    expect(
      getCurrentNightDate({
        nowMs: utc(2026, 10, 19, 8, 0),
        timeZone: BOGOTA,
        sunriseByDate: new Map(),
      }),
    ).toEqual({ kind: 'no-current-night' });
  });

  it('returns no-current-night when today has a null sunrise', () => {
    expect(
      getCurrentNightDate({
        nowMs: utc(2026, 10, 19, 8, 0),
        timeZone: BOGOTA,
        sunriseByDate: new Map([['2026-10-19', null]]),
      }),
    ).toEqual({ kind: 'no-current-night' });
  });

  it('recalculates the current night across local midnight and sunrise', () => {
    const sunriseByDate = new Map<string, string | null>([
      [DOMAIN_DATES.bogotaNight, '2026-10-19T06:00'],
      [DOMAIN_DATES.nextBogotaNight, '2026-10-20T06:00'],
    ]);

    expect(
      getCurrentNightDate({
        nowMs: utc(2026, 10, 20, 4, 59),
        timeZone: BOGOTA,
        sunriseByDate,
      }),
    ).toEqual({ kind: 'night', date: DOMAIN_DATES.bogotaNight });

    expect(
      getCurrentNightDate({
        nowMs: utc(2026, 10, 20, 5, 1),
        timeZone: BOGOTA,
        sunriseByDate,
      }),
    ).toEqual({ kind: 'night', date: DOMAIN_DATES.bogotaNight });

    expect(
      getCurrentNightDate({
        nowMs: utc(2026, 10, 20, 11, 1),
        timeZone: BOGOTA,
        sunriseByDate,
      }),
    ).toEqual({ kind: 'night', date: DOMAIN_DATES.nextBogotaNight });
  });

  it('returns no-current-night during the polar day in Oslo', () => {
    expect(
      getCurrentNightDate({
        nowMs: utc(2026, 6, 21, 12, 0),
        timeZone: OSLO,
        sunriseByDate: new Map([[DOMAIN_DATES.osloSummerDay, null]]),
      }),
    ).toEqual({ kind: 'no-current-night' });
  });

  it('uses the place zone when DST changes the offset', () => {
    const sunriseByDate = new Map<string, string | null>([['2026-11-01', '2026-11-01T06:30']]);

    expect(
      getCurrentNightDate({
        nowMs: utc(2026, 11, 1, 8, 0),
        timeZone: NEW_YORK,
        sunriseByDate,
      }),
    ).toEqual({ kind: 'night', date: '2026-10-31' });

    expect(
      getCurrentNightDate({
        nowMs: utc(2026, 11, 1, 20, 0),
        timeZone: NEW_YORK,
        sunriseByDate,
      }),
    ).toEqual({ kind: 'night', date: '2026-11-01' });
  });
});
