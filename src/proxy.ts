import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTES } from '@/lib/constants/routes.constants';
import { CURATED_SLUGS } from '@/modules/location/constants/curated-cities';
import { readApproximateLocation } from '@/modules/location/utils/ip-location';
import { buildCoordinatesSlug, parseSlug } from '@/modules/location/utils/slug';

const CLIMA_PREFIX = '/clima/';

/**
 * Two request-level guarantees that a partially prerendered page cannot give
 * on its own (Next.js 16, `partialPrefetching`):
 *
 * - `/` redirects with a real 307 to the visitor's approximate location
 *   (SPEC §6.1). A page-level `redirect()` only streams after a 200 shell, and
 *   the proxy reads headers only: no Open-Meteo request and no curated lookup.
 * - `/clima/<slug>` with a malformed slug answers a real 404 before rendering
 *   (SPEC §6.2). `notFound()` stays in the page as the contract and fallback.
 */
export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith(CLIMA_PREFIX)) {
    const slug = pathname.slice(CLIMA_PREFIX.length);

    if (parseSlug(slug, CURATED_SLUGS).kind === 'invalid') {
      return NextResponse.rewrite(new URL('/_not-found', request.url), { status: 404 });
    }

    return NextResponse.next();
  }

  const location = readApproximateLocation(request.headers);
  const slug =
    location === null
      ? ROUTES.clima.detail('bogota')
      : ROUTES.clima.detail(buildCoordinatesSlug(null, location));

  return NextResponse.redirect(new URL(slug, request.url), 307);
}

export const config = {
  matcher: ['/', '/clima/:slug'],
};
