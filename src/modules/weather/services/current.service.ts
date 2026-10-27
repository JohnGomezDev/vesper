import { fetchOpenMeteo } from '@/lib/api/api-client';
import type { IFetchOptions } from '@/lib/api/api-client';
import type { ICoordinates } from '@/modules/location/types/location.types';
import type { ICurrentResponse } from '@/modules/weather/types/weather.types';
import {
  buildCurrentUrl,
  isCurrentEnvelope,
  isCurrentResponse,
} from '@/modules/weather/utils/current';

export async function fetchCurrent(
  coordinates: ICoordinates,
  options: IFetchOptions,
): Promise<ICurrentResponse> {
  const data = await fetchOpenMeteo<unknown>(buildCurrentUrl(coordinates), options);

  if (!isCurrentEnvelope(data) || !isCurrentResponse(data.current)) {
    throw new Error('Invalid current response from Open-Meteo.');
  }

  return data.current;
}
