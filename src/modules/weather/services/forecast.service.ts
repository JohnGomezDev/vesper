import { fetchOpenMeteo } from '@/lib/api/api-client';
import type { IFetchOptions } from '@/lib/api/api-client';
import type { ICoordinates } from '@/modules/location/types/location.types';
import type { IForecastResponse } from '@/modules/weather/types/weather.types';
import { buildForecastUrl, isForecastResponse } from '@/modules/weather/utils/forecast';

export async function fetchForecast(
  coordinates: ICoordinates,
  options: IFetchOptions,
): Promise<IForecastResponse> {
  const data = await fetchOpenMeteo<unknown>(buildForecastUrl(coordinates), options);

  if (!isForecastResponse(data)) {
    throw new Error('Invalid forecast response from Open-Meteo.');
  }

  return data;
}
