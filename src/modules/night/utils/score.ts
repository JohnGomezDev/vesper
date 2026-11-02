import {
  CLOUD_SCORE_FALLBACK_POINTS,
  CLOUD_SCORE_STEPS,
  HOURLY_SCORE_WEIGHTS,
  HUMIDITY_SCORE_FALLBACK_POINTS,
  HUMIDITY_SCORE_STEPS,
  MOON_PENALTY_EXPONENT,
  MOON_PENALTY_MAX_POINTS,
  RAIN_SCORE_FALLBACK_POINTS,
  RAIN_SCORE_STEPS,
  SCORE_LABEL_THRESHOLDS,
  WIND_SCORE_FALLBACK_POINTS,
  WIND_SCORE_STEPS,
} from '@/modules/night/constants/score.constants';
import type { IHourlyScore, TScoreLabel, TScoreStep } from '@/modules/night/types/night.types';

/**
 * Precision hygiene for binary floating point, not display rounding: the result
 * keeps every decimal of the formula (T017 authorized decision).
 */
const SCORE_PRECISION_FACTOR = 1_000_000;

function normalizeScore(value: number): number {
  return Math.round(value * SCORE_PRECISION_FACTOR) / SCORE_PRECISION_FACTOR;
}

function pointsFor(value: number, steps: readonly TScoreStep[], fallback: number): number {
  for (const step of steps) {
    if (value <= step.max) {
      return step.points;
    }
  }

  return fallback;
}

/**
 * Hourly quality score from 0 to 100 (SPEC §8.6):
 * `0,55·cloud + 0,20·wind + 0,15·humidity + 0,10·rain`.
 *
 * A missing variable returns `null`: the hour stays out of the night mean and
 * is never replaced by zero.
 */
export function computeHourlyScore(input: {
  cloud: number | null;
  windKmh: number | null;
  humidityPct: number | null;
  precipitationProbabilityPct: number | null;
}): number | null {
  const { cloud, windKmh, humidityPct, precipitationProbabilityPct } = input;

  if (
    cloud === null ||
    windKmh === null ||
    humidityPct === null ||
    precipitationProbabilityPct === null
  ) {
    return null;
  }

  const cloudPoints = pointsFor(cloud, CLOUD_SCORE_STEPS, CLOUD_SCORE_FALLBACK_POINTS);
  const windPoints = pointsFor(windKmh, WIND_SCORE_STEPS, WIND_SCORE_FALLBACK_POINTS);
  const humidityPoints = pointsFor(
    humidityPct,
    HUMIDITY_SCORE_STEPS,
    HUMIDITY_SCORE_FALLBACK_POINTS,
  );
  const rainPoints = pointsFor(
    precipitationProbabilityPct,
    RAIN_SCORE_STEPS,
    RAIN_SCORE_FALLBACK_POINTS,
  );

  return normalizeScore(
    HOURLY_SCORE_WEIGHTS.cloud * cloudPoints +
      HOURLY_SCORE_WEIGHTS.wind * windPoints +
      HOURLY_SCORE_WEIGHTS.humidity * humidityPoints +
      HOURLY_SCORE_WEIGHTS.rain * rainPoints,
  );
}

function getScoreLabel(score: number): TScoreLabel {
  if (score >= SCORE_LABEL_THRESHOLDS.excellent) {
    return 'excellent';
  }

  if (score >= SCORE_LABEL_THRESHOLDS.good) {
    return 'good';
  }

  if (score >= SCORE_LABEL_THRESHOLDS.fair) {
    return 'fair';
  }

  return 'bad';
}

/**
 * Night score (SPEC §8.6): mean of the valid hourly scores minus the Moon
 * penalty `35 × (illumination/100)^0,7 × overlap`, clamped at 0.
 *
 * Valid hours are the instants under −18° supplied in `validInstantMs`; hours
 * with a `null` score stay out of the mean but still count for the Moon overlap
 * fraction. Without any valid hour there is no score.
 */
export function computeNightScore(input: {
  hourlyScores: IHourlyScore[];
  moonIlluminationPct: number;
  moonAboveHorizonByInstant: (instantMs: number) => boolean;
  validInstantMs: number[];
}): { score: number | null; label: TScoreLabel | null } {
  const { hourlyScores, moonIlluminationPct, moonAboveHorizonByInstant, validInstantMs } = input;

  if (validInstantMs.length === 0) {
    return { score: null, label: null };
  }

  const validInstants = new Set(validInstantMs);
  const scoredValues: number[] = [];

  for (const hour of hourlyScores) {
    if (validInstants.has(hour.instantMs) && hour.score !== null) {
      scoredValues.push(hour.score);
    }
  }

  if (scoredValues.length === 0) {
    return { score: null, label: null };
  }

  const average = scoredValues.reduce((total, value) => total + value, 0) / scoredValues.length;
  const moonAboveCount = validInstantMs.filter((instantMs) =>
    moonAboveHorizonByInstant(instantMs),
  ).length;
  const overlap = moonAboveCount / validInstantMs.length;
  const moonPenalty =
    MOON_PENALTY_MAX_POINTS * Math.pow(moonIlluminationPct / 100, MOON_PENALTY_EXPONENT) * overlap;
  const score = normalizeScore(Math.max(0, average - moonPenalty));

  return { score, label: getScoreLabel(score) };
}
