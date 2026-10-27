import { describe, expect, it } from 'vitest';
import { parseLocalDateTime } from '@/modules/location/utils/datetime';
import type { IHourlyRow } from '@/modules/weather/types/weather.types';
import { getNightSummary } from '@/modules/night/utils/night-summary';
import { computeHourlyScore, computeNightScore } from '@/modules/night/utils/score';

const BOGOTA = 'America/Bogota';
const T1 = Date.UTC(2026, 9, 20, 2, 0);
const T2 = T1 + 3_600_000;

describe('computeHourlyScore — cloud cuts', () => {
  it.each([
    { cloud: 15, expected: 100 },
    { cloud: 15.1, expected: 91.75 },
    { cloud: 30, expected: 91.75 },
    { cloud: 30.1, expected: 78 },
    { cloud: 50, expected: 78 },
    { cloud: 50.1, expected: 61.5 },
    { cloud: 70, expected: 61.5 },
    { cloud: 70.1, expected: 50.5 },
    { cloud: 85, expected: 50.5 },
    { cloud: 85.1, expected: 45 },
  ])('scores $cloud % cloud as $expected', ({ cloud, expected }) => {
    expect(
      computeHourlyScore({
        cloud,
        windKmh: 0,
        humidityPct: 50,
        precipitationProbabilityPct: 0,
      }),
    ).toBe(expected);
  });
});

describe('computeHourlyScore — wind cuts', () => {
  it.each([
    { windKmh: 5, expected: 100 },
    { windKmh: 5.1, expected: 96 },
    { windKmh: 10, expected: 96 },
    { windKmh: 10.1, expected: 90 },
    { windKmh: 15, expected: 90 },
    { windKmh: 15.1, expected: 84 },
    { windKmh: 20, expected: 84 },
    { windKmh: 20.1, expected: 80 },
  ])('scores $windKmh km/h as $expected', ({ windKmh, expected }) => {
    expect(
      computeHourlyScore({
        cloud: 0,
        windKmh,
        humidityPct: 50,
        precipitationProbabilityPct: 0,
      }),
    ).toBe(expected);
  });
});

describe('computeHourlyScore — humidity cuts', () => {
  it.each([
    { humidityPct: 70, expected: 100 },
    { humidityPct: 70.1, expected: 95.5 },
    { humidityPct: 80, expected: 95.5 },
    { humidityPct: 80.1, expected: 91 },
    { humidityPct: 90, expected: 91 },
    { humidityPct: 90.1, expected: 86.5 },
  ])('scores $humidityPct % humidity as $expected', ({ humidityPct, expected }) => {
    expect(
      computeHourlyScore({
        cloud: 0,
        windKmh: 0,
        humidityPct,
        precipitationProbabilityPct: 0,
      }),
    ).toBe(expected);
  });
});

describe('computeHourlyScore — rain cuts', () => {
  it.each([
    { precipitationProbabilityPct: 10, expected: 100 },
    { precipitationProbabilityPct: 10.1, expected: 97 },
    { precipitationProbabilityPct: 30, expected: 97 },
    { precipitationProbabilityPct: 30.1, expected: 93 },
    { precipitationProbabilityPct: 60, expected: 93 },
    { precipitationProbabilityPct: 60.1, expected: 90 },
  ])('scores $precipitationProbabilityPct % rain as $expected', (input) => {
    expect(
      computeHourlyScore({
        cloud: 0,
        windKmh: 0,
        humidityPct: 50,
        precipitationProbabilityPct: input.precipitationProbabilityPct,
      }),
    ).toBe(input.expected);
  });
});

describe('computeHourlyScore — missing values', () => {
  it.each([
    {
      label: 'cloud',
      input: { cloud: null, windKmh: 0, humidityPct: 50, precipitationProbabilityPct: 0 },
    },
    {
      label: 'wind',
      input: { cloud: 0, windKmh: null, humidityPct: 50, precipitationProbabilityPct: 0 },
    },
    {
      label: 'humidity',
      input: { cloud: 0, windKmh: 0, humidityPct: null, precipitationProbabilityPct: 0 },
    },
    {
      label: 'rain',
      input: { cloud: 0, windKmh: 0, humidityPct: 50, precipitationProbabilityPct: null },
    },
  ])('returns null when $label is missing', ({ input }) => {
    expect(computeHourlyScore(input)).toBeNull();
  });
});

