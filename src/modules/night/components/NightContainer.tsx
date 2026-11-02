'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CURATED_SLUGS, getCuratedCity } from '@/modules/location/constants/curated-cities';
import { LocationSelector } from '@/modules/location/components/LocationSelector';
import { SearchForm } from '@/modules/location/components/SearchForm';
import { UseMyLocationButton } from '@/modules/location/components/UseMyLocationButton';
import { useLocationName } from '@/modules/location/hooks/use-location-name';
import { resetSearch, useSearchResetToken } from '@/modules/location/hooks/use-search-reset';
import type { ICoordinates } from '@/modules/location/types/location.types';
import {
  addDays,
  getDeviceTimeZone,
  getNightDateRange,
  getTodayLocalDate,
} from '@/modules/location/utils/datetime';
import { parseSlug } from '@/modules/location/utils/slug';
import { NightBody } from '@/modules/night/components/NightBody';
import { TEMPORARY_ALTITUDE_THRESHOLD } from '@/modules/night/constants/night.constants';
import { useNightAnalysis } from '@/modules/night/hooks/use-night-analysis';
import { useNightNavigation } from '@/modules/night/hooks/use-night-navigation';
import { useNow } from '@/modules/night/hooks/use-now';
import type { TValidSlug } from '@/modules/night/types/night.types';
import { useCurrent } from '@/modules/weather/hooks/use-current';
import { useForecast } from '@/modules/weather/hooks/use-forecast';
import type { IInitialForecast } from '@/modules/weather/types/weather.types';

interface INightContainerProps {
  slug: string;
  initialData?: IInitialForecast;
}

interface INightContentProps {
  slug: string;
  parsedSlug: TValidSlug;
  initialData?: IInitialForecast;
}

function NightContent({ slug, parsedSlug, initialData }: INightContentProps): React.JSX.Element {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date');
  const nowMs = useNow();
  const mounted = nowMs !== 0;
  const [threshold] = useState(TEMPORARY_ALTITUDE_THRESHOLD);
  // Shared by every mounted page: a cached slug must also lose its search text.
  const searchResetToken = useSearchResetToken();
  const changeNight = useNightNavigation(slug);

  const curatedCity = parsedSlug.kind === 'curated' ? getCuratedCity(parsedSlug.slug) : null;
  const coordinates: ICoordinates =
    parsedSlug.kind === 'coordinates'
      ? parsedSlug.coordinates
      : (curatedCity?.coordinates ?? { latitude: 0, longitude: 0 });

  const forecastQuery = useForecast(coordinates, { initialData });
  // The "now" block belongs to T021, but the query must already follow the same
  // coordinates and cache keys so the screen has a single source of truth.
  useCurrent(coordinates);

  const forecast = forecastQuery.data;
  const locationName = useLocationName({ slug, result: parsedSlug });
  const analysis = useNightAnalysis({
    slug,
    date: mounted ? dateParam : null,
    threshold,
    forecast,
    nowMs: mounted ? nowMs : null,
  });
  const timeZone = forecast?.timezone ?? curatedCity?.timeZone ?? null;
  const deviceTimeZone = useMemo(() => getDeviceTimeZone(), []);
  const showTimeZoneNotice = mounted && timeZone !== null && timeZone !== deviceTimeZone;

  const todayLocal = !mounted || timeZone === null ? null : getTodayLocalDate(nowMs, timeZone);
  const dateRange = todayLocal === null ? null : getNightDateRange(todayLocal);
  const hasNightDate = analysis.nightDate !== '';
  const previousDate = hasNightDate ? addDays(analysis.nightDate, -1) : '';
  const nextDate = hasNightDate ? addDays(analysis.nightDate, 1) : '';
  const canGoPrevious = hasNightDate && dateRange !== null && previousDate >= dateRange.min;
  const canGoNext = hasNightDate && dateRange !== null && nextDate <= dateRange.max;

  return (
    <>
      <header className="border-border bg-background/95 sticky top-0 z-10 border-b backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-3">
          <div className="flex flex-wrap items-start gap-3">
            <div className="min-w-0 flex-1">
              <LocationSelector
                currentSlug={parsedSlug.kind === 'curated' ? parsedSlug.slug : ''}
                onSelect={resetSearch}
              />
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:max-w-xl sm:flex-1">
              <SearchForm key={`${slug}-${searchResetToken}`} />
            </div>
            <UseMyLocationButton onBeforeRequest={resetSearch} />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-foreground truncate text-xl font-semibold tracking-tight">
              {locationName}
            </h1>
            {showTimeZoneNotice ? (
              <p className="text-muted mt-1 text-xs">
                Horas locales de {locationName} · {timeZone}
              </p>
            ) : null}
          </div>

          {mounted ? (
            <div className="flex items-center gap-1" aria-label="Cambiar de noche">
              <button
                type="button"
                onClick={() => changeNight(previousDate)}
                disabled={!canGoPrevious}
                className="border-border bg-surface text-foreground hover:bg-surface-muted focus-visible:ring-primary focus-visible:ring-offset-background rounded-md border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="text-muted px-1 font-mono text-xs">{analysis.nightDate}</span>
              <button
                type="button"
                onClick={() => changeNight(nextDate)}
                disabled={!canGoNext}
                className="border-border bg-surface text-foreground hover:bg-surface-muted focus-visible:ring-primary focus-visible:ring-offset-background rounded-md border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          ) : null}
        </div>

        <NightBody
          mounted={mounted}
          forecastQuery={forecastQuery}
          forecast={forecast}
          analysis={analysis}
        />
      </main>
    </>
  );
}

/**
 * Client entry of `/clima/[slug]` (SPEC §8.1–§8.3). It resolves the slug in the
 * browser, keeps weather and astronomy keyed by the same rounded coordinates,
 * and owns location search, GPS and night changes. Searched or GPS places are
 * never geocoded here: the slug already carries their coordinates.
 */
export function NightContainer({ slug, initialData }: INightContainerProps): React.JSX.Element {
  const parsedSlug = useMemo(() => parseSlug(slug, CURATED_SLUGS), [slug]);

  if (parsedSlug.kind === 'invalid') {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-4 py-8">
        <p className="text-muted text-sm">La ubicación de este enlace no es válida.</p>
      </main>
    );
  }

  return <NightContent slug={slug} parsedSlug={parsedSlug} initialData={initialData} />;
}
