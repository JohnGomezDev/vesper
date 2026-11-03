import type { Metadata } from 'next';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes.constants';
import { PrivacyContent } from '@/modules/legal/components/PrivacyContent';

export const metadata: Metadata = {
  title: 'Política de privacidad — Vesper',
  description:
    'Política de privacidad de Vesper: ubicación, Open-Meteo, Vercel, cookies, retención y derechos.',
  alternates: { canonical: ROUTES.legal.privacy },
};

export default function PrivacidadPage(): React.JSX.Element {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-10">
      <Link
        href={ROUTES.home}
        className="text-muted hover:text-foreground focus-visible:ring-primary focus-visible:ring-offset-background w-fit font-mono text-[10px] tracking-[0.08em] uppercase transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
      >
        ← Volver al inicio
      </Link>
      <PrivacyContent />
    </main>
  );
}
