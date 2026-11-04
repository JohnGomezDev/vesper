# T020 — Contenedor cliente, búsqueda, GPS y nombres

- **Fase:** F6
- **SPEC:** §6.3, §8.1
- **Depende de:** T019
- **Desbloquea:** T021
- **Estado:** Terminada (2026-10-28)

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

- [x] No se pide permiso de GPS al cargar.
- [x] Un enlace frío a un slug de coordenadas no llama a geocodificación.
- [x] Cambiar de noche usa `replace` y no apila historial.
- [x] El aviso de zona horaria aparece solo si difiere de la del dispositivo.
- [x] No se muestran datos de un lugar bajo el nombre de otro.
- [x] El buscador no busca con menos de 3 caracteres ni sin pulsar.

## Verificación

- `pnpm build` pasa sin errores de `useSearchParams`.
- Probar búsqueda, GPS, enlace frío, cambio de noche y botón atrás.

## Notas y bloqueos

- El nombre «Mi ubicación» para el GPS es texto de interfaz; no altera el modelo de datos.

## Registro de ejecución y desviaciones (2026-10-28)

### Trabajo realizado

- `src/modules/location/utils/name-cache.ts`: caché de nombres en memoria de sesión, clave por coordenadas redondeadas; `rememberLocationName` y `recallLocationName`.
- `src/modules/location/hooks/use-search-form.ts`: `useForm<{ query: string }>`, reglas `required` y `minLength: 3`, query de geocodificación activada solo al enviar.
- `src/modules/location/hooks/use-gps-location.ts`: `requestLocation()` con `getCurrentPosition(..., { timeout: 10000 })`, traducción de `PERMISSION_DENIED`, `POSITION_UNAVAILABLE` y `TIMEOUT`, nombre «Mi ubicación» en caché y navegación con `router.replace`.
- `src/modules/location/hooks/use-location-name.ts`: orden curada → nombre recordado → etiqueta del slug → «Ubicación aproximada» con coordenadas.
- `src/modules/location/components/SearchForm.tsx`, `LocationSelector.tsx` y `UseMyLocationButton.tsx`.
- `src/modules/night/hooks/use-night-analysis.ts`: cálculo memoizado de noche, filas, ventanas, mejor ventana, Luna, resumen y altitudes solares.
- `src/modules/night/components/NightContainer.tsx`: contenedor cliente completo.
- `src/app/clima/[slug]/page.tsx`: `NightContainer` envuelto en `<Suspense>` con `NightPageSkeleton`.

### Desviaciones autorizadas

1. **Pruebas de `name-cache` y `use-search-form` omitidas por decisión del dueño.** El paso 6 y su criterio de verificación quedan sin cubrir a propósito; la validación se comprobó en navegador. Cuando se retomen, los archivos previstos son `name-cache.test.ts` y una prueba de validación de `use-search-form`.
2. **`useEffect` + `mounted` sustituido por `useSyncExternalStore`.** El lint del React Compiler prohíbe `setState` síncrono dentro de un efecto y `Date.now()` durante el render. Se usa una instantánea de reloj de 15 minutos (`server snapshot = 0`) que además mantiene el cálculo de la noche actualizado sin estado duplicado.
3. **Umbral de altitud temporal fijo en 15°.** T022 introducirá `AltitudeThresholdProvider`; hasta entonces `NightContainer` usa `TEMPORARY_ALTITUDE_THRESHOLD` y lo sustituirá por el valor del contexto.
4. **`getPlanetElongation` añadido a `src/modules/astronomy/services/planets.service.ts`.** Está fuera de la lista de archivos de la task, pero es necesario para alimentar `elongationByObject` sin llamar a `getPlanetInfo` por cada planeta en cada render. Autorizado antes de implementarlo.
5. **URL de la noche con `usePathname()` y respaldo canónico.** El cambio de noche usa `router.replace(ROUTES.clima.detail(slug) + '?date=' + date, { scroll: false })`; si `usePathname()` no está disponible se usa `ROUTES.clima.detail(slug)`.
6. **404 real de slugs inválidos mediante `src/proxy.ts`.** Ver T018/T019: sin el proxy la primera respuesta de una ruta dinámica nueva es un 200 con streaming del 404.
7. **La puntuación de nubosidad de la mejor ventana es la media de las filas solapadas.** `pickBestWindow` espera un valor numérico de nubosidad por ventana, no una serie horaria.
8. **`isArchived` compara con la noche actual (`nightDate < currentNightDate`), no con el día local.** A la 1 de la madrugada la noche en curso no debe marcarse como archivada.
9. **Altitudes solares con `getSunPosition` (refracción aplicada).** La diferencia cerca de −18° se documenta como decisión.
10. **`?date=` inválido o fuera de rango cae en la noche actual.** El mensaje descriptivo se difiere a T022/T023.
11. **El cambio de noche actualiza `?date=` con `replace`, sin apilar historial.** Verificado con `history.length` constante.