describe('computeNightScore', () => {
  const allAbove = () => true;
  const allBelow = () => false;

  it('averages the valid hours and rounds no display digits', () => {
    const result = computeNightScore({
      hourlyScores: [
        { instantMs: T1, score: 100 },
        { instantMs: T2, score: 50 },
      ],
      moonIlluminationPct: 0,
      moonAboveHorizonByInstant: allAbove,
      validInstantMs: [T1, T2],
    });

    expect(result).toEqual({ score: 75, label: 'good' });
  });

  it('keeps hours with a null score out of the mean', () => {
    const result = computeNightScore({
      hourlyScores: [
        { instantMs: T1, score: 100 },
        { instantMs: T2, score: null },
      ],
      moonIlluminationPct: 0,
      moonAboveHorizonByInstant: allAbove,
      validInstantMs: [T1, T2],
    });

    expect(result).toEqual({ score: 100, label: 'excellent' });
  });

  it('ignores hourly scores outside the valid instants', () => {
    const result = computeNightScore({
      hourlyScores: [
        { instantMs: T1, score: 100 },
        { instantMs: T2, score: 0 },
      ],
      moonIlluminationPct: 0,
      moonAboveHorizonByInstant: allAbove,
      validInstantMs: [T1],
    });

    expect(result).toEqual({ score: 100, label: 'excellent' });
  });

  it('returns no score without valid hours', () => {
    expect(
      computeNightScore({
        hourlyScores: [{ instantMs: T1, score: 100 }],
        moonIlluminationPct: 0,
        moonAboveHorizonByInstant: allAbove,
        validInstantMs: [],
      }),
    ).toEqual({ score: null, label: null });
  });

  it('returns no score when every valid hour is null', () => {
    expect(
      computeNightScore({
        hourlyScores: [{ instantMs: T1, score: null }],
        moonIlluminationPct: 0,
        moonAboveHorizonByInstant: allAbove,
        validInstantMs: [T1],
      }),
    ).toEqual({ score: null, label: null });
  });

  it('applies the full Moon penalty with the Moon above all night', () => {
    expect(
      computeNightScore({
        hourlyScores: [
          { instantMs: T1, score: 100 },
          { instantMs: T2, score: 100 },
        ],
        moonIlluminationPct: 100,
        moonAboveHorizonByInstant: allAbove,
        validInstantMs: [T1, T2],
      }),
    ).toEqual({ score: 65, label: 'good' });
  });

  it('applies no penalty with the Moon below the horizon', () => {
    expect(
      computeNightScore({
        hourlyScores: [{ instantMs: T1, score: 100 }],
        moonIlluminationPct: 100,
        moonAboveHorizonByInstant: allBelow,
        validInstantMs: [T1],
      }),
    ).toEqual({ score: 100, label: 'excellent' });
  });

  it('scales the penalty with illumination and overlap', () => {
    const result = computeNightScore({
      hourlyScores: [
        { instantMs: T1, score: 100 },
        { instantMs: T2, score: 100 },
      ],
      moonIlluminationPct: 50,
      moonAboveHorizonByInstant: (instantMs) => instantMs === T1,
      validInstantMs: [T1, T2],
    });

    expect(result.score).toBeCloseTo(100 - 35 * Math.pow(0.5, 0.7) * 0.5, 3);
    expect(result.label).toBe('excellent');
  });

  it('clamps the score at 0 when the Moon penalty leaves it negative', () => {
    expect(
      computeNightScore({
        hourlyScores: [{ instantMs: T1, score: 20 }],
        moonIlluminationPct: 100,
        moonAboveHorizonByInstant: allAbove,
        validInstantMs: [T1],
      }),
    ).toEqual({ score: 0, label: 'bad' });
  });

  it.each([
    { score: 80, label: 'excellent' },
    { score: 79.9, label: 'good' },
    { score: 65, label: 'good' },
    { score: 64.9, label: 'fair' },
    { score: 50, label: 'fair' },
    { score: 49.9, label: 'bad' },
  ])('labels $score as $label', ({ score, label }) => {
    expect(
      computeNightScore({
        hourlyScores: [{ instantMs: T1, score }],
        moonIlluminationPct: 0,
        moonAboveHorizonByInstant: allBelow,
        validInstantMs: [T1],
      }),
    ).toEqual({ score, label });
  });
});

