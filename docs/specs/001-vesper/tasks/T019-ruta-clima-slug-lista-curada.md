# T019 — Ruta `/clima/[slug]`, lista curada y datos iniciales

- **Fase:** F6
- **SPEC:** §6.2, §7.1, §7.4, §7.5, §9
- **Depende de:** T010, T011, T017
- **Desbloquea:** T020, T024
- **Estado:** Terminada (2026-10-28)
- **Bloqueo:** los datos de Tatacoa, Checua y Lago de Tota los entrega el dueño (T002). Siguen fuera de la lista curada; se añaden cuando lleguen los datos.

## Objetivo

Implementar la página de servidor que valida el slug, prerenderiza ciudades curadas y entrega su pronóstico inicial.

## Resultado esperado

`/clima/bogota` se prerenderiza con el pronóstico incrustado; un slug válido no curado responde 200 sin datos iniciales y sin peticiones de servidor; un slug inválido responde 404.

## Alcance

**Incluye**

- Lista curada con slug, nombre, coordenadas, altitud, zona horaria y texto propio.
- `generateStaticParams` solo con curadas.
- `generateMetadata` alimentado solo por la lista curada y el slug.
- `export const revalidate = 3600` en el archivo de la ruta.
- Rama servidor de `fetchForecast` con `cacheMode: 'server'` solo para curadas.
- Captura de error de Open-Meteo: página sin datos iniciales.
- Paso de `IInitialForecast` al contenedor cliente.
- `noindex` para slugs no curados.

**No incluye**

- La lógica cliente del contenedor (T020 lo completa).
- Buscador ni GPS (T020).
- Sitemap (T024).

## Archivos

### Crear

- `src/modules/location/constants/curated-cities.ts`
  - `CURATED_CITIES: readonly ICuratedCity[]`
  - `CURATED_SLUGS: ReadonlySet<string>`
  - `getCuratedCity(slug: string): ICuratedCity | null`
- `src/app/clima/[slug]/page.tsx`
  - `revalidate`, `generateStaticParams`, `generateMetadata`, componente por defecto.
- `src/modules/night/components/NightContainer.tsx`
  - Shell mínima con props `{ slug: string; initialData?: IInitialForecast }`; T020 la completa.

### Modificar

- `src/modules/location/types/location.types.ts`
  - `ICuratedCity { slug: string; name: string; coordinates: ICoordinates; elevationM: number | null; timeZone: string; description: string; isCurated: true }`

## Pasos detallados

1. Crear la lista curada. Bogotá, Guatavita y Villa de Leyva se rellenan con la geocodificación o con los datos del dueño; Tatacoa, Checua y Lago de Tota solo con los datos del dueño. Si aún no están, dejar la entrada fuera y anotarlo, sin inventar coordenadas.
2. Exportar `CURATED_SLUGS` y `getCuratedCity`.
3. En `page.tsx`:
   - `export const revalidate = 3600;`
   - `generateStaticParams()` devuelve `CURATED_CITIES.map(({ slug }) => ({ slug }))`.
   - `generateMetadata({ params })`: si `getCuratedCity` existe, título y descripción propios; si no, `{ robots: { index: false, follow: false } }`.
   - Componente: `const result = parseSlug(slug, CURATED_SLUGS); if (result.kind === 'invalid') notFound();`
   - Si es curada, `try { const forecast = await fetchForecast(city.coordinates, { cacheMode: 'server' }); return <NightContainer slug={slug} initialData={{ forecast, fetchedAt: Date.now() }} /> } catch { return <NightContainer slug={slug} /> }`.
   - Si son coordenadas, `return <NightContainer slug={slug} />` sin pedir datos.
4. Verificar que `fetchForecast` no se llama para slugs no curados.
5. Ejecutar `pnpm build` y contar las peticiones de pronóstico.

## Criterios de aceptación

- [x] `generateStaticParams` devuelve exactamente las ciudades curadas.
- [x] El número de peticiones del build coincide con el de ciudades curadas.
- [x] `generateMetadata` no llama a Open-Meteo.
- [x] Un slug válido no curado responde 200.
- [x] Un slug inválido responde 404.
- [x] Si Open-Meteo falla, la página se genera sin `initialData`.

## Verificación

