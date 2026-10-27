import { noop } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import type { ICoordinates } from '@/modules/location/types/location.types';
import { roundCoordinates } from '@/modules/location/utils/coordinates';
import { weatherKeys } from '@/modules/weather/constants/weather.query-keys';
import { fetchForecast } from '@/modules/weather/services/forecast.service';

const FORECAST_STALE_TIME_MS = 3_600_000;

/**
 * Warms the forecast cache before navigating to a searched place (SPEC §8.1).
 * Runs in the browser, so it uses the client cache mode.
 *
 * `queryClient.query` supersedes the deprecated `prefetchQuery` in TanStack
 * Query v5. Its rejection is swallowed because prefetching is best effort: the
 * mounted `useForecast` retries the request if this warm-up fails.
 */
export async function prefetchForecast(
  queryClient: QueryClient,
  coordinates: ICoordinates,
): Promise<void> {
  const rounded = roundCoordinates(coordinates);

  await queryClient
    .query({
      queryKey: weatherKeys.forecast(rounded.latitude, rounded.longitude),
      queryFn: () => fetchForecast(rounded, { cacheMode: 'client' }),
      staleTime: FORECAST_STALE_TIME_MS,
    })
    .catch(noop);
}
