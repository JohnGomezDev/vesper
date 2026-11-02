import { OPEN_METEO_FORECAST_URL } from '@/lib/constants/api.constants';
import {
  isNullableNumberArray,
  isNullableStringArray,
  isRecord,
  isStringArray,
} from '@/lib/utils/validation';
import type { ICoordinates } from '@/modules/location/types/location.types';
import { roundCoordinates } from '@/modules/location/utils/coordinates';
import {
  DAILY_VARIABLES,
  FORECAST_DAYS,
  FORECAST_PAST_DAYS,
  HOURLY_NUMBER_FIELDS,
  HOURLY_VARIABLES,
} from '@/modules/weather/constants/weather.constants';
import type {
  IDailyData,
  IForecastResponse,
  IHourlyData,
} from '@/modules/weather/types/weather.types';

function isHourlyData(value: unknown): value is IHourlyData {
  if (!isRecord(value) || !isStringArray(value.time)) {
    return false;
  }

  return HOURLY_NUMBER_FIELDS.every((field) => isNullableNumberArray(value[field]));
}

function isDailyData(value: unknown): value is IDailyData {
  if (!isRecord(value) || !isStringArray(value.time)) {
    return false;
  }

  return isNullableStringArray(value.sunrise) && isNullableStringArray(value.sunset);
}

export function isForecastResponse(value: unknown): value is IForecastResponse {
  if (!isRecord(value)) {
    return false;
  }

  if (
    typeof value.latitude !== 'number' ||
    typeof value.longitude !== 'number' ||
    typeof value.elevation !== 'number' ||
    typeof value.timezone !== 'string'
  ) {
    return false;
  }

  return isHourlyData(value.hourly) && isDailyData(value.daily);
}

export function buildForecastUrl(coordinates: ICoordinates): string {
  const rounded = roundCoordinates(coordinates);
  const params = new URLSearchParams({
    latitude: String(rounded.latitude),
    longitude: String(rounded.longitude),
    hourly: HOURLY_VARIABLES.join(','),
    daily: DAILY_VARIABLES.join(','),
    timezone: 'auto',
    past_days: FORECAST_PAST_DAYS,
    forecast_days: FORECAST_DAYS,
  });

  return `${OPEN_METEO_FORECAST_URL}?${params.toString()}`;
}
