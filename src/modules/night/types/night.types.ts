import type { TPlanetId } from '@/modules/astronomy/types/astronomy.types';

export type TNightWindow =
  { kind: 'available'; startMs: number; endMs: number } | { kind: 'no-astronomical-night' };

export type TDailySun = {
  date: string;
  sunrise: string | null;
  sunset: string | null;
};

/** Weighted cloud cover class (SPEC §8.5): the border belongs to the better class. */
export type TCloudClass = 'ideal' | 'good' | 'acceptable' | 'fair' | 'poor';

/** The eight conventional Moon phases (SPEC §8.4). */
export type TMoonPhase =
  | 'new-moon'
  | 'waxing-crescent'
  | 'first-quarter'
  | 'waxing-gibbous'
  | 'full-moon'
  | 'waning-gibbous'
  | 'last-quarter'
  | 'waning-crescent';

/** Icon identifier for a Moon phase; T022 maps it to the rendered drawing. */
export type TMoonIconKey = TMoonPhase;

/** Visibility label of an observation target (SPEC §8.5.3). */
export type TBrightnessLabel = 'naked-eye' | 'binoculars' | 'telescope';

/** Required Sun altitude per target, cumulative in the SPEC (SPEC §4, §8.5.2). */
export type TRequiredDarkness = -6 | -12 | -18;

/**
 * Continuous interval in which a target passes every observation filter
 * (SPEC §8.5). The Sun never produces one.
 */
export interface IObservationWindow {
  objectId: TPlanetId | 'moon';
  startMs: number;
  endMs: number;
  peakAltitudeDeg: number;
  culminationMs: number;
  culminationApproximate: boolean;
  worstCloudClass: TCloudClass | 'unknown';
  /** Only Uranus and Neptune report it: the highlighted Moon-free window. */
  moonFree: boolean;
  brightnessLabel: TBrightnessLabel;
}

/** Moon–planet proximity warning (SPEC §8.5.5). It is per object, not per night. */
export interface IMoonInterferenceNotice {
  objectId: TPlanetId;
  separationDeg: number;
  /** Separation below 5°, the strong warning. */
  strong: boolean;
}

/** Night quality word (SPEC §8.6): the border belongs to the better word. */
export type TScoreLabel = 'excellent' | 'good' | 'fair' | 'bad';

/** Summary shown by the night selector (SPEC §8.2, §8.6). */
export interface INightSummary {
  date: string;
  score: number | null;
  label: TScoreLabel | null;
  cloudAverage: number | null;
  rainLikely: boolean;
}

/** Hourly score used to build the night average. */
export interface IHourlyScore {
  instantMs: number;
  score: number | null;
}
