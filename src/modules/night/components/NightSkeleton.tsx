import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Content skeleton with the same block sizes as the real screen, so the layout
 * does not jump when the forecast arrives (SPEC §8.7, T023).
 */
export function NightSkeleton(): React.JSX.Element {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-4">
      <span className="sr-only">Cargando la noche seleccionada…</span>

      <section className="border-border bg-surface flex flex-col gap-4 rounded-lg border p-4">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-3 w-48" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="bg-surface-muted/60 flex flex-col gap-2 rounded-md p-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </section>

      <section className="border-border bg-surface flex flex-col gap-3 rounded-lg border p-4">
        <Skeleton className="h-5 w-52" />
        <Skeleton className="h-3 w-64" />
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={index} className="h-56 min-w-[9.5rem] flex-1" />
          ))}
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-44 w-full" />
      </div>

      <Skeleton className="h-32 w-full" />

      <section className="border-border bg-surface flex flex-col gap-3 rounded-lg border p-4">
        <Skeleton className="h-5 w-40" />
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-24 min-w-[8.5rem] flex-1" />
          ))}
        </div>
      </section>
    </div>
  );
}
