'use client';

import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { shouldRetry } from '@/lib/api/retry';
import type { ICoordinates } from '@/modules/location/types/location.types';
import { roundCoordinates } from '@/modules/location/utils/coordinates';
import { weatherKeys } from '@/modules/weather/constants/weather.query-keys';
import { fetchForecast } from '@/modules/weather/services/forecast.service';
import type { IForecastResponse, IInitialForecast } from '@/modules/weather/types/weather.types';

const FORECAST_STALE_TIME_MS = 3_600_000;
const GC_TIME_MS = 86_400_000;

interface IUseForecastOptions {
  initialData?: IInitialForecast;
}

export function useForecast(
  coordinates: ICoordinates,
  options?: IUseForecastOptions,
): UseQueryResult<IForecastResponse, Error> {
  const rounded = roundCoordinates(coordinates);

  return useQuery<IForecastResponse, Error>({
    queryKey: weatherKeys.forecast(rounded.latitude, rounded.longitude),
    queryFn: ({ signal }) => fetchForecast(rounded, { signal, cacheMode: 'client' }),
    staleTime: FORECAST_STALE_TIME_MS,
    gcTime: GC_TIME_MS,
    retry: shouldRetry,
    initialData: options?.initialData?.forecast,
    initialDataUpdatedAt: options?.initialData?.fetchedAt,
  });
}
