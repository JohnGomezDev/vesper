'use client';

import type { UseQueryResult } from '@tanstack/react-query';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { NightContentSkeleton } from '@/modules/night/components/NightContentSkeleton';
import { NightSummary } from '@/modules/night/components/NightSummary';
import type { INightAnalysis } from '@/modules/night/types/night.types';
import type { IForecastResponse } from '@/modules/weather/types/weather.types';

interface INightBodyProps {
  mounted: boolean;
  forecastQuery: UseQueryResult<IForecastResponse, Error>;
  forecast: IForecastResponse | undefined;
  analysis: INightAnalysis;
}

export function NightBody({
  mounted,
  forecastQuery,
  forecast,
  analysis,
}: INightBodyProps): React.JSX.Element {
  if (!mounted) {
    return <NightContentSkeleton />;
  }

  if (forecastQuery.isPending) {
    return <LoadingState label="Cargando el pronóstico de esta noche…" />;
  }

  if (forecastQuery.isError && forecast === undefined) {
    return (
      <ErrorState
        message="No se pudo cargar el pronóstico de este lugar."
        onRetry={() => void forecastQuery.refetch()}
      />
    );
  }

  if (forecast === undefined) {
    return (
      <EmptyState message="No hay datos de pronóstico para este lugar. Busca otro lugar para ver su noche." />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {forecastQuery.isError ? (
        <p role="alert" className="text-danger text-xs">
          No se pudo actualizar el pronóstico; se muestra el último dato disponible.
        </p>
      ) : null}

      <NightSummary analysis={analysis} />
    </div>
  );
}
