import type {
  IDailyData,
  IHourlyData,
  IHourlyRow,
  TDailySun,
} from '@/modules/weather/types/weather.types';

export function indexHourly(hourly: IHourlyData): IHourlyRow[] {
  return hourly.time.map((time, index) => ({
    time,
    cloudCover: hourly.cloud_cover[index] ?? null,
    cloudCoverLow: hourly.cloud_cover_low[index] ?? null,
    cloudCoverMid: hourly.cloud_cover_mid[index] ?? null,
    cloudCoverHigh: hourly.cloud_cover_high[index] ?? null,
    visibility: hourly.visibility[index] ?? null,
    temperature: hourly.temperature_2m[index] ?? null,
    relativeHumidity: hourly.relative_humidity_2m[index] ?? null,
    dewPoint: hourly.dew_point_2m[index] ?? null,
    windSpeed: hourly.wind_speed_10m[index] ?? null,
    windGusts: hourly.wind_gusts_10m[index] ?? null,
    precipitationProbability: hourly.precipitation_probability[index] ?? null,
    precipitation: hourly.precipitation[index] ?? null,
    isDay: hourly.is_day[index] ?? null,
  }));
}

export function getDailySun(daily: IDailyData): TDailySun[] {
  return daily.time.map((date, index) => ({
    date,
    sunrise: daily.sunrise[index] ?? null,
    sunset: daily.sunset[index] ?? null,
  }));
}