### Evidencia (navegador y comandos)

- Al cargar, el permiso de GPS sigue en `prompt`; no se pide ubicación ni se geocodifica.
- 2 caracteres: «Escribe al menos 3 caracteres.» y cero peticiones de geocodificación. 3 caracteres y envío: una petición, 7 resultados con nombre, región y país.
- Cambio de noche: `?date=2026-10-29`, `history.length` sin cambios (replace).
- Bogotá sin aviso de zona horaria; Madrid muestra «Horas locales de Madrid · Europe/Madrid».
- GPS: navega a `/clima/4.71_-74.07` y el título es «Mi ubicación».
- Selección del buscador: navega a `/clima/villa-de-leyva_5.63_-73.52` con el nombre recordado «Villa de Leyva, Departamento de Boyacá, Colombia».
- `pnpm test`: 22 archivos, 362 pruebas correctas. `pnpm typecheck`, `pnpm lint` (0 errores), `pnpm build` y Prettier en los archivos tocados: sin errores.

### Corrección posterior (2026-11-02)

**Fallo 1:** tras una búsqueda, al pulsar «Usar mi ubicación precisa» el listado de resultados seguía desplegado. La lista se renderizaba siempre que `results.length > 0`, sin estado de apertura ni cierre; el clic en GPS no lo descartaba y el estado sobrevivía a la navegación entre slugs.

**Fallo 2:** tras una búsqueda, el clic en GPS volvía a rellenar el input con el término buscado y, al borrarlo, aparecía «Escribe un lugar.». El formulario reiniciado vivía en el estado local de cada página; al volver por GPS a una URL ya visitada, Next.js restauraba la página cacheada con su formulario antiguo (texto y estado enviado incluidos).

**Solución:**

- `use-search-form` expone `isResultsOpen` y `closeResults()`. La lista solo se abre con un envío válido del formulario.
- `SearchForm` cierra los resultados al seleccionar un resultado, al hacer `pointerdown` fuera del buscador (incluye el botón de GPS y los selectores), al sacar el foco del buscador y con `Escape`.
- Los mensajes de error y «No se encontraron lugares» solo se muestran con el listado abierto.
- `use-search-reset` mantiene un token global con `useSyncExternalStore`. `resetSearch()` lo incrementa y todas las páginas montadas —incluidas las que Next.js conserva ocultas en su caché de cliente— reinician su `SearchForm` mediante `key={`${slug}-${searchResetToken}`}`.
- Se llama a `resetSearch()` al pedir GPS (`onBeforeRequest`), al elegir una ciudad curada (`onSelect`) y al seleccionar un resultado de búsqueda.
- `UseMyLocationButton` acepta `onBeforeRequest` y `LocationSelector` acepta `onSelect`; ambos avisan antes de navegar.

**Verificación:** con `/clima/4.71_-74.07` ya visitado, se busca «Villeta» en esa página, se elige el resultado y se pulsa GPS de nuevo. Antes, el input restaurado mostraba «Villeta» y al borrarlo aparecía «Escribe un lugar.»; ahora vuelve vacío y sin error. También quedan vacíos el formulario visible y el de la página cacheada al elegir una ciudad curada. `pnpm test` (22 archivos, 362 pruebas), `pnpm typecheck`, `pnpm lint` (0 errores) y Prettier siguen correctos.

### Pendiente para T021/T022/T023

El HTML estático de una ciudad curada muestra el esqueleto porque el contenedor espera a `useSearchParams` y al reloj de cliente. El SPEC §7.6 exige contenido estático en el HTML; las tasks visuales deben resolverlo.