describe('getNightSummary', () => {
  function makeRow(overrides: Partial<IHourlyRow> = {}): IHourlyRow {
    return {
      time: '2026-10-19T20:00',
      cloudCover: 0,
      cloudCoverLow: 0,
      cloudCoverMid: 0,
      cloudCoverHigh: 0,
      visibility: 10_000,
      temperature: 10,
      relativeHumidity: 50,
      dewPoint: 5,
      windSpeed: 0,
      windGusts: 0,
      precipitationProbability: 0,
      precipitation: 0,
      isDay: 0,
      ...overrides,
    };
  }

  function summarize(
    hourly: IHourlyRow[],
    options: {
      sunAltitudeDeg?: number;
      moonAboveHorizonByInstant?: (instantMs: number) => boolean;
      moonIlluminationPct?: number;
    } = {},
  ) {
    const sunAltitudeDeg = options.sunAltitudeDeg ?? -20;
    const sunAltitudes = new Map<number, number>();

    for (const row of hourly) {
      sunAltitudes.set(parseLocalDateTime(row.time, BOGOTA), sunAltitudeDeg);
    }

    return getNightSummary({
      date: '2026-10-19',
      hourly,
      timeZone: BOGOTA,
      sunAltitudes,
      moonAboveHorizonByInstant: options.moonAboveHorizonByInstant ?? (() => false),
      moonIlluminationPct: options.moonIlluminationPct ?? 0,
    });
  }

  it('returns «no score» without hours under −18°', () => {
    const summary = summarize(
      [makeRow({ time: '2026-10-19T20:00' }), makeRow({ time: '2026-10-19T21:00' })],
      { sunAltitudeDeg: -10 },
    );

    expect(summary).toEqual({
      date: '2026-10-19',
      score: null,
      label: null,
      cloudAverage: null,
      rainLikely: false,
    });
  });

  it('treats exactly −18° as outside the astronomical night', () => {
    const summary = summarize([makeRow()], { sunAltitudeDeg: -18 });

    expect(summary.score).toBeNull();
  });

  it('scores the covered-sky example as 45 «Mala»', () => {
    const hourly = [
      makeRow({
        time: '2026-10-19T20:00',
        cloudCoverLow: 100,
        cloudCoverMid: 100,
        cloudCoverHigh: 100,
      }),
      makeRow({
        time: '2026-10-19T21:00',
        cloudCoverLow: 100,
        cloudCoverMid: 100,
        cloudCoverHigh: 100,
      }),
    ];
    const summary = summarize(hourly);

    expect(summary.score).toBe(45);
    expect(summary.label).toBe('bad');
    expect(summary.cloudAverage).toBe(100);
  });

  it('scores a perfect night under a full Moon as 65 «Buena»', () => {
    const hourly = [makeRow({ time: '2026-10-19T20:00' }), makeRow({ time: '2026-10-19T21:00' })];
    const summary = summarize(hourly, {
      moonIlluminationPct: 100,
      moonAboveHorizonByInstant: () => true,
    });

    expect(summary.score).toBe(65);
    expect(summary.label).toBe('good');
    expect(summary.cloudAverage).toBe(0);
  });

  it('flags rain likely at exactly 60 % and not at 59 %', () => {
    const likely = summarize([makeRow({ precipitationProbability: 60 })]);
    const unlikely = summarize([makeRow({ precipitationProbability: 59 })]);

    expect(likely.rainLikely).toBe(true);
    expect(unlikely.rainLikely).toBe(false);
  });

  it('does not flag rain without an astronomical night', () => {
    const summary = summarize([makeRow({ precipitationProbability: 100 })], {
      sunAltitudeDeg: -10,
    });

    expect(summary.rainLikely).toBe(false);
  });

  it('averages cloud only over hours with a known weighted value', () => {
    const hourly = [
      makeRow({
        time: '2026-10-19T20:00',
        cloudCoverLow: 20,
        cloudCoverMid: 20,
        cloudCoverHigh: 20,
      }),
      makeRow({ time: '2026-10-19T21:00', cloudCoverLow: null }),
    ];
    const summary = summarize(hourly);

    expect(summary.cloudAverage).toBe(20);
  });

  it('returns no score when every valid hour has a missing variable', () => {
    const hourly = [
      makeRow({ time: '2026-10-19T20:00', cloudCoverLow: null }),
      makeRow({ time: '2026-10-19T21:00', cloudCoverLow: null }),
    ];
    const summary = summarize(hourly);

    expect(summary).toEqual({
      date: '2026-10-19',
      score: null,
      label: null,
      cloudAverage: null,
      rainLikely: false,
    });
  });
});
