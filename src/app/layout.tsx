import type { Metadata } from 'next';
import { Geist, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import { AltitudeThresholdProvider } from '@/lib/providers/AltitudeThresholdProvider';
import { Providers } from '@/lib/providers/Providers';
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
        </Providers>
      </body>
    </html>
  );
}
