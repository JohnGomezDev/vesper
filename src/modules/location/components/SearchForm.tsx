'use client';

import { useEffect, useRef } from 'react';
import { useGeocodingResultSelection } from '@/modules/location/hooks/use-geocoding-result-selection';
import { useSearchForm } from '@/modules/location/hooks/use-search-form';
import type { IGeocodingResult } from '@/modules/location/types/location.types';
import { formatGeocodingResultDescription } from '@/modules/location/utils/geocoding';

/**
 * Name search (SPEC §8.1). Shows name, region and country for every result;
 * choosing one remembers the display name, warms the forecast cache and
 * navigates to the coordinate slug. A cold link never geocodes: this component
 * only queries after an explicit submit.
 */
export function SearchForm(): React.JSX.Element {
  const selectResult = useGeocodingResultSelection();
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    form,
    registerQuery,
    results,
    isSearching,
    isError,
    hasSearched,
    isResultsOpen,
    closeResults,
    onSubmit,
  } = useSearchForm();
  const {
    formState: { errors },
  } = form;

  useEffect(() => {
    if (!isResultsOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent): void => {
      if (
        containerRef.current !== null &&
        event.target instanceof Node &&
        !containerRef.current.contains(event.target)
      ) {
        closeResults();
      }
    };

    const handleFocusIn = (event: FocusEvent): void => {
      if (
        containerRef.current !== null &&
        event.target instanceof Node &&
        !containerRef.current.contains(event.target)
      ) {
        closeResults();
      }
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        closeResults();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isResultsOpen, closeResults]);

  const handleSelect = (result: IGeocodingResult): void => {
    closeResults();
    selectResult(result);
  };

  return (
    <div ref={containerRef} className="relative flex w-full flex-col gap-2">
      <form onSubmit={onSubmit} noValidate className="flex w-full items-start gap-2">
        <div className="relative min-w-0 flex-1">
          <label htmlFor="location-search" className="sr-only">
            Buscar un lugar
          </label>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="text-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            id="location-search"
            type="search"
            autoComplete="off"
            placeholder="Busca una ciudad o un pueblo"
            aria-invalid={errors.query !== undefined}
            aria-describedby={errors.query === undefined ? undefined : 'location-search-error'}
            className="border-muted bg-surface-muted text-foreground placeholder:text-muted focus-visible:border-primary focus-visible:ring-primary/40 h-9 w-full rounded-none border pr-3 pl-9 font-mono text-sm focus-visible:ring-2 focus-visible:outline-none"
            {...registerQuery}
          />
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="bg-primary text-primary-foreground focus-visible:ring-primary focus-visible:ring-offset-background hover:text-primary-foreground h-9 shrink-0 rounded-none px-4 font-mono text-[10px] font-semibold tracking-[0.14em] uppercase transition-opacity hover:bg-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
        >
          {isSearching ? 'Buscando…' : 'Buscar'}
        </button>
      </form>

      {errors.query === undefined ? null : (
        <p id="location-search-error" role="alert" className="text-danger text-xs">
          {errors.query.message}
        </p>
      )}

      {isResultsOpen && isError ? (
        <p role="alert" className="text-danger text-xs">
          No se pudo buscar el lugar. Inténtalo de nuevo.
        </p>
      ) : null}

      {isResultsOpen && hasSearched && !isSearching && !isError && results.length === 0 ? (
        <p className="text-muted text-xs">No se encontraron lugares con ese nombre.</p>
      ) : null}

      {isResultsOpen && results.length > 0 ? (
        <ul
          aria-label="Resultados de búsqueda"
          className="border-border bg-surface-raised divide-border-subtle absolute top-full right-0 left-0 z-50 mt-1 max-h-72 divide-y overflow-y-auto rounded-[4px] border"
        >
          {results.map((result) => {
            const description = formatGeocodingResultDescription(result);

            return (
              <li key={result.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(result)}
                  className="hover:bg-surface-muted focus-visible:bg-surface-muted flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left transition-colors focus-visible:outline-none"
                >
                  <span className="text-foreground text-sm font-medium">{result.name}</span>
                  {description === '' ? null : (
                    <span className="text-muted text-xs">{description}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
