import { OPEN_METEO_FORECAST_URL } from '@/lib/constants/api.constants';
import { isNumberOrNull, isRecord } from '@/lib/utils/validation';
import type { ICoordinates } from '@/modules/location/types/location.types';
import { roundCoordinates } from '@/modules/location/utils/coordinates';
import type { ICurrentResponse } from '@/modules/weather/types/weather.types';

const CURRENT_VARIABLES = [
  'temperature_2m',
  'relative_humidity_2m',
  'dew_point_2m',
  'cloud_cover',
  'wind_speed_10m',
  'wind_gusts_10m',
  'is_day',
] as const;

const CURRENT_NUMBER_FIELDS = [
  'temperature_2m',
  'relative_humidity_2m',
  'dew_point_2m',
  'cloud_cover',
  'wind_speed_10m',
  'wind_gusts_10m',
  'is_day',
] as const satisfies ReadonlyArray<Exclude<keyof ICurrentResponse, 'time' | 'interval'>>;

export function isCurrentResponse(value: unknown): value is ICurrentResponse {
  if (!isRecord(value)) {
    return false;
  }

  if (typeof value.time !== 'string' || typeof value.interval !== 'number') {
    return false;
  }

  return CURRENT_NUMBER_FIELDS.every((field) => isNumberOrNull(value[field]));
}

export function isCurrentEnvelope(value: unknown): value is { current: unknown } {
  return isRecord(value) && 'current' in value;
}

export function buildCurrentUrl(coordinates: ICoordinates): string {
  const rounded = roundCoordinates(coordinates);
  const params = new URLSearchParams({
    latitude: String(rounded.latitude),
    longitude: String(rounded.longitude),
    current: CURRENT_VARIABLES.join(','),
    timezone: 'auto',
  });

  return `${OPEN_METEO_FORECAST_URL}?${params.toString()}`;
}
