import type { ICuratedCity } from '@/modules/location/types/location.types';
import { NightContainer } from '@/modules/night/components/NightContainer';
import { fetchInitialForecast } from '@/modules/weather/services/initial-forecast.service';
import type { IInitialForecast } from '@/modules/weather/types/weather.types';

interface ICuratedNightProps {
  city: ICuratedCity;
}

/**
 * Curated city page (SPEC §7.1, §7.5): tries the cached server forecast and
 * falls back to the client container when the request fails. The failure is
 * caught outside the cached scope, so it is never cached.
 */
export async function CuratedNight({ city }: ICuratedNightProps): Promise<React.JSX.Element> {
  let initialData: IInitialForecast | undefined;

  try {
    initialData = await fetchInitialForecast(city.coordinates);
  } catch {
    initialData = undefined;
  }

  return <NightContainer slug={city.slug} initialData={initialData} />;
}
