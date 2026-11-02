'use client';

import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants/routes.constants';
import { CURATED_CITIES } from '@/modules/location/constants/curated-cities';
import { getCuratedCityButtonClassName } from '@/modules/location/utils/location-selector';

interface ILocationSelectorProps {
  currentSlug: string;
  onSelect?: () => void;
}

/**
 * Selector of the fixed curated list (SPEC §8.1). Changing city navigates to
 * its prerendered slug; the coordinate slugs never match an item.
 */
export function LocationSelector({
  currentSlug,
  onSelect,
}: ILocationSelectorProps): React.JSX.Element {
  const router = useRouter();

  return (
    <nav aria-label="Ciudades curadas" className="flex flex-wrap items-center gap-2">
      <span className="text-muted text-xs font-medium tracking-wide uppercase">Ciudades</span>
      <ul className="flex flex-wrap items-center gap-1">
        {CURATED_CITIES.map((city) => {
          const isCurrent = city.slug === currentSlug;

          return (
            <li key={city.slug}>
              <button
                type="button"
                aria-current={isCurrent ? 'page' : undefined}
                onClick={() => {
                  onSelect?.();
                  router.push(ROUTES.clima.detail(city.slug));
                }}
                className={getCuratedCityButtonClassName(isCurrent)}
              >
                {city.name}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
