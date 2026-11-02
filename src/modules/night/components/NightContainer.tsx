'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { ApiError } from '@/lib/api/api-client';
import { useMounted } from '@/lib/hooks/use-mounted';
import { useAltitudeThreshold } from '@/lib/providers/AltitudeThresholdProvider';
import { AppBrand } from '@/components/AppBrand';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { CURATED_SLUGS, getCuratedCity } from '@/modules/location/constants/curated-cities';
import { SearchForm } from '@/modules/location/components/SearchForm';
import { UseMyLocationButton } from '@/modules/location/components/UseMyLocationButton';
import { useLocationName } from '@/modules/location/hooks/use-location-name';
import { resetSearch, useSearchResetToken } from '@/modules/location/hooks/use-search-reset';
import type { ICoordinates } from '@/modules/location/types/location.types';
import {
  addDays,
  formatLocalTime,
  getDeviceTimeZone,
  getNightDateRange,
  getTodayLocalDate,
  parseDateParam,
} from '@/modules/location/utils/datetime';
import { parseSlug } from '@/modules/location/utils/slug';
import { AltitudeThresholdSelect } from '@/modules/night/components/AltitudeThresholdSelect';
import { BestWindowSummary } from '@/modules/night/components/BestWindowSummary';
import { MoonPanel } from '@/modules/night/components/MoonPanel';
import { NightSelector } from '@/modules/night/components/NightSelector';
import { NightSkeleton } from '@/modules/night/components/NightSkeleton';
import { NightStates } from '@/modules/night/components/NightStates';
import { NightStrip } from '@/modules/night/components/NightStrip';
import { ObservationWindows } from '@/modules/night/components/ObservationWindows';
import { MS_PER_HOUR, NIGHT_MESSAGES } from '@/modules/night/constants/night.constants';
import { useNightAnalysis } from '@/modules/night/hooks/use-night-analysis';
import { useNightNavigation } from '@/modules/night/hooks/use-night-navigation';
import { useNightOptions } from '@/modules/night/hooks/use-night-options';
import { useNow } from '@/modules/night/hooks/use-now';
import type { TValidSlug } from '@/modules/night/types/night.types';
import { getMoonPhaseIconKey, getMoonPhaseName } from '@/modules/night/utils/moon-phase';
import { CurrentConditions } from '@/modules/weather/components/CurrentConditions';
import { FORECAST_STALE_TIME_MS } from '@/modules/weather/constants/weather.constants';
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
  const mounted = useMounted();
  const nowMs = useNow();
  const clockMs = mounted ? nowMs : null;
  const { value: threshold, setValue: setThreshold } = useAltitudeThreshold();
  // Shared by every mounted page: a cached slug must also lose its search text.
  const searchResetToken = useSearchResetToken();
  const changeNight = useNightNavigation(slug);

  const curatedCity = parsedSlug.kind === 'curated' ? getCuratedCity(parsedSlug.slug) : null;
  const coordinates: ICoordinates =
    parsedSlug.kind === 'coordinates'
      ? parsedSlug.coordinates
      : (curatedCity?.coordinates ?? { latitude: 0, longitude: 0 });

  const forecastQuery = useForecast(coordinates, { initialData });
  const currentQuery = useCurrent(coordinates);

  const forecast = forecastQuery.data;
  const locationName = useLocationName({ slug, result: parsedSlug });
  const analysis = useNightAnalysis({
    slug,
    date: clockMs === null ? null : dateParam,
    threshold,
    forecast,
    nowMs: clockMs,
  });
  const timeZone = forecast?.timezone ?? curatedCity?.timeZone ?? null;
  const deviceTimeZone = useMemo(() => getDeviceTimeZone(), []);
  const showTimeZoneNotice = mounted && timeZone !== null && timeZone !== deviceTimeZone;
  const todayLocal =
    clockMs === null || timeZone === null ? null : getTodayLocalDate(clockMs, timeZone);
  const dateRange = todayLocal === null ? null : getNightDateRange(todayLocal);
  const parsedDateParam =
    todayLocal === null || dateParam === null ? null : parseDateParam(dateParam, todayLocal);
  const dateMessage =
    parsedDateParam === null
      ? null
      : parsedDateParam.kind === 'invalid'
        ? NIGHT_MESSAGES.invalidDate
        : parsedDateParam.kind === 'out-of-range'
          ? NIGHT_MESSAGES.outOfRange
          : null;
  const options = useNightOptions({ slug, forecast, timeZone, todayLocal });

  const hasNightDate = analysis.nightDate !== '';
  const previousDate = hasNightDate ? addDays(analysis.nightDate, -1) : '';
  const nextDate = hasNightDate ? addDays(analysis.nightDate, 1) : '';
  const canGoPrevious = hasNightDate && dateRange !== null && previousDate >= dateRange.min;
  const canGoNext = hasNightDate && dateRange !== null && nextDate <= dateRange.max;

  const moonPhase = analysis.moon === null ? 'new-moon' : getMoonPhaseName(analysis.moon.angleDeg);
  const moonIconKey = getMoonPhaseIconKey(moonPhase);
  const moonNightStartMs =
    analysis.window.kind === 'available' ? analysis.window.startMs + MS_PER_HOUR : null;
  const moonNightEndMs =
    analysis.window.kind === 'available' ? analysis.window.endMs - MS_PER_HOUR : null;
  const forecastUpdatedAt = forecastQuery.dataUpdatedAt;
  const isStaleForecast =
    mounted &&
    forecast !== undefined &&
    forecastUpdatedAt > 0 &&
    nowMs - forecastUpdatedAt > FORECAST_STALE_TIME_MS;
  const isRateLimited =
    forecastQuery.error instanceof ApiError && forecastQuery.error.status === 429;
  const isCurrentRateLimited =
    currentQuery.error instanceof ApiError && currentQuery.error.status === 429;
  const retryForecast = (): void => {
    void forecastQuery.refetch();
  };
  const retryCurrent = (): void => {
    void currentQuery.refetch();
  };

  return (
    <>
      <header className="border-border bg-background/95 sticky top-0 z-10 border-b backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <AppBrand />
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-0 sm:flex-1">
              <SearchForm key={`${slug}-${searchResetToken}`} />
            </div>
            <UseMyLocationButton onBeforeRequest={resetSearch} />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 overflow-x-hidden px-4 py-6 [contain:paint]">
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
            {mounted && forecast !== undefined && timeZone !== null && forecastUpdatedAt > 0 ? (
              <p className="text-muted mt-1 text-xs" role="status">
                Actualizado a las {formatLocalTime(forecastUpdatedAt, timeZone)}
                {forecastQuery.isFetching ? ' · actualizando…' : ''}
              </p>
            ) : null}
          </div>

          {mounted ? (
            <div className="flex items-center gap-1" aria-label="Cambiar de noche">
              <button
                type="button"
                onClick={() => changeNight(previousDate)}
                disabled={!canGoPrevious}
                className="border-border bg-surface text-foreground hover:bg-surface-muted focus-visible:ring-primary focus-visible:ring-offset-background min-h-11 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
              >
                Anterior
              </button>
              <span className="text-muted px-1 font-mono text-xs">{analysis.nightDate}</span>
              <button
                type="button"
                onClick={() => changeNight(nextDate)}
                disabled={!canGoNext}
                className="border-border bg-surface text-foreground hover:bg-surface-muted focus-visible:ring-primary focus-visible:ring-offset-background min-h-11 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
              >
                Siguiente
              </button>
            </div>
          ) : null}
        </div>

        {!mounted ? <NightSkeleton /> : null}

        {mounted && forecastQuery.isPending ? <NightSkeleton /> : null}

        {mounted && !forecastQuery.isPending && forecastQuery.isError && forecast === undefined ? (
          <ErrorState
            message={isRateLimited ? NIGHT_MESSAGES.rateLimit : NIGHT_MESSAGES.forecastError}
            onRetry={retryForecast}
          />
        ) : null}

        {mounted && !forecastQuery.isPending && !forecastQuery.isError && forecast === undefined ? (
          <EmptyState message={NIGHT_MESSAGES.emptyForecast}>
            <a
              href="#location-search"
              className="bg-primary text-primary-foreground focus-visible:ring-primary focus-visible:ring-offset-background inline-flex min-h-11 items-center rounded-md px-4 py-2 text-sm font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Buscar otro lugar
            </a>
          </EmptyState>
        ) : null}

        {mounted && forecast !== undefined && timeZone !== null ? (
          <>
            {dateMessage === null ? null : <NightStates variant="warning" message={dateMessage} />}
            {analysis.window.kind === 'no-astronomical-night' ? (
              <NightStates variant="warning" message={NIGHT_MESSAGES.noAstronomicalNight} />
            ) : null}
            {forecastQuery.isError ? (
              <NightStates variant="warning" message={NIGHT_MESSAGES.staleForecast} />
            ) : null}
            {isStaleForecast ? (
              <NightStates
                variant="info"
                message={`Última actualización a las ${formatLocalTime(forecastUpdatedAt, timeZone)}. El pronóstico se refresca en segundo plano.`}
              />
            ) : null}

            {currentQuery.data !== undefined && analysis.currentSunAltitudeDeg !== null ? (
              <CurrentConditions
                current={currentQuery.data}
                sunAltitudeDeg={analysis.currentSunAltitudeDeg}
                fetchedAt={currentQuery.dataUpdatedAt}
                timeZone={timeZone}
              />
            ) : currentQuery.isError ? (
              <NightStates
                variant="warning"
                message={
                  isCurrentRateLimited ? NIGHT_MESSAGES.rateLimit : NIGHT_MESSAGES.currentError
                }
              >
                <button
                  type="button"
                  onClick={retryCurrent}
                  className="border-border bg-surface text-foreground hover:bg-surface-muted focus-visible:ring-primary focus-visible:ring-offset-background min-h-11 w-fit rounded-md border px-3 text-xs font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  Reintentar
                </button>
              </NightStates>
            ) : (
              <Skeleton className="h-48 w-full" />
            )}

            <section aria-labelledby="night-section-title" className="flex flex-col gap-4">
              <h2 id="night-section-title" className="text-base font-semibold">
                Esta noche
              </h2>

              <NightStrip
                rows={analysis.rows}
                window={analysis.window}
                timeZone={timeZone}
                cloudByTime={analysis.cloudByTime}
                classByTime={analysis.cloudClassByTime}
                isArchived={analysis.isArchived}
              />

              <BestWindowSummary window={analysis.bestWindow} timeZone={timeZone} />

              <MoonPanel
                moon={analysis.moon}
                phase={moonPhase}
                iconKey={moonIconKey}
                illuminationPct={
                  analysis.moon === null ? 0 : analysis.moon.illuminationFraction * 100
                }
                timeZone={timeZone}
                nightStartMs={moonNightStartMs}
                nightEndMs={moonNightEndMs}
                peakAltitudeDeg={analysis.moonPeakAltitudeDeg}
                peakMs={analysis.moonPeakMs}
              />

              <div className="border-border bg-surface flex flex-col gap-4 rounded-lg border p-4">
                <AltitudeThresholdSelect value={threshold} onChange={setThreshold} />
                <ObservationWindows
                  windows={analysis.windows}
                  notices={analysis.notices}
                  timeZone={timeZone}
                />
              </div>
            </section>

            <NightSelector
              options={options}
              selectedDate={analysis.nightDate}
              onSelect={changeNight}
            />
          </>
        ) : null}
      </main>
    </>
  );
}

/**
 * Client entry of `/clima/[slug]` (SPEC §8.1–§8.3, §8.7). It resolves the slug
 * in the browser, keeps weather and astronomy keyed by the same rounded
 * coordinates, and owns location search, GPS, night changes and every screen
 * state.
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
