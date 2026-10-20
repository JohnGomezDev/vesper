import type { TDateParamResult } from '@/modules/location/types/location.types';

const LOCAL_DATE_TIME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_SECOND = 1000;
const MS_PER_DAY = 86_400_000;
const NIGHT_PAST_DAYS = 3;
const NIGHT_FUTURE_DAYS = 14;

interface ILocalParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(timeZone: string): Intl.DateTimeFormat {
  const cached = formatterCache.get(timeZone);

  if (cached !== undefined) {
    return cached;
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    numberingSystem: 'latn',
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  formatterCache.set(timeZone, formatter);

  return formatter;
}

function readPart(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): number {
  const part = parts.find((candidate) => candidate.type === type);

  if (part === undefined) {
    throw new RangeError(`Intl.DateTimeFormat did not return the "${type}" part.`);
  }

  return Number(part.value);
}

function getLocalParts(instantMs: number, timeZone: string): ILocalParts {
  const parts = getFormatter(timeZone).formatToParts(instantMs);

  return {
    year: readPart(parts, 'year'),
    month: readPart(parts, 'month'),
    day: readPart(parts, 'day'),
    hour: readPart(parts, 'hour'),
    minute: readPart(parts, 'minute'),
    second: readPart(parts, 'second'),
  };
}

/**
 * Builds an epoch value from calendar components interpreted as UTC. The date is
 * set with `setUTCFullYear` so years from 0 to 99 are not remapped to 1900+.
 */
function utcMsFromParts(parts: ILocalParts): number {
  const date = new Date(0);

  date.setUTCFullYear(parts.year, parts.month - 1, parts.day);
  date.setUTCHours(parts.hour, parts.minute, parts.second, 0);

  return date.getTime();
}

/**
 * Offset of the zone at a given instant, in milliseconds east of UTC.
 */
function getOffsetMs(instantMs: number, timeZone: string): number {
  const localParts = getLocalParts(instantMs, timeZone);
  const localAsUtcMs = utcMsFromParts(localParts);
  const wholeSecondMs = Math.floor(instantMs / MS_PER_SECOND) * MS_PER_SECOND;

  return localAsUtcMs - wholeSecondMs;
}

function matchesLocalParts(instantMs: number, expected: ILocalParts, timeZone: string): boolean {
  const actual = getLocalParts(instantMs, timeZone);

  return (
    actual.year === expected.year &&
    actual.month === expected.month &&
    actual.day === expected.day &&
    actual.hour === expected.hour &&
    actual.minute === expected.minute &&
    actual.second === expected.second
  );
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getDaysInMonth(year: number, month: number): number {
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28;
  }

  return month === 4 || month === 6 || month === 9 || month === 11 ? 30 : 31;
}

function isValidDateParts(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12) {
    return false;
  }

  return day >= 1 && day <= getDaysInMonth(year, month);
}

function pad(value: number, length: number): string {
  return String(value).padStart(length, '0');
}

/**
 * Converts an Open-Meteo local wall-clock value (`2026-10-19T18:00`, no offset)
 * to an epoch in milliseconds.
 *
 * Algorithm: the wall-clock components are first interpreted as if they were
 * UTC (`wallClockMs`). The zone offsets one day before and one day after that
 * pseudo-instant are read with `Intl.DateTimeFormat`; each offset produces a
 * candidate instant (`wallClockMs - offset`). The candidates are formatted back
 * in the zone and the one whose local components match the input is returned.
 *
 * - Ambiguous wall times (DST fall-back) resolve to the first occurrence.
 * - Nonexistent wall times (DST spring-forward) resolve to the later instant,
 *   matching the usual "compatible" disambiguation.
 */
export function parseLocalDateTime(localIso: string, timeZone: string): number {
  const match = LOCAL_DATE_TIME_PATTERN.exec(localIso);

  if (match === null) {
    throw new RangeError(`Invalid local date-time: ${localIso}`);
  }

  const parts: ILocalParts = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
    second: match[6] === undefined ? 0 : Number(match[6]),
  };

  if (
    !isValidDateParts(parts.year, parts.month, parts.day) ||
    parts.hour > 23 ||
    parts.minute > 59 ||
    parts.second > 59
  ) {
    throw new RangeError(`Invalid local date-time: ${localIso}`);
  }

  const wallClockMs = utcMsFromParts(parts);
  const offsetBefore = getOffsetMs(wallClockMs - MS_PER_DAY, timeZone);
  const offsetAfter = getOffsetMs(wallClockMs + MS_PER_DAY, timeZone);

  if (offsetBefore === offsetAfter) {
    return wallClockMs - offsetBefore;
  }

  const candidateBefore = wallClockMs - offsetBefore;
  const candidateAfter = wallClockMs - offsetAfter;

  if (matchesLocalParts(candidateBefore, parts, timeZone)) {
    return candidateBefore;
  }

  if (matchesLocalParts(candidateAfter, parts, timeZone)) {
    return candidateAfter;
  }

  return Math.max(candidateBefore, candidateAfter);
}

export function formatLocalDate(instantMs: number, timeZone: string): string {
  const parts = getLocalParts(instantMs, timeZone);

  return `${pad(parts.year, 4)}-${pad(parts.month, 2)}-${pad(parts.day, 2)}`;
}

export function formatLocalTime(instantMs: number, timeZone: string): string {
  const parts = getLocalParts(instantMs, timeZone);

  return `${pad(parts.hour, 2)}:${pad(parts.minute, 2)}`;
}

export function getTodayLocalDate(nowMs: number, timeZone: string): string {
  return formatLocalDate(nowMs, timeZone);
}

export function getLocalMidnightMs(date: string, timeZone: string): number {
  if (!isValidDateString(date)) {
    throw new RangeError(`Invalid date: ${date}`);
  }

  return parseLocalDateTime(`${date}T00:00:00`, timeZone);
}

/**
 * Adds calendar days to a `YYYY-MM-DD` string using UTC arithmetic only, so the
 * device time zone never participates.
 */
export function addDays(date: string, delta: number): string {
  if (!isValidDateString(date)) {
    throw new RangeError(`Invalid date: ${date}`);
  }

  if (!Number.isInteger(delta)) {
    throw new RangeError(`Invalid day delta: ${delta}`);
  }

  const [year, month, day] = date.split('-').map(Number);
  const shifted = new Date(utcMsFromParts({ year, month, day, hour: 0, minute: 0, second: 0 }));

  shifted.setUTCDate(shifted.getUTCDate() + delta);

  return `${pad(shifted.getUTCFullYear(), 4)}-${pad(shifted.getUTCMonth() + 1, 2)}-${pad(
    shifted.getUTCDate(),
    2,
  )}`;
}

export function isValidDateString(value: string): boolean {
  if (!DATE_PATTERN.test(value)) {
    return false;
  }

  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));

  return isValidDateParts(year, month, day);
}

export function getNightDateRange(todayLocal: string): { min: string; max: string } {
  return {
    min: addDays(todayLocal, -NIGHT_PAST_DAYS),
    max: addDays(todayLocal, NIGHT_FUTURE_DAYS),
  };
}

export function parseDateParam(value: string | null, todayLocal: string): TDateParamResult {
  if (value === null) {
    return { kind: 'missing' };
  }

  if (!isValidDateString(value)) {
    return { kind: 'invalid' };
  }

  const { min, max } = getNightDateRange(todayLocal);

  if (value < min || value > max) {
    return { kind: 'out-of-range' };
  }

  return { kind: 'valid', date: value };
}
