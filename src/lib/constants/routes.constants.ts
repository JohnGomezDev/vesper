export const ROUTES = {
  home: '/',
  clima: { detail: (slug: string) => `/clima/${slug}` },
  legal: { terms: '/terminos', privacy: '/privacidad' },
} as const;
