export type { TDailySun } from '@/modules/night/types/night.types';

/**
 * `hourly` block of an Open-Meteo forecast response. The arrays are parallel:
 * index `i` of every variable belongs to index `i` of `time`.
 */
export interface IHourlyData {
  time: string[];
  cloud_cover: Array<number | null>;
  cloud_cover_low: Array<number | null>;
  cloud_cover_mid: Array<number | null>;
  cloud_cover_high: Array<number | null>;
  visibility: Array<number | null>;
  temperature_2m: Array<number | null>;
  relative_humidity_2m: Array<number | null>;
  dew_point_2m: Array<number | null>;
  wind_speed_10m: Array<number | null>;
  wind_gusts_10m: Array<number | null>;
  precipitation_probability: Array<number | null>;
  precipitation: Array<number | null>;
  is_day: Array<number | null>;
}

/**
 * `daily` block requested for the forecast. Only the Sun times are consumed;
 * the Moon always comes from astronomy-engine (SPEC §5.4).
 */
export interface IDailyData {
  time: string[];
  sunrise: Array<string | null>;
  sunset: Array<string | null>;
}

/**
 * Response of the forecast endpoint (`hourly` + `daily`, never `current`).
 * `elevation` is the model-cell altitude used by astronomy-engine; it is never
 * sent back as a request parameter.
 */
export interface IForecastResponse {
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
  hourly: IHourlyData;
  daily: IDailyData;
}

/**
 * `current` block of the "now" endpoint. Only client-side code requests it.
 * A missing measurement stays `null`; it is never replaced by zero.
 */
export interface ICurrentResponse {
  time: string;
  interval: number;
  temperature_2m: number | null;
  relative_humidity_2m: number | null;
  dew_point_2m: number | null;
  cloud_cover: number | null;
  wind_speed_10m: number | null;
  wind_gusts_10m: number | null;
  is_day: number | null;
}

/**
 * One hourly forecast row built from the parallel arrays. `time` keeps the
 * Open-Meteo local wall-clock value (`2026-10-19T18:00`); convert it with
 * `parseLocalDateTime` and the response `timezone`.
 */
export interface IHourlyRow {
  time: string;
  cloudCover: number | null;
  cloudCoverLow: number | null;
  cloudCoverMid: number | null;
  cloudCoverHigh: number | null;
  visibility: number | null;
  temperature: number | null;
  relativeHumidity: number | null;
  dewPoint: number | null;
  windSpeed: number | null;
  windGusts: number | null;
  precipitationProbability: number | null;
  precipitation: number | null;
  isDay: number | null;
}

/**
 * Contract between the server page and the client container (SPEC §7.4):
 * the forecast plus the real instant it was fetched, in epoch milliseconds.
 */
export interface IInitialForecast {
  forecast: IForecastResponse;
  fetchedAt: number;
}
