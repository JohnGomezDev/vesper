import type { TScoreLabel, TScoreStep } from '@/modules/night/types/night.types';

/** Cloud points (SPEC §8.6). The border belongs to the better step. */
export const CLOUD_SCORE_STEPS: readonly TScoreStep[] = [
  { max: 15, points: 100 },
  { max: 30, points: 85 },
  { max: 50, points: 60 },
  { max: 70, points: 30 },
  { max: 85, points: 10 },
];

export const CLOUD_SCORE_FALLBACK_POINTS = 0;

/** Wind points, mean speed without gusts (SPEC §8.6). */
export const WIND_SCORE_STEPS: readonly TScoreStep[] = [
  { max: 5, points: 100 },
  { max: 10, points: 80 },
  { max: 15, points: 50 },
  { max: 20, points: 20 },
];

export const WIND_SCORE_FALLBACK_POINTS = 0;

/** Relative humidity points (SPEC §8.6). */
export const HUMIDITY_SCORE_STEPS: readonly TScoreStep[] = [
  { max: 70, points: 100 },
  { max: 80, points: 70 },
  { max: 90, points: 40 },
];

export const HUMIDITY_SCORE_FALLBACK_POINTS = 10;

/** Precipitation probability points (SPEC §8.6). */
export const RAIN_SCORE_STEPS: readonly TScoreStep[] = [
  { max: 10, points: 100 },
  { max: 30, points: 70 },
  { max: 60, points: 30 },
];

export const RAIN_SCORE_FALLBACK_POINTS = 0;

/** Hourly weights from SPEC §8.6; they add up to 1. */
export const HOURLY_SCORE_WEIGHTS = {
  cloud: 0.55,
  wind: 0.2,
  humidity: 0.15,
  rain: 0.1,
} as const;

/** Maximum Moon penalty in points (SPEC §8.6). */
export const MOON_PENALTY_MAX_POINTS = 35;

/** Moon illumination exponent in the penalty (SPEC §8.6). */
export const MOON_PENALTY_EXPONENT = 0.7;

/** `rainLikely` when the maximum precipitation probability reaches 60 % (SPEC §8.2). */
export const RAIN_LIKELY_THRESHOLD_PCT = 60;

/** Night word thresholds (SPEC §8.6); the border belongs to the better word. */
export const SCORE_LABEL_THRESHOLDS = {
  excellent: 80,
  good: 65,
  fair: 50,
} as const;

export const SCORE_LABEL_TEXT: Record<TScoreLabel, string> = {
  excellent: 'Excelente',
  good: 'Buena',
  fair: 'Regular',
  bad: 'Mala',
};
