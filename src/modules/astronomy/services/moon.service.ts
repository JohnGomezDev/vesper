import {
  Body,
  Equator,
  Horizon,
  Illumination,
  MoonPhase,
  Observer,
  SearchRiseSet,
} from 'astronomy-engine';
import type {
  IHorizontalPosition,
  IMoonInfo,
  IMoonPhase,
  IObserver,
} from '@/modules/astronomy/types/astronomy.types';
import { formatLocalDate, getLocalMidnightMs } from '@/modules/location/utils/datetime';

const FULL_CIRCLE_DEG = 360;
const REFRACTION = 'normal';
/** `SearchRiseSet` directions are numbers: +1 rises, -1 sets. */
const RISE_DIRECTION = 1;
const SET_DIRECTION = -1;
const SEARCH_LIMIT_DAYS = 1;

function toEngineObserver(observer: IObserver): Observer {
  return new Observer(observer.latitude, observer.longitude, observer.elevationM);
}

/** Normalizes an angle in degrees to the semi-open interval `[0, 360)`. */
function normalizeAngle(angleDeg: number): number {
  return ((angleDeg % FULL_CIRCLE_DEG) + FULL_CIRCLE_DEG) % FULL_CIRCLE_DEG;
}

function resolveEventOnLocalDate(
  event: { date: Date } | null,
  date: string,
  timeZone: string,
): number | null {
  if (event === null) {
    return null;
  }

  const eventMs = event.date.getTime();

  return formatLocalDate(eventMs, timeZone) === date ? eventMs : null;
}

/**
 * Moon phase at one instant, from astronomy-engine only (SPEC §5.4): the angle
 * is the Sun–Moon ecliptic longitude difference normalized to `[0, 360)` and
 * the illumination is the library's `phase_fraction` in `[0, 1]`.
 */
export function getMoonPhase(instantMs: number): IMoonPhase {
  const date = new Date(instantMs);

  return {
    angleDeg: normalizeAngle(MoonPhase(date)),
    illuminationFraction: Illumination(Body.Moon, date).phase_fraction,
  };
}

/**
 * Apparent Moon position with refraction active. Exposed for reuse by the
 * 10-minute sampling (T014); it avoids repeating the expensive rise/set
 * searches of `getMoonInfo` per sample.
 */
export function getMoonPosition(observer: IObserver, instantMs: number): IHorizontalPosition {
  const date = new Date(instantMs);
  const engineObserver = toEngineObserver(observer);
  const equator = Equator(Body.Moon, date, engineObserver, true, true);
  const horizontal = Horizon(date, engineObserver, equator.ra, equator.dec, REFRACTION);

  return {
    altitudeDeg: horizontal.altitude,
    azimuthDeg: horizontal.azimuth,
  };
}

/**
 * Moon phase and position at local midnight, plus the rise and set that happen
 * on the requested local date (SPEC §8.4). Missing events stay `null`.
 */
export function getMoonInfo(observer: IObserver, date: string, timeZone: string): IMoonInfo {
  const midnightMs = getLocalMidnightMs(date, timeZone);
  const engineObserver = toEngineObserver(observer);

  const rise = SearchRiseSet(
    Body.Moon,
    engineObserver,
    RISE_DIRECTION,
    new Date(midnightMs),
    SEARCH_LIMIT_DAYS,
  );
  const set = SearchRiseSet(
    Body.Moon,
    engineObserver,
    SET_DIRECTION,
    new Date(midnightMs),
    SEARCH_LIMIT_DAYS,
  );

  return {
    ...getMoonPhase(midnightMs),
    position: getMoonPosition(observer, midnightMs),
    riseMs: resolveEventOnLocalDate(rise, date, timeZone),
    setMs: resolveEventOnLocalDate(set, date, timeZone),
  };
}
