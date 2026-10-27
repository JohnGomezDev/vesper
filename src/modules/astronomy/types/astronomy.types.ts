/**
 * Astronomical observer. `elevationM` is the altitude already resolved from the
 * forecast response (SPEC §5.1 and §5.4); it is always a number, even when the
 * real altitude is unknown (then it is 0 and the unknown value is logged).
 */
export interface IObserver {
  latitude: number;
  longitude: number;
  elevationM: number;
}

/** Apparent horizontal position, with atmospheric refraction applied. */
export interface IHorizontalPosition {
  altitudeDeg: number;
  azimuthDeg: number;
}

/** Sun rise and set instants for one local date, in epoch milliseconds. */
export type TSunTimes = {
  sunriseMs: number | null;
  sunsetMs: number | null;
};

/**
 * Sun crossings of the three twilight altitudes for one local date, in epoch
 * milliseconds. `dawn*` is the ascending crossing and `dusk*` the descending
 * one; each field is `null` when the crossing does not happen that date.
 */
export interface ITwilightTimes {
  dusk6Ms: number | null;
  dawn6Ms: number | null;
  dusk12Ms: number | null;
  dawn12Ms: number | null;
  dusk18Ms: number | null;
  dawn18Ms: number | null;
}

/** Moon phase as the Sun–Moon ecliptic angle and the illuminated fraction. */
export interface IMoonPhase {
  /** Ecliptic longitude difference, normalized to `[0, 360)`. */
  angleDeg: number;
  /** Illuminated fraction in `[0, 1]`. */
  illuminationFraction: number;
}

/**
 * Moon data for one local date. The phase and the position are evaluated at
 * local midnight (SPEC §8.4); rise and set belong to that local date.
 */
export interface IMoonInfo extends IMoonPhase {
  position: IHorizontalPosition;
  riseMs: number | null;
  setMs: number | null;
}

export type TPlanetId = 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune';

/**
 * Planet data for one instant. `elongationDeg` is only numeric for Mercury and
 * Venus; `separationFromMoonDeg` uses `AngleBetween` on equatorial vectors
 * (SPEC §5.4). Culmination is native (`SearchHourAngle`), so it is not
 * approximate; T014 only fills it when the native value is missing.
 */
export interface IPlanetInfo {
  id: TPlanetId;
  position: IHorizontalPosition;
  magnitude: number;
  elongationDeg: number | null;
  separationFromMoonDeg: number | null;
  culminationMs: number | null;
  culminationApproximate: boolean;
}

/**
 * One instant of the 10-minute sampling along the visible strip (SPEC §8.5).
 * Every object is computed once per instant, so consumers never recompute the
 * same positions for the same range.
 */
export interface INightSample {
  instantMs: number;
  sun: IHorizontalPosition;
  moon: IHorizontalPosition;
  planets: Record<TPlanetId, IHorizontalPosition>;
}
