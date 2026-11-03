import type { MetadataRoute } from 'next';
import { ROUTES } from '@/lib/constants/routes.constants';
import { getSiteUrl } from '@/lib/utils/site';
import { CURATED_CITIES } from '@/modules/location/constants/curated-cities';

/**
 * Only indexable surfaces are listed (SPEC §9, §11): the home route, every
 * curated city and the legal pages. Non-curated slugs are infinite and carry
 * `noindex`, so they never appear here.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();

  return [
    { url: `${siteUrl}${ROUTES.home}` },
    ...CURATED_CITIES.map(({ slug }) => ({ url: `${siteUrl}${ROUTES.clima.detail(slug)}` })),
    { url: `${siteUrl}${ROUTES.legal.terms}` },
    { url: `${siteUrl}${ROUTES.legal.privacy}` },
  ];
}
