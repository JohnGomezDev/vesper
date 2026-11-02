import type { ICurrentResponse, IHourlyData } from '@/modules/weather/types/weather.types';

export const FORECAST_STALE_TIME_MS = 3_600_000;
export const CURRENT_STALE_TIME_MS = 1_800_000;
export const CURRENT_REFETCH_INTERVAL_MS = 1_800_000;

export const CURRENT_VARIABLES = [
  'temperature_2m',
  'relative_humidity_2m',
  'dew_point_2m',
  'cloud_cover',
  'wind_speed_10m',
  'wind_gusts_10m',
  'is_day',
] as const;

export const CURRENT_NUMBER_FIELDS = [
  'temperature_2m',
  'relative_humidity_2m',
  'dew_point_2m',
  'cloud_cover',
  'wind_speed_10m',
  'wind_gusts_10m',
  'is_day',
] as const satisfies ReadonlyArray<Exclude<keyof ICurrentResponse, 'time' | 'interval'>>;

export const HOURLY_VARIABLES = [
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

export const DAILY_VARIABLES = ['sunrise', 'sunset'] as const;

export const HOURLY_NUMBER_FIELDS = [
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

export const FORECAST_PAST_DAYS = '3';
export const FORECAST_DAYS = '16';
