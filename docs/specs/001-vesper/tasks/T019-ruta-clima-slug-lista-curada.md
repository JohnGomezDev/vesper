# T019 — Ruta `/clima/[slug]`, lista curada y datos iniciales

- **Fase:** F6
- **SPEC:** §6.2, §7.1, §7.4, §7.5, §9
- **Depende de:** T010, T011, T017
- **Desbloquea:** T020, T024
- **Estado:** Pendiente
- **Bloqueo:** los datos de Tatacoa, Checua y Lago de Tota los entrega el dueño (T002).

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

- [ ] `generateStaticParams` devuelve exactamente las ciudades curadas.
- [ ] El número de peticiones del build coincide con el de ciudades curadas.
- [ ] `generateMetadata` no llama a Open-Meteo.
- [ ] Un slug válido no curado responde 200.
- [ ] Un slug inválido responde 404.
- [ ] Si Open-Meteo falla, la página se genera sin `initialData`.

## Verificación

- `pnpm build` y `pnpm start`; revisar la pestaña de red del navegador en un slug no curado y los registros del servidor.
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/clima/zipaquira_5.02_-73.99` devuelve 200.

## Notas y bloqueos

- No se responde 404 a un slug bien formado aunque no haya pronóstico; el estado vacío vive en el cliente.
