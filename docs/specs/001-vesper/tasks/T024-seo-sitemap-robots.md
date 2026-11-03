# T024 — SEO, sitemap, robots y noindex

- **Fase:** F8
- **SPEC:** §6.2, §9, §11
- **Depende de:** T019
- **Desbloquea:** T027
- **Estado:** Terminada (2026-11-03)

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

- [x] Cada ciudad curada tiene título y descripción distintos.
- [x] Un slug no curado incluye `noindex`.
- [x] El sitemap no incluye lugares no curados.
- [x] `robots.txt` apunta al sitemap.
- [x] Sin `NEXT_PUBLIC_SITE_URL`, el build funciona en local.

## Verificación

- `pnpm build` y abrir `/sitemap.xml` y `/robots.txt`.
- Revisar las etiquetas `meta` de una curada y de un slug de coordenadas.

## Notas y bloqueos

- Si el dueño fija un dominio, solo cambia `NEXT_PUBLIC_SITE_URL`.

## Registro de ejecución y desviaciones (2026-11-03)

**Resultado.** Task ejecutada. Las ciudades curadas tienen título, descripción única y canonical; los slugs no curados llevan `noindex, nofollow`; `sitemap.xml` y `robots.txt` son coherentes y el build funciona sin `NEXT_PUBLIC_SITE_URL`.

### Archivos creados

- `src/lib/utils/site.ts` — `getSiteUrl()` con `NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'` y normalización de la barra final.
- `src/app/sitemap.ts` — home, tres ciudades curadas y páginas legales.
- `src/app/robots.ts` — `User-Agent: *`, `Allow: /` y sitemap.

### Archivos modificados

- `src/app/layout.tsx` — `metadataBase: new URL(getSiteUrl())` y pie con atribución y enlaces legales (el pie también lo usa T026).
- `src/app/clima/[slug]/page.tsx` — `generateMetadata` con título, descripción única, `alternates.canonical` para curadas y `robots: { index: false, follow: false }` para no curadas.
- `.env.example` — `NEXT_PUBLIC_SITE_URL=` documentada como opcional.

### Desviaciones

1. **Helper en `src/lib/utils/site.ts` (ajuste de ubicación).** La task proponía `src/lib/constants/site.constants.ts`, pero el skill `module-structure` reserva `constants/` para valores y manda las funciones puras a `utils/`. El nombre y el contrato son los pedidos: `getSiteUrl()` devuelve `process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'`.
2. **Descripción generada desde el nombre (autorizado por el dueño).** `ICuratedCity.description` sigue vacío porque el texto «por qué observar aquí» no se ha entregado. Para cumplir el criterio de descripción distinta sin inventar el texto del dueño, `generateMetadata` usa `Clima y condiciones de observación astronómica esta noche en <ciudad>.` mientras `description` esté vacío. Cuando llegue el texto del dueño, se usará tal cual.
3. **Sin dominio fijo.** Sin `NEXT_PUBLIC_SITE_URL`, `metadataBase`, `sitemap.xml` y `robots.txt` usan `http://localhost:3000`, tal como pide la task. En T029 hay que definir la variable con el dominio real antes de desplegar; no se fija ningún dominio aquí.
4. **Home en el sitemap.** Se incluye `/` porque la task lo exige, aunque `/` responde 307 y redirige a la ubicación aproximada. No se añadieron `changeFrequency`, `priority` ni `lastModified` porque la task no los pide.

### Verificación

- `pnpm typecheck`: sin errores.
- `pnpm lint`: 0 errores; se mantiene el warning preexistente de `prettier.config.mjs`.
- `pnpm test`: 26 archivos, 376 pruebas correctas.
- `pnpm build`: correcto con 12 rutas; `/sitemap.xml` y `/robots.txt` se prerenderizan.
- Sin `NEXT_PUBLIC_SITE_URL`: el build funciona. `robots.txt` devuelve `Sitemap: http://localhost:3000/sitemap.xml`; el sitemap lista `/`, las tres curadas y las dos legales, sin ningún slug no curado.
- `/clima/bogota`: `<title>Bogotá — Clima y observación astronómica</title>`, descripción propia y canonical `http://localhost:3000/clima/bogota`.
- `/clima/guatavita`: título y descripción distintos a Bogotá.
- `/clima/zipaquira_5.02_-73.99`: 200 con `<meta name="robots" content="noindex, nofollow">`.
- `pnpm exec prettier --check` sobre los archivos tocados: conforme.
