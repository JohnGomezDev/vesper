import {
  AngleBetween,
  Body,
  Elongation,
  Equator,
  Horizon,
  Illumination,
  Observer,
  SearchHourAngle,
} from 'astronomy-engine';
import type {
  IHorizontalPosition,
  IObserver,
  IPlanetInfo,
  TPlanetId,
} from '@/modules/astronomy/types/astronomy.types';

const REFRACTION = 'normal';
const HOUR_ANGLE_MERIDIAN = 0;
const DEGREES_PER_RADIAN = 180 / Math.PI;
const RADIANS_PER_DEGREE = Math.PI / 180;

/** astronomy-engine body for each supported planet, in `TPlanetId` order. */
const PLANET_BODIES: Record<TPlanetId, Body> = {
  mercury: Body.Mercury,
  venus: Body.Venus,
  mars: Body.Mars,
  jupiter: Body.Jupiter,
  saturn: Body.Saturn,
  uranus: Body.Uranus,
  neptune: Body.Neptune,
};

/** Only Mercury and Venus report a meaningful elongation from the Sun. */
const ELONGATION_PLANETS: ReadonlySet<TPlanetId> = new Set<TPlanetId>(['mercury', 'venus']);

function toEngineObserver(observer: IObserver): Observer {
  return new Observer(observer.latitude, observer.longitude, observer.elevationM);
}

function toHorizontalPosition(
  body: Body,
  engineObserver: Observer,
  instantMs: number,
): IHorizontalPosition {
  const date = new Date(instantMs);
  const equator = Equator(body, date, engineObserver, true, true);
  const horizontal = Horizon(date, engineObserver, equator.ra, equator.dec, REFRACTION);

  return {
    altitudeDeg: horizontal.altitude,
    azimuthDeg: horizontal.azimuth,
  };
}

/**
 * Apparent planet position with refraction active. Exposed for reuse by the
 * 10-minute sampling (T014); it avoids the magnitude, elongation, separation
 * and culmination work of `getPlanetInfo` per sample.
 */
export function getPlanetPosition(
  observer: IObserver,
  planetId: TPlanetId,
  instantMs: number,
): IHorizontalPosition {
  return toHorizontalPosition(PLANET_BODIES[planetId], toEngineObserver(observer), instantMs);
}

/**
 * Angular separation between two apparent horizontal positions, in degrees.
 *
 * The declared signature receives `IHorizontalPosition` values, not the
 * equatorial vectors that `AngleBetween` needs (SPEC §5.4), so the equivalent
 * spherical law of cosines is applied to the same horizontal coordinates. The
 * result is the actual angle between both sky directions.
 */
export function getAngularSeparation(a: IHorizontalPosition, b: IHorizontalPosition): number {
  const altitudeARad = a.altitudeDeg * RADIANS_PER_DEGREE;
  const altitudeBRad = b.altitudeDeg * RADIANS_PER_DEGREE;
  const azimuthDeltaRad = (a.azimuthDeg - b.azimuthDeg) * RADIANS_PER_DEGREE;

  const cosine =
    Math.sin(altitudeARad) * Math.sin(altitudeBRad) +
    Math.cos(altitudeARad) * Math.cos(altitudeBRad) * Math.cos(azimuthDeltaRad);
  const clampedCosine = Math.min(1, Math.max(-1, cosine));

  return Math.acos(clampedCosine) * DEGREES_PER_RADIAN;
}

/**
 * Planet data at one instant. The Moon separation uses `AngleBetween` on
 * equatorial vectors, exactly as confirmed in T002 (SPEC §5.4). Culmination is
 * native and therefore not approximate.
 */
export function getPlanetInfo(
  observer: IObserver,
  planetId: TPlanetId,
  instantMs: number,
): IPlanetInfo {
  const date = new Date(instantMs);
  const body = PLANET_BODIES[planetId];
  const engineObserver = toEngineObserver(observer);

  const equator = Equator(body, date, engineObserver, true, true);
  const horizontal = Horizon(date, engineObserver, equator.ra, equator.dec, REFRACTION);
  const moonEquator = Equator(Body.Moon, date, engineObserver, true, true);
  const culmination = SearchHourAngle(body, engineObserver, HOUR_ANGLE_MERIDIAN, date);
  const elongation = ELONGATION_PLANETS.has(planetId) ? Elongation(body, date) : null;

  return {
    id: planetId,
    position: {
      altitudeDeg: horizontal.altitude,
      azimuthDeg: horizontal.azimuth,
    },
    magnitude: Illumination(body, date).mag,
    elongationDeg: elongation === null ? null : elongation.elongation,
    separationFromMoonDeg: AngleBetween(equator.vec, moonEquator.vec),
    culminationMs: culmination.time.date.getTime(),
    culminationApproximate: false,
  };
}
