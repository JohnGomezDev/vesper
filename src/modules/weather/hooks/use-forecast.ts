'use client';

import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { shouldRetry } from '@/lib/api/retry';
import { QUERY_GC_TIME_MS } from '@/lib/constants/query.constants';
import type { ICoordinates } from '@/modules/location/types/location.types';
import { roundCoordinates } from '@/modules/location/utils/coordinates';
import { FORECAST_STALE_TIME_MS } from '@/modules/weather/constants/weather.constants';
import { weatherKeys } from '@/modules/weather/constants/weather.query-keys';
import { fetchForecast } from '@/modules/weather/services/forecast.service';
import type { IForecastResponse, IUseForecastOptions } from '@/modules/weather/types/weather.types';

export function useForecast(
  coordinates: ICoordinates,
  options?: IUseForecastOptions,
): UseQueryResult<IForecastResponse, Error> {
  const rounded = roundCoordinates(coordinates);

  return useQuery<IForecastResponse, Error>({
    queryKey: weatherKeys.forecast(rounded.latitude, rounded.longitude),
    queryFn: ({ signal }) => fetchForecast(rounded, { signal, cacheMode: 'client' }),
    staleTime: FORECAST_STALE_TIME_MS,
    gcTime: QUERY_GC_TIME_MS,
    retry: shouldRetry,
    initialData: options?.initialData?.forecast,
    initialDataUpdatedAt: options?.initialData?.fetchedAt,
  });
}
