import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/lib/constants/routes.constants';
import { readApproximateLocation } from '@/modules/location/utils/ip-location';
import { buildCoordinatesSlug } from '@/modules/location/utils/slug';

/**
 * The root route only reads request headers and redirects (SPEC §6.1), so it is
 * a blocking, dynamic route. With `cacheComponents`, `dynamic = 'force-dynamic'`
 * is not supported; `instant = false` is the documented way to allow a route
 * that cannot render a static shell (T018 authorized adjustment).
 *
 * The real 307 is emitted by `src/proxy.ts` because Partial Prefetching turns a
 * dynamic page into a postponed shell (T018 authorized adjustment). This page
 * stays as the route contract and as a fallback if the proxy is bypassed.
 */
export const instant = false;

export default async function HomePage(): Promise<never> {
  const headerList = await headers();
  const location = readApproximateLocation(headerList);

  if (location === null) {
    redirect(ROUTES.clima.detail('bogota'));
  }

  redirect(ROUTES.clima.detail(buildCoordinatesSlug(null, location)));
}
