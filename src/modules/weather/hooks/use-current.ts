'use client';

import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { shouldRetry } from '@/lib/api/retry';
import type { ICoordinates } from '@/modules/location/types/location.types';
import { roundCoordinates } from '@/modules/location/utils/coordinates';
import { weatherKeys } from '@/modules/weather/constants/weather.query-keys';
import { fetchCurrent } from '@/modules/weather/services/current.service';
import type { ICurrentResponse } from '@/modules/weather/types/weather.types';

const CURRENT_STALE_TIME_MS = 1_800_000;
const CURRENT_REFETCH_INTERVAL_MS = 1_800_000;
const GC_TIME_MS = 86_400_000;

export function useCurrent(coordinates: ICoordinates): UseQueryResult<ICurrentResponse, Error> {
  const rounded = roundCoordinates(coordinates);

  return useQuery<ICurrentResponse, Error>({
    queryKey: weatherKeys.current(rounded.latitude, rounded.longitude),
    queryFn: ({ signal }) => fetchCurrent(rounded, { signal, cacheMode: 'client' }),
    staleTime: CURRENT_STALE_TIME_MS,
    gcTime: GC_TIME_MS,
    refetchInterval: CURRENT_REFETCH_INTERVAL_MS,
    retry: shouldRetry,
  });
}
