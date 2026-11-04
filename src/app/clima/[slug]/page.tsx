import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ROUTES } from '@/lib/constants/routes.constants';
import {
  CURATED_CITIES,
  CURATED_SLUGS,
  getCuratedCity,
} from '@/modules/location/constants/curated-cities';
import { parseSlug } from '@/modules/location/utils/slug';
import { CuratedNight } from '@/modules/night/components/CuratedNight';
import { NightContainer } from '@/modules/night/components/NightContainer';
import { NightPageSkeleton } from '@/modules/night/components/NightPageSkeleton';

interface IClimaPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Curated pages are the only ones prerendered (SPEC §6.2, §7.1). Any other
 * well-formed slug is generated on demand and gets its data in the browser.
 */
export function generateStaticParams(): Array<{ slug: string }> {
  return CURATED_CITIES.map(({ slug }) => ({ slug }));
}

/**
 * Metadata comes only from the curated list and the slug (SPEC §7.1, §9): it
 * never calls Open-Meteo. A non-curated slug is explicitly non-indexable. The
 * owner's `description` is used when available; until it arrives, a unique
 * metadata description derived from the city name replaces it without inventing
 * the owner's «why observe here» text.
 */
export async function generateMetadata({ params }: IClimaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const city = getCuratedCity(slug);

  if (city === null) {
    return { robots: { index: false, follow: false } };
  }

  const title = `${city.name} — Clima y observación astronómica`;
  const description =
    city.description === ''
      ? `Clima y condiciones de observación astronómica esta noche en ${city.name}.`
      : city.description;

  return {
    title,
    description,
    alternates: { canonical: ROUTES.clima.detail(city.slug) },
  };
}

/**
 * URL data must be read inside a Suspense boundary so the shared App Shell is
 * not tied to one slug (Next.js `instant-shell-url-data`). The promise is passed
 * down and awaited here, inside the boundary.
 */
async function ClimaContent({ params }: IClimaPageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const result = parseSlug(slug, CURATED_SLUGS);

  if (result.kind === 'invalid') {
    notFound();
  }

  if (result.kind === 'coordinates') {
    return <NightContainer slug={slug} />;
  }

  const city = getCuratedCity(result.slug);

  if (city === null) {
    notFound();
  }

  return <CuratedNight city={city} />;
}

export default function ClimaPage({ params }: IClimaPageProps): React.JSX.Element {
  // `useSearchParams` also requires a Suspense boundary with Cache Components
  // (SPEC §6.3). The fallback matches the final block size to avoid layout jumps.
  return (
    <Suspense fallback={<NightPageSkeleton />}>
      <ClimaContent params={params} />
    </Suspense>
  );
}
