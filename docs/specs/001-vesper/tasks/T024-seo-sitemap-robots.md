# T024 — SEO, sitemap, robots y noindex

- **Fase:** F8
- **SPEC:** §6.2, §9, §11
- **Depende de:** T019
- **Desbloquea:** T027
- **Estado:** Pendiente

## Objetivo

Cerrar las superficies indexables de la app.

## Resultado esperado

Cada ciudad curada tiene título y descripción propios; los slugs no curados no se indexan; `sitemap.xml` y `robots.txt` son coherentes.

## Alcance

**Incluye**

- `metadataBase` a partir de `NEXT_PUBLIC_SITE_URL` con respaldo de desarrollo.
- Título y descripción propios por ciudad curada.
- `robots: { index: false, follow: false }` en slugs no curados.
- `sitemap` con ciudades curadas, home y páginas legales.
- `robots` coherente con el sitemap y el noindex.

**No incluye**

- Comprar o fijar un dominio propio.
- Open Graph avanzado ni datos estructurados.

## Archivos

### Crear

- `src/app/sitemap.ts` — `export default function sitemap(): MetadataRoute.Sitemap`.
- `src/app/robots.ts` — `export default function robots(): MetadataRoute.Robots`.

### Modificar

- `src/app/layout.tsx` — `metadataBase`.
- `src/app/clima/[slug]/page.tsx` — completar `generateMetadata` para curadas y no curadas.
- `.env.example` — añadir `NEXT_PUBLIC_SITE_URL=` como variable opcional documentada.

## Pasos detallados

1. Definir `getSiteUrl()` en un helper (por ejemplo `src/lib/constants/site.constants.ts`) con `process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'`.
2. Añadir `metadataBase: new URL(getSiteUrl())` en el layout.
3. En `generateMetadata`, para curadas usar `city.name`, descripción propia y `alternates.canonical`; para no curadas devolver `{ robots: { index: false, follow: false } }`.
4. Implementar `sitemap()` con home, ciudades curadas y páginas legales.
5. Implementar `robots()` con `rules: [{ userAgent: '*', allow: '/', disallow: [] }]` y `sitemap: <url>/sitemap.xml`.
6. Actualizar `.env.example` con el comentario de que es opcional.
7. Ejecutar `pnpm build` y revisar el HTML y los archivos generados.

## Criterios de aceptación

- [ ] Cada ciudad curada tiene título y descripción distintos.
- [ ] Un slug no curado incluye `noindex`.
- [ ] El sitemap no incluye lugares no curados.
- [ ] `robots.txt` apunta al sitemap.
- [ ] Sin `NEXT_PUBLIC_SITE_URL`, el build funciona en local.

## Verificación

- `pnpm build` y abrir `/sitemap.xml` y `/robots.txt`.
- Revisar las etiquetas `meta` de una curada y de un slug de coordenadas.

## Notas y bloqueos

- Si el dueño fija un dominio, solo cambia `NEXT_PUBLIC_SITE_URL`.
