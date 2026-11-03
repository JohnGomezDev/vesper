import type { Metadata } from 'next';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes.constants';
import { TermsContent } from '@/modules/legal/components/TermsContent';

export const metadata: Metadata = {
  title: 'Términos de uso — Vesper',
  description:
    'Condiciones de uso de Vesper: servicio, fuentes de datos, atribución, responsabilidad y contacto.',
  alternates: { canonical: ROUTES.legal.terms },
};

export default function TerminosPage(): React.JSX.Element {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-10">
      <Link
        href={ROUTES.home}
        className="text-muted hover:text-foreground focus-visible:ring-primary focus-visible:ring-offset-background w-fit font-mono text-[10px] tracking-[0.08em] uppercase transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
      >
        ← Volver al inicio
      </Link>
      <TermsContent />
    </main>
  );
}
