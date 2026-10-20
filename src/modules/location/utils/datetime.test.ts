import { describe, expect, it } from 'vitest';
import {
  ADD_DAYS_CASES,
  DATE_PARAM_CASES,
  DOMAIN_DATES,
  LOCAL_DATE_TIME_CASES,
  TIME_ZONES,
  utc,
} from '@/modules/location/utils/__fixtures__/domain-fixtures';
import {
  addDays,
  formatLocalDate,
  formatLocalTime,
  getLocalMidnightMs,
  getNightDateRange,
  getTodayLocalDate,
  isValidDateString,
  parseDateParam,
  parseLocalDateTime,
} from '@/modules/location/utils/datetime';

const BOGOTA = TIME_ZONES.bogota;
const NEW_YORK = TIME_ZONES.newYork;
const SANTIAGO = TIME_ZONES.santiago;
const TOKYO = TIME_ZONES.tokyo;

describe('parseLocalDateTime matrix', () => {
  it.each(LOCAL_DATE_TIME_CASES)(
    'converts $localIso in $timeZone',
    ({ localIso, timeZone, expectedMs }) => {
      expect(parseLocalDateTime(localIso, timeZone)).toBe(expectedMs);
    },
  );
});

describe('parseLocalDateTime', () => {
  it('converts a Bogota wall time to UTC (fixed offset -05:00)', () => {
    expect(parseLocalDateTime('2026-10-19T18:00', BOGOTA)).toBe(utc(2026, 10, 19, 23, 0));
  });

  it('accepts an optional seconds component', () => {
    expect(parseLocalDateTime('2026-10-19T18:00:30', BOGOTA)).toBe(
      utc(2026, 10, 19, 23, 0) + 30_000,
    );
  });

  it('applies daylight saving time in New York', () => {
    expect(parseLocalDateTime('2026-07-01T12:00', NEW_YORK)).toBe(utc(2026, 7, 1, 16, 0));
    expect(parseLocalDateTime('2026-12-01T12:00', NEW_YORK)).toBe(utc(2026, 12, 1, 17, 0));
  });

  it('applies the southern hemisphere offset in Santiago', () => {
    expect(parseLocalDateTime('2026-10-19T18:00', SANTIAGO)).toBe(utc(2026, 10, 19, 21, 0));
  });

  it('resolves an ambiguous fall-back time to its first occurrence', () => {
    expect(parseLocalDateTime('2026-11-01T01:30', NEW_YORK)).toBe(utc(2026, 11, 1, 5, 30));
  });

  it('resolves a nonexistent spring-forward time to the later instant', () => {
    expect(parseLocalDateTime('2026-03-08T02:30', NEW_YORK)).toBe(utc(2026, 3, 8, 7, 30));
  });

  it('rejects malformed values and impossible calendar dates', () => {
    const invalidValues = [
      '2026-10-19',
      '2026-10-19 18:00',
      '2026-10-19T18',
      '2026-02-30T10:00',
      '2026-13-01T10:00',
      '2026-10-19T24:00',
      '2026-10-19T10:60',
    ];

    for (const value of invalidValues) {
      expect(() => parseLocalDateTime(value, BOGOTA)).toThrow(RangeError);
    }
  });
});

describe('formatLocalDate and formatLocalTime', () => {
  it('formats an instant in the place time zone, not the device zone', () => {
    expect(formatLocalDate(utc(2026, 10, 20, 3, 0), BOGOTA)).toBe('2026-10-19');
    expect(formatLocalTime(utc(2026, 10, 20, 3, 0), BOGOTA)).toBe('22:00');
  });

  it('formats midnight as 00:00', () => {
    expect(formatLocalTime(utc(2026, 10, 19, 5, 0), BOGOTA)).toBe('00:00');
  });

  it('crosses the calendar date when the zone is ahead of UTC', () => {
    expect(formatLocalDate(utc(2026, 10, 19, 20, 0), TOKYO)).toBe('2026-10-20');
    expect(formatLocalTime(utc(2026, 10, 19, 20, 0), TOKYO)).toBe('05:00');
  });

  it('round-trips a local date-time through the place zone', () => {
    const instantMs = parseLocalDateTime('2026-10-19T18:00', BOGOTA);

    expect(formatLocalDate(instantMs, BOGOTA)).toBe('2026-10-19');
    expect(formatLocalTime(instantMs, BOGOTA)).toBe('18:00');
  });
});

describe('getTodayLocalDate', () => {
  it('returns the place calendar date at the same instant', () => {
    const nowMs = utc(2026, 10, 20, 3, 0);

    expect(getTodayLocalDate(nowMs, BOGOTA)).toBe('2026-10-19');
    expect(getTodayLocalDate(nowMs, TOKYO)).toBe('2026-10-20');
  });
});