- `pnpm build` y `pnpm start`; revisar la pestaña de red del navegador en un slug no curado y los registros del servidor.
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/clima/zipaquira_5.02_-73.99` devuelve 200.

## Notas y bloqueos

- No se responde 404 a un slug bien formado aunque no haya pronóstico; el estado vacío vive en el cliente.

## Registro de ejecución y desviaciones (2026-10-28)

### Trabajo realizado

- `src/modules/location/types/location.types.ts`: añadido `ICuratedCity` según el contrato de la task.
- `src/modules/location/constants/curated-cities.ts`: `CURATED_CITIES`, `CURATED_SLUGS` y `getCuratedCity`, con las tres ciudades curadas disponibles.
- `src/app/clima/[slug]/page.tsx`: `generateStaticParams`, `generateMetadata`, lectura del slug con `parseSlug(slug, CURATED_SLUGS)`, `notFound()` para inválidos, pronóstico de servidor solo para curadas, captura de error fuera del ámbito cacheado, `noindex` para no curadas y `<Suspense>` alrededor del contenedor.
- `src/modules/night/components/NightContainer.tsx`: shell mínima con `{ slug, initialData }`, completada después por T020.

### Desviaciones autorizadas

1. **`revalidate = 3600` → `'use cache'` + `cacheLife('hours')`.** El proyecto usa `cacheComponents`, donde `export const revalidate` no es compatible. La duración se declara en `fetchInitialForecast`, cuyo `cacheLife('hours')` tiene un `revalidate` de exactamente una hora (SPEC §7.4/§9 corregido). El `Date.now()` del `fetchedAt` queda dentro del ámbito cacheado, de modo que el instante real de la petición viaja con los datos.
2. **Solo tres ciudades curadas.** Tatacoa, Checua y Lago de Tota no están indexadas por la geocodificación de Open-Meteo y los datos del dueño siguen pendientes; no se inventaron coordenadas. La lista se amplía cuando lleguen.
3. **`description: ''` en las tres entradas.** El texto propio del dueño aún no existe. `generateMetadata` omite `description` mientras esté vacío, en lugar de publicar un texto inventado.
4. **Validación del slug en `src/proxy.ts`.** Con `partialPrefetching`, un slug inválido en una ruta dinámica nueva responde primero `200` con `x-nextjs-postponed: 1` y el 404 llega en el stream. Para cumplir «un slug inválido responde 404» con un código real se añadió el proxy con matcher `['/', '/clima/:slug']`, que reescribe a `/_not-found` con status 404. `notFound()` permanece en la página como contrato y respaldo (ver T018).
5. **`<Suspense>` en la página.** `useSearchParams` en el contenedor cliente y la lectura de `params` lo exigen con Cache Components; el fallback `NightPageSkeleton` replica el tamaño del bloque final.

### Corrección posterior (2026-11-02)

`next dev` reportaba en cada petición el aviso `instant-shell-url-data` porque `ClimaPage` hacía `await params` fuera del `<Suspense>`. La página pasó a ser síncrona y el acceso a `params` se movió a `ClimaContent`, un componente servidor asíncrono renderizado dentro del boundary. `generateStaticParams`, el prerenderizado y el 404 no cambian.

### Evidencia

- `pnpm build`: prerenderiza exactamente `/clima/bogota`, `/clima/guatavita` y `/clima/villa-de-leyva`; tres peticiones de pronóstico, una por curada. `generateMetadata` no genera peticiones.
- Slug no curado bien formado (`/clima/zipaquira_5.02_-73.99`): `200`, sin pronóstico inicial y sin petición de servidor.
- Slug inválido: `404` real desde la primera petición.
- `initialData` y `fetchedAt` aparecen serializados en el payload RSC.
- Fallo de Open-Meteo: la excepción se captura fuera de `'use cache'`, por lo que no se cachea el error y el contenedor se renderiza sin `initialData`.
- `pnpm test`, `pnpm typecheck`, `pnpm lint` y `pnpm build`: sin errores.

### Observación para T021/T022/T023

El HTML estático de las curadas contiene el esqueleto, no el pronóstico, porque `NightContainer` espera a `useSearchParams` y al reloj de cliente antes de pintar. El SPEC §7.6 exige que el contenido estático se renderice en el HTML; queda para las tasks visuales.
