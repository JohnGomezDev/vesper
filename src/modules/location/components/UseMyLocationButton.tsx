'use client';

import { useGpsLocation } from '@/modules/location/hooks/use-gps-location';

interface IUseMyLocationButtonProps {
  onBeforeRequest?: () => void;
}

/**
 * Explicit GPS button (SPEC §8.1). Rendering this component never requests
 * permission; only the click does, and every failure leaves a readable message.
 */
export function UseMyLocationButton({
  onBeforeRequest,
}: IUseMyLocationButtonProps): React.JSX.Element {
  const { requestLocation, isRequesting, error } = useGpsLocation();

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => {
          onBeforeRequest?.();
          void requestLocation();
        }}
        disabled={isRequesting}
        className="border-border bg-surface text-foreground hover:bg-surface-muted focus-visible:ring-primary focus-visible:ring-offset-background inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60"
      >
        <span aria-hidden="true">◎</span>
        {isRequesting ? 'Obteniendo ubicación…' : 'Usar mi ubicación precisa'}
      </button>
      {error === null ? null : (
        <p role="alert" className="text-danger max-w-64 text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
