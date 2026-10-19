# T020 — Contenedor cliente, búsqueda, GPS y nombres

- **Fase:** F6
- **SPEC:** §6.3, §8.1
- **Depende de:** T019
- **Desbloquea:** T021
- **Estado:** Pendiente

## Objetivo

Construir la capa cliente de `/clima/[slug]`: lectura de URL, cálculo de la noche, selección de lugar, búsqueda, GPS y nombres visibles.

## Resultado esperado

`NightContainer` resuelve el lugar, la noche y los datos; el usuario puede cambiar de noche con `router.replace`, buscar un lugar y usar su GPS. Las tasks T021 y T022 insertarán los bloques visuales dentro del contenedor.

## Alcance

**Incluye**

- Contenedor cliente que lee `slug` y `?date=` y usa `useForecast`/`useCurrent`.
- Prefetch e `initialData` con `initialDataUpdatedAt`.
- Cambio de noche y de lugar con `router.replace` y `scroll: false`.
- Selector de lista curada.
- Buscador React Hook Form: mínimo 3 caracteres, solo al pulsar, `count=7`.
- Resultados con nombre, región y país; nombre recordado en memoria de sesión.
- GPS solo con botón explícito, con rechazo, lentitud y fallo.
- Orden de nombres: curada → nombre recordado → etiqueta del slug → «Ubicación aproximada» con coordenadas.
- Aviso de zona horaria del lugar si difiere de la del dispositivo.
- Hook de análisis de noche con `useMemo`.

**No incluye**

- Los bloques visuales de datos (T021) y de astronomía/selectores (T022).
- La lista curada (T019).

## Archivos

### Crear

- `src/modules/location/hooks/use-search-form.ts` — lógica RHF del buscador.
- `src/modules/location/hooks/use-gps-location.ts` — `requestLocation()` y estados de error.
- `src/modules/location/hooks/use-location-name.ts` — nombre visible según el orden definido.
- `src/modules/location/components/SearchForm.tsx`
- `src/modules/location/components/LocationSelector.tsx`
- `src/modules/location/components/UseMyLocationButton.tsx`
- `src/modules/location/utils/name-cache.ts` — `rememberLocationName(coordinates, name)`, `recallLocationName(coordinates)`.
- `src/modules/night/hooks/use-night-analysis.ts` — calcula noche, filas, ventanas, mejor ventana, Luna y resumen.
- `src/modules/night/components/NightContainer.tsx` (reescritura completa).

### Modificar

- `src/app/clima/[slug]/page.tsx` — envolver `NightContainer` en `<Suspense>` si T001 lo confirma necesario.

## Pasos detallados

1. Implementar `use-search-form` con `useForm<{ query: string }>` y reglas `required` y `minLength: 3`; exponer `results`, `isSearching`, `isError` desde `useGeocoding`; al enviar, activar la query.
2. Implementar `use-gps-location`:
   - `requestLocation(): Promise<void>` con `navigator.geolocation.getCurrentPosition` y `{ timeout: 10000 }`.
   - Mapear `PERMISSION_DENIED`, `POSITION_UNAVAILABLE` y `TIMEOUT` a mensajes en español.
   - Al resolver, redondear, guardar «Mi ubicación» en `name-cache` y navegar a `ROUTES.clima.detail(buildCoordinatesSlug(null, coords))`.
3. Implementar `use-location-name` con el orden curada → `recallLocationName` → etiqueta del slug → «Ubicación aproximada» y las coordenadas redondeadas.
4. Implementar `NightContainer`:
   - `'use client'`.
   - Parsear el slug con `parseSlug(slug, CURATED_SLUGS)`.
   - Resolver coordenadas y `initialData` de `useForecast`.
   - `useSearchParams()` para `date`, `usePathname()` y `useRouter()`.
   - Calcular la noche actual solo tras montar (`useEffect` + estado `mounted`) para evitar hidratación.
   - `use-night-analysis` con `useMemo` sobre `[coordinates, date, threshold, forecast]`.
   - `router.replace(ROUTES.clima.detail(slug) + '?date=' + date, { scroll: false })` al cambiar de noche.
   - Renderizar el selector de lugar y un `<main>` que T021/T022 completan.
5. Implementar `use-night-analysis` reutilizando T006, T014, T016 y T017; devolver `{ nightDate, isArchived, rows, window, windows, bestWindow, moon, summary, sunAltitudes }`.
6. Escribir pruebas de `name-cache` y de `use-search-form` (validación).
7. Ejecutar `pnpm test` y `pnpm build`.

## Criterios de aceptación

- [ ] No se pide permiso de GPS al cargar.
- [ ] Un enlace frío a un slug de coordenadas no llama a geocodificación.
- [ ] Cambiar de noche usa `replace` y no apila historial.
- [ ] El aviso de zona horaria aparece solo si difiere de la del dispositivo.
- [ ] No se muestran datos de un lugar bajo el nombre de otro.
- [ ] El buscador no busca con menos de 3 caracteres ni sin pulsar.

## Verificación

- `pnpm build` pasa sin errores de `useSearchParams`.
- Probar búsqueda, GPS, enlace frío, cambio de noche y botón atrás.

## Notas y bloqueos

- El nombre «Mi ubicación» para el GPS es texto de interfaz; no altera el modelo de datos.
