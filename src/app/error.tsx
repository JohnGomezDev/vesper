'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes.constants';

interface IErrorProps {
  error: Error & { digest?: string };
  retry: () => void;
}

/**
 * Root route error boundary (SPEC §8.7). `retry` re-fetches and re-renders the
 * failed segment; Next.js 16.4.1 recommends it over `reset`, which only clears
 * the boundary state (T026 authorized adjustment).
 */
export default function Error({ error, retry }: IErrorProps): React.JSX.Element {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error(error);
    }
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <p className="text-danger font-mono text-[10px] font-semibold tracking-[0.2em] uppercase">
        Error
      </p>
      <h1 className="text-foreground text-2xl font-semibold tracking-tight">Algo salió mal</h1>
      <p className="text-muted max-w-md text-sm">
        No se pudo mostrar esta pantalla. Vuelve a intentarlo.
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="bg-primary text-primary-foreground focus-visible:ring-primary focus-visible:ring-offset-background inline-flex min-h-11 items-center rounded-none px-4 py-2 font-mono text-[10px] font-semibold tracking-[0.12em] uppercase transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
        >
          Reintentar
        </button>
        <Link
          href={ROUTES.home}
          className="border-border bg-surface-raised text-foreground hover:border-foreground focus-visible:ring-primary focus-visible:ring-offset-background inline-flex min-h-11 items-center rounded-none border px-4 py-2 font-mono text-[10px] font-semibold tracking-[0.12em] uppercase transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
