import { Body, Equator, Horizon, Observer, SearchAltitude, SearchRiseSet } from 'astronomy-engine';
import type {
  IHorizontalPosition,
  IObserver,
  ITwilightTimes,
  TSunTimes,
} from '@/modules/astronomy/types/astronomy.types';
import { formatLocalDate, getLocalMidnightMs } from '@/modules/location/utils/datetime';

/**
 * Refraction mode for every altitude/azimuth request (SPEC §5.4). The library
 * does not apply refraction by default; `"normal"` is the recommended mode.
 */
const REFRACTION = 'normal';
/** `SearchRiseSet` and `SearchAltitude` use numbers, not an enum: +1 rises, -1 sets. */
const RISE_DIRECTION = 1;
const SET_DIRECTION = -1;
/** Each event is searched from local midnight inside a one-day window. */
const SEARCH_LIMIT_DAYS = 1;
const NAUTICAL_TWILIGHT_ALTITUDE_DEG = -6;
const ASTRONOMICAL_TWILIGHT_ALTITUDE_DEG = -12;
const DEEP_TWILIGHT_ALTITUDE_DEG = -18;

function toEngineObserver(observer: IObserver): Observer {
  return new Observer(observer.latitude, observer.longitude, observer.elevationM);
}

/**
 * Resolves an event returned by astronomy-engine to an epoch in milliseconds,
 * but only when the event happens on the requested local date. A `null` event
 * (polar day or night) and an event outside that date both become `null`.
 */
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

/** Sun azimuth and altitude with refraction active (SPEC §5.4). */
export function getSunPosition(observer: IObserver, instantMs: number): IHorizontalPosition {
  const date = new Date(instantMs);
  const engineObserver = toEngineObserver(observer);
  const equator = Equator(Body.Sun, date, engineObserver, true, true);
  const horizontal = Horizon(date, engineObserver, equator.ra, equator.dec, REFRACTION);

  return {
    altitudeDeg: horizontal.altitude,
    azimuthDeg: horizontal.azimuth,
  };
}

/** Sun rise and set for the requested local date; `null` when they do not happen. */
export function getSunTimes(observer: IObserver, date: string, timeZone: string): TSunTimes {
  const startMs = getLocalMidnightMs(date, timeZone);
  const engineObserver = toEngineObserver(observer);

  const sunrise = SearchRiseSet(
    Body.Sun,
    engineObserver,
    RISE_DIRECTION,
    new Date(startMs),
    SEARCH_LIMIT_DAYS,
  );
  const sunset = SearchRiseSet(
    Body.Sun,
    engineObserver,
    SET_DIRECTION,
    new Date(startMs),
    SEARCH_LIMIT_DAYS,
  );

  return {
    sunriseMs: resolveEventOnLocalDate(sunrise, date, timeZone),
    sunsetMs: resolveEventOnLocalDate(sunset, date, timeZone),
  };
}

/**
 * Crossings of the Sun through −6°, −12° and −18° for the requested local date.
 * `SearchAltitude` intentionally does not apply refraction (SPEC §5.4): darkness
 * is defined by the geometric altitude of the Sun.
 */
export function getTwilightTimes(
  observer: IObserver,
  date: string,
  timeZone: string,
): ITwilightTimes {
  const startMs = getLocalMidnightMs(date, timeZone);
  const engineObserver = toEngineObserver(observer);

  const findCrossing = (direction: number, altitudeDeg: number): number | null => {
    const event = SearchAltitude(
      Body.Sun,
      engineObserver,
      direction,
      new Date(startMs),
      SEARCH_LIMIT_DAYS,
      altitudeDeg,
    );

    return resolveEventOnLocalDate(event, date, timeZone);
  };

  return {
    dusk6Ms: findCrossing(SET_DIRECTION, NAUTICAL_TWILIGHT_ALTITUDE_DEG),
    dawn6Ms: findCrossing(RISE_DIRECTION, NAUTICAL_TWILIGHT_ALTITUDE_DEG),
    dusk12Ms: findCrossing(SET_DIRECTION, ASTRONOMICAL_TWILIGHT_ALTITUDE_DEG),
    dawn12Ms: findCrossing(RISE_DIRECTION, ASTRONOMICAL_TWILIGHT_ALTITUDE_DEG),
    dusk18Ms: findCrossing(SET_DIRECTION, DEEP_TWILIGHT_ALTITUDE_DEG),
    dawn18Ms: findCrossing(RISE_DIRECTION, DEEP_TWILIGHT_ALTITUDE_DEG),
  };
}
