import type { TDateParamResult, TSlugParseResult } from '@/modules/location/types/location.types';
import type { TNightWindow } from '@/modules/night/types/night.types';

/**
 * Fixed zones for the domain test matrix. `Europe/Oslo` is used as the polar
 * reference (midnight sun in June, polar night in December).
 */
export const TIME_ZONES = {
  bogota: 'America/Bogota',
  newYork: 'America/New_York',
  santiago: 'America/Santiago',
  oslo: 'Europe/Oslo',
  tokyo: 'Asia/Tokyo',
} as const;

/**
 * Fixed local dates. They are always paired with an explicit zone in the tests,
 * never with the machine zone or the current time.
 */
export const DOMAIN_DATES = {
  bogotaNight: '2026-10-19',
  nextBogotaNight: '2026-10-20',
  newYorkFallBackNight: '2026-10-31',
  newYorkSpringForwardNight: '2026-03-07',
  santiagoWinterNight: '2026-06-21',
  santiagoDstStart: '2026-09-06',
  osloSummerDay: '2026-06-21',
  osloWinterDay: '2026-12-21',
  dateParamToday: '2026-10-19',
} as const;

export function utc(year: number, month: number, day: number, hour = 0, minute = 0): number {
  return Date.UTC(year, month - 1, day, hour, minute);
}

export type TCoordinateRoundingCase = {
  input: number;
  expected: number;
};

/** Values called out by T007 plus the T005 half-way and sign cases. */
export const COORDINATE_ROUNDING_CASES: readonly TCoordinateRoundingCase[] = [
  { input: 0, expected: 0 },
  { input: -0, expected: 0 },
  { input: 1.005, expected: 1.01 },
  { input: -1.005, expected: -1.01 },
  { input: 4.615, expected: 4.62 },
  { input: -74.085, expected: -74.09 },
  { input: 4.614, expected: 4.61 },
  { input: 4.616, expected: 4.62 },
  { input: -54.804, expected: -54.8 },
  { input: -68.296, expected: -68.3 },
  { input: -0.001, expected: 0 },
];

export const CURATED_SLUGS: ReadonlySet<string> = new Set(['bogota', 'ushuaia', 'villa-de-leyva']);

export type TSlugCase = {
  slug: string;
  expected: TSlugParseResult;
};

/** Valid forms from SPEC §6.2, including the inclusive coordinate boundaries. */
export const VALID_SLUG_CASES: readonly TSlugCase[] = [
  { slug: 'bogota', expected: { kind: 'curated', slug: 'bogota' } },
  {
    slug: 'villa-de-leyva_5.63_-73.52',
    expected: {
      kind: 'coordinates',
      label: 'villa-de-leyva',
      coordinates: { latitude: 5.63, longitude: -73.52 },
    },
  },
  {
    slug: 'ushuaia_-54.80_-68.30',
    expected: {
      kind: 'coordinates',
      label: 'ushuaia',
      coordinates: { latitude: -54.8, longitude: -68.3 },
    },
  },
  {
    slug: 'zipaquira_5.02_-73.99',
    expected: {
      kind: 'coordinates',
      label: 'zipaquira',
      coordinates: { latitude: 5.02, longitude: -73.99 },
    },
  },
  {
    slug: '4.61_-74.08',
    expected: {
      kind: 'coordinates',
      label: null,
      coordinates: { latitude: 4.61, longitude: -74.08 },
    },
  },
  {
    slug: 'bogota_4.61_-74.08',
    expected: {
      kind: 'coordinates',
      label: 'bogota',
      coordinates: { latitude: 4.61, longitude: -74.08 },
    },
  },
  {
    slug: '-90.00_-180.00',
    expected: {
      kind: 'coordinates',
      label: null,
      coordinates: { latitude: -90, longitude: -180 },
    },
  },
  {
    slug: '90.00_180.00',
    expected: {
      kind: 'coordinates',
      label: null,
      coordinates: { latitude: 90, longitude: 180 },
    },
  },
];

/** Invalid forms derived from the SPEC §6.2 parsing rules and coordinate ranges. */
export const INVALID_SLUGS: readonly string[] = [
  '',
  'zipaquira',
  '-74.08',
  '4.61',
  '4.6_-74.08',
  '4.610_-74.08',
  '4_-74.08',
  '.61_-74.08',
  '+4.61_-74.08',
  '4.61_+74.08',
  '91.00_0.00',
  '-91.00_0.00',
  '0.00_180.01',
  '0.00_-180.01',
  '4.61_-74.08_',
  '4.61_-74.08_extra',
  '4.61_-74',
  '4.61_-74.0',
  'a_b',
];

export type TLocalDateTimeCase = {
  localIso: string;
  timeZone: string;
  expectedMs: number;
};

