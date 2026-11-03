import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes.constants';

/**
 * Invalid slugs reach this page through `notFound()` or the proxy rewrite
 * (SPEC §6.2, §8.7). The link returns to `/`, which redirects to the visitor's
 * location and exposes the location search there.
 */
export default function NotFound(): React.JSX.Element {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <p className="text-primary font-mono text-[10px] font-semibold tracking-[0.2em] uppercase">
        404
      </p>
      <h1 className="text-foreground text-2xl font-semibold tracking-tight">
        Este lugar no existe
      </h1>
      <p className="text-muted max-w-md text-sm">
        El enlace no corresponde a una ubicación válida de Vesper.
      </p>
      <Link
        href={ROUTES.home}
        className="bg-primary text-primary-foreground focus-visible:ring-primary focus-visible:ring-offset-background mt-2 inline-flex min-h-11 items-center rounded-none px-4 py-2 font-mono text-[10px] font-semibold tracking-[0.12em] uppercase transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
