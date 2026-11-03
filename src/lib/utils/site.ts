const FALLBACK_SITE_URL = 'http://localhost:3000';

/**
 * Public origin used for absolute metadata, sitemap and robots URLs (SPEC §9).
 * `NEXT_PUBLIC_SITE_URL` stays optional until the owner fixes a domain; the
 * localhost fallback keeps local builds working without extra configuration.
 */
export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? FALLBACK_SITE_URL).replace(/\/+$/, '');
}