/** Wall-clock conversions without DST, with DST and at both DST edges. */
export const LOCAL_DATE_TIME_CASES: readonly TLocalDateTimeCase[] = [
  {
    localIso: '2026-10-19T18:00',
    timeZone: TIME_ZONES.bogota,
    expectedMs: utc(2026, 10, 19, 23, 0),
  },
  {
    localIso: '2026-10-19T18:00:30',
    timeZone: TIME_ZONES.bogota,
    expectedMs: utc(2026, 10, 19, 23, 0) + 30_000,
  },
  {
    localIso: '2026-07-01T12:00',
    timeZone: TIME_ZONES.newYork,
    expectedMs: utc(2026, 7, 1, 16, 0),
  },
  {
    localIso: '2026-12-01T12:00',
    timeZone: TIME_ZONES.newYork,
    expectedMs: utc(2026, 12, 1, 17, 0),
  },
  {
    localIso: '2026-06-21T18:00',
    timeZone: TIME_ZONES.santiago,
    expectedMs: utc(2026, 6, 21, 22, 0),
  },
  {
    localIso: '2026-10-19T18:00',
    timeZone: TIME_ZONES.santiago,
    expectedMs: utc(2026, 10, 19, 21, 0),
  },
  {
    localIso: '2026-11-01T01:30',
    timeZone: TIME_ZONES.newYork,
    expectedMs: utc(2026, 11, 1, 5, 30),
  },
  {
    localIso: '2026-03-08T02:30',
    timeZone: TIME_ZONES.newYork,
    expectedMs: utc(2026, 3, 8, 7, 30),
  },
];

export type TAddDaysCase = {
  date: string;
  delta: number;
  expected: string;
};

/** Month-end, year-end, leap-year and range-boundary movements. */
export const ADD_DAYS_CASES: readonly TAddDaysCase[] = [
  { date: '2026-12-31', delta: 1, expected: '2027-01-01' },
  { date: '2026-01-01', delta: -1, expected: '2025-12-31' },
  { date: '2026-01-31', delta: 1, expected: '2026-02-01' },
  { date: '2026-03-01', delta: -1, expected: '2026-02-28' },
  { date: '2028-02-28', delta: 1, expected: '2028-02-29' },
  { date: '2028-03-01', delta: -1, expected: '2028-02-29' },
  { date: '2027-02-28', delta: 1, expected: '2027-03-01' },
  { date: '2026-10-19', delta: 14, expected: '2026-11-02' },
  { date: '2026-10-19', delta: -3, expected: '2026-10-16' },
  { date: '2026-10-19', delta: 0, expected: '2026-10-19' },
];

export type TDateParamCase = {
  value: string | null;
  expected: TDateParamResult;
};

/** Every branch of `parseDateParam`, with D = −3…+14 relative to 2026-10-19. */
export const DATE_PARAM_CASES: readonly TDateParamCase[] = [
  { value: null, expected: { kind: 'missing' } },
  { value: '', expected: { kind: 'invalid' } },
  { value: '2026-13-01', expected: { kind: 'invalid' } },
  { value: '2026-02-30', expected: { kind: 'invalid' } },
  { value: '2026-10-19T00:00', expected: { kind: 'invalid' } },
  { value: '2026-10-15', expected: { kind: 'out-of-range' } },
  { value: '2026-11-03', expected: { kind: 'out-of-range' } },
  { value: '2026-10-16', expected: { kind: 'valid', date: '2026-10-16' } },
  { value: '2026-11-02', expected: { kind: 'valid', date: '2026-11-02' } },
  { value: '2026-10-19', expected: { kind: 'valid', date: '2026-10-19' } },
];

export type TNightWindowCase = {
  date: string;
  sunset: string | null;
  sunriseNext: string | null;
  timeZone: string;
  expected: TNightWindow;
};

/** Standard, southern, DST-edge and polar window cases. */
export const NIGHT_WINDOW_CASES: readonly TNightWindowCase[] = [
  {
    date: DOMAIN_DATES.bogotaNight,
    sunset: '2026-10-19T18:00',
    sunriseNext: '2026-10-20T06:00',
    timeZone: TIME_ZONES.bogota,
    expected: {
      kind: 'available',
      startMs: utc(2026, 10, 19, 22, 0),
      endMs: utc(2026, 10, 20, 12, 0),
    },
  },
  {
    date: DOMAIN_DATES.santiagoWinterNight,
    sunset: '2026-06-21T17:45',
    sunriseNext: '2026-06-22T07:50',
    timeZone: TIME_ZONES.santiago,
    expected: {
      kind: 'available',
      startMs: utc(2026, 6, 21, 20, 45),
      endMs: utc(2026, 6, 22, 12, 50),
    },
  },
  {
    date: DOMAIN_DATES.newYorkFallBackNight,
    sunset: '2026-10-31T17:50',
    sunriseNext: '2026-11-01T06:30',
    timeZone: TIME_ZONES.newYork,
    expected: {
      kind: 'available',
      startMs: utc(2026, 10, 31, 20, 50),
      endMs: utc(2026, 11, 1, 12, 30),
    },
  },
  {
    date: DOMAIN_DATES.newYorkSpringForwardNight,
    sunset: '2026-03-07T17:55',
    sunriseNext: '2026-03-08T07:20',
    timeZone: TIME_ZONES.newYork,
    expected: {
      kind: 'available',
      startMs: utc(2026, 3, 7, 21, 55),
      endMs: utc(2026, 3, 8, 12, 20),
    },
  },
  {
    date: DOMAIN_DATES.osloSummerDay,
    sunset: null,
    sunriseNext: '2026-06-22T02:00',
    timeZone: TIME_ZONES.oslo,
    expected: { kind: 'no-astronomical-night' },
  },
  {
    date: DOMAIN_DATES.osloSummerDay,
    sunset: '2026-06-21T23:00',
    sunriseNext: null,
    timeZone: TIME_ZONES.oslo,
    expected: { kind: 'no-astronomical-night' },
  },
  {
    date: DOMAIN_DATES.osloWinterDay,
    sunset: null,
    sunriseNext: null,
    timeZone: TIME_ZONES.oslo,
    expected: { kind: 'no-astronomical-night' },
  },
];
