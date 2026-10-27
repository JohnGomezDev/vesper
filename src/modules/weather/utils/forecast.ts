import { OPEN_METEO_FORECAST_URL } from '@/lib/constants/api.constants';
import {
  isNullableNumberArray,
  isNullableStringArray,
  isRecord,
  isStringArray,
} from '@/lib/utils/validation';
import type { ICoordinates } from '@/modules/location/types/location.types';
import { roundCoordinates } from '@/modules/location/utils/coordinates';
import type {
  IDailyData,
  IForecastResponse,
  IHourlyData,
} from '@/modules/weather/types/weather.types';

const HOURLY_VARIABLES = [
  'cloud_cover',
  'cloud_cover_low',
  'cloud_cover_mid',
  'cloud_cover_high',
  'visibility',
  'temperature_2m',
  'relative_humidity_2m',
  'dew_point_2m',
  'wind_speed_10m',
  'wind_gusts_10m',
  'precipitation_probability',
  'precipitation',
  'is_day',
] as const;

const DAILY_VARIABLES = ['sunrise', 'sunset'] as const;

const HOURLY_NUMBER_FIELDS = [
  'cloud_cover',
  'cloud_cover_low',
  'cloud_cover_mid',
  'cloud_cover_high',
  'visibility',
  'temperature_2m',
  'relative_humidity_2m',
  'dew_point_2m',
  'wind_speed_10m',
  'wind_gusts_10m',
  'precipitation_probability',
  'precipitation',
  'is_day',
] as const satisfies ReadonlyArray<Exclude<keyof IHourlyData, 'time'>>;

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
    past_days: '3',
    forecast_days: '16',
  });

  return `${OPEN_METEO_FORECAST_URL}?${params.toString()}`;
}
