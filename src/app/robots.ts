import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/utils/site';

/**
 * Non-curated slugs are excluded through per-page `noindex` metadata instead of
 * a dynamic disallow rule, because they share a route segment with the curated
 * pages (SPEC §6.2, §9).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: [] }],
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
