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
    <div className="flex w-full flex-col gap-1 md:w-auto">
      <button
        type="button"
        onClick={() => {
          onBeforeRequest?.();
          void requestLocation();
        }}
        disabled={isRequesting}
        className="border-border bg-surface-raised text-foreground hover:border-foreground hover:text-foreground focus-visible:ring-primary focus-visible:ring-offset-background inline-flex h-9 w-full items-center justify-center gap-2 rounded-none border px-3 font-mono text-[10px] font-semibold tracking-[0.1em] uppercase transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none md:w-auto"
      >
        <span aria-hidden="true" className="text-primary text-sm leading-none">
          ◎
        </span>
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
