import type { Metadata } from 'next';
import { Geist, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import Link from 'next/link';
import { Attribution } from '@/components/Attribution';
import { ROUTES } from '@/lib/constants/routes.constants';
import { AltitudeThresholdProvider } from '@/lib/providers/AltitudeThresholdProvider';
import { Providers } from '@/lib/providers/Providers';
import { getSiteUrl } from '@/lib/utils/site';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: 'Vesper — Clima y observación astronómica',
  description:
    'Consulta el clima y las condiciones de observación astronómica de esta noche en tu ubicación.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>
          <AltitudeThresholdProvider>{children}</AltitudeThresholdProvider>
          <footer className="border-border-subtle border-t">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <Attribution />
              <nav aria-label="Legal" className="flex items-center gap-4">
                <Link
                  href={ROUTES.legal.terms}
                  className="text-muted hover:text-foreground focus-visible:ring-primary focus-visible:ring-offset-background font-mono text-[10px] tracking-[0.08em] uppercase transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
                >
                  Términos
                </Link>
                <Link
                  href={ROUTES.legal.privacy}
                  className="text-muted hover:text-foreground focus-visible:ring-primary focus-visible:ring-offset-background font-mono text-[10px] tracking-[0.08em] uppercase transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
                >
                  Privacidad
                </Link>
              </nav>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