describe('getLocalMidnightMs', () => {
  it('returns the UTC instant of local midnight', () => {
    expect(getLocalMidnightMs('2026-10-19', BOGOTA)).toBe(utc(2026, 10, 19, 5, 0));
    expect(getLocalMidnightMs('2026-03-08', NEW_YORK)).toBe(utc(2026, 3, 8, 5, 0));
  });

  it('advances to the first existing instant when local midnight is skipped', () => {
    expect(getLocalMidnightMs(DOMAIN_DATES.santiagoDstStart, SANTIAGO)).toBe(utc(2026, 9, 6, 4, 0));
  });

  it('rejects an invalid date', () => {
    expect(() => getLocalMidnightMs('2026-02-30', BOGOTA)).toThrow(RangeError);
  });
});

describe('addDays', () => {
  it('crosses month and year boundaries', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('handles leap years', () => {
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
    expect(addDays('2028-03-01', -1)).toBe('2028-02-29');
    expect(addDays('2027-02-28', 1)).toBe('2027-03-01');
  });

  it('adds and subtracts multi-day deltas', () => {
    expect(addDays('2026-10-19', 14)).toBe('2026-11-02');
    expect(addDays('2026-10-19', -3)).toBe('2026-10-16');
  });

  it('rejects invalid dates and non-integer deltas', () => {
    expect(() => addDays('2026-02-30', 1)).toThrow(RangeError);
    expect(() => addDays('2026-10-19', 1.5)).toThrow(RangeError);
  });
});

describe('addDays matrix', () => {
  it.each(ADD_DAYS_CASES)('$date + $delta = $expected', ({ date, delta, expected }) => {
    expect(addDays(date, delta)).toBe(expected);
  });
});

describe('isValidDateString', () => {
  it('accepts real calendar dates, including leap days', () => {
    const validDates = ['2026-10-19', '2026-12-31', '2028-02-29', '2000-02-29'];

    for (const value of validDates) {
      expect(isValidDateString(value)).toBe(true);
    }
  });

  it('rejects malformed strings and impossible days', () => {
    const invalidDates = [
      '',
      '2026-1-01',
      '19-10-2026',
      '2026-10-19T00:00',
      '2026-13-01',
      '2026-00-10',
      '2026-01-00',
      '2026-04-31',
      '2026-02-29',
      '1900-02-29',
      'abcd-ef-gh',
    ];

    for (const value of invalidDates) {
      expect(isValidDateString(value)).toBe(false);
    }
  });
});

describe('getNightDateRange', () => {
  it('returns D = -3 to +14 relative to the place today', () => {
    expect(getNightDateRange('2026-10-19')).toEqual({
      min: '2026-10-16',
      max: '2026-11-02',
    });
  });

  it('crosses a year boundary', () => {
    expect(getNightDateRange('2026-12-25')).toEqual({
      min: '2026-12-22',
      max: '2027-01-08',
    });
  });

  it('crosses a leap day', () => {
    expect(getNightDateRange('2028-02-25')).toEqual({
      min: '2028-02-22',
      max: '2028-03-10',
    });
  });
});

describe('parseDateParam matrix', () => {
  it.each(DATE_PARAM_CASES)('parses $value', ({ value, expected }) => {
    expect(parseDateParam(value, DOMAIN_DATES.dateParamToday)).toEqual(expected);
  });

  it('does not offer the incomplete night D = +15', () => {
    const date = addDays(DOMAIN_DATES.dateParamToday, 15);

    expect(parseDateParam(date, DOMAIN_DATES.dateParamToday)).toEqual({ kind: 'out-of-range' });
  });
});

describe('parseDateParam', () => {
  const TODAY = DOMAIN_DATES.dateParamToday;

  it('returns missing only when the parameter is absent', () => {
    expect(parseDateParam(null, TODAY)).toEqual({ kind: 'missing' });
  });

  it('returns invalid for malformed or impossible dates', () => {
    expect(parseDateParam('', TODAY)).toEqual({ kind: 'invalid' });
    expect(parseDateParam('2026-13-01', TODAY)).toEqual({ kind: 'invalid' });
    expect(parseDateParam('2026-10-19T00:00', TODAY)).toEqual({ kind: 'invalid' });
  });

  it('returns out-of-range beyond D = -3 to +14', () => {
    expect(parseDateParam('2026-10-15', TODAY)).toEqual({ kind: 'out-of-range' });
    expect(parseDateParam('2026-11-03', TODAY)).toEqual({ kind: 'out-of-range' });
  });

  it('accepts both inclusive range boundaries', () => {
    expect(parseDateParam('2026-10-16', TODAY)).toEqual({ kind: 'valid', date: '2026-10-16' });
    expect(parseDateParam('2026-11-02', TODAY)).toEqual({ kind: 'valid', date: '2026-11-02' });
    expect(parseDateParam('2026-10-19', TODAY)).toEqual({ kind: 'valid', date: '2026-10-19' });
  });
});
