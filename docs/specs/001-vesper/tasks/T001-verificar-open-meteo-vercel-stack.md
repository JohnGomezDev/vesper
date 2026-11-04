# T001 — Verificar Open-Meteo, Vercel y el stack de caché

- **Fase:** F0
- **SPEC:** §5.1, §5.2, §5.3, §6.1, §7, §13
- **Depende de:** —
- **Desbloquea:** T003, T008, T009, T010, T018, T019
- **Estado:** Pendiente

## Objetivo

Eliminar las suposiciones sobre datos externos antes de construir código encima.

## Resultado esperado

Un archivo `docs/specs/001-vesper/verification-notes.md` con una sección por suposición, la consulta exacta usada, la respuesta observada y la conclusión. El `SPEC.md` queda con sus marcas actualizadas: `[VERIFICADO]` o corrección acordada con el dueño.

## Alcance

**Incluye**

- Existencia y nombre exacto de cada variable de `hourly` y `current` del SPEC §5.1.
- Validez conjunta de `past_days=3` con `forecast_days=16` y número real de días devueltos.
- Formato y escala de `moon_phase` (solo verificación cruzada, nunca fuente de la Luna).
- Cuerpo y código de una respuesta 400 y de una 429.
- Peso real de la consulta grande en el contador de Open-Meteo.
- Campos exactos de `https://geocoding-api.open-meteo.com/v1/search`.
- Nombres exactos de las cabeceras de IP de Vercel.
- Comportamiento de `revalidate` en la versión instalada de Next.js con `cacheComponents` y `partialPrefetching`: forma de declararlo, efecto en `generateStaticParams` y qué ocurre si falla una regeneración.
- Si leer `?date=` con `useSearchParams` en un componente cliente exige `<Suspense>`.
- Nombre exacto en TanStack Query v5 de la opción que fija la hora del dato inicial.

**No incluye**

- Escribir código de producción.
- Decisiones de diseño visual.
- Cambiar el alcance o reabrir decisiones `[CERRADO]`.

## Archivos

### Crear

- `docs/specs/001-vesper/verification-notes.md` — registro de evidencias. Una sección por punto con: suposición, método, resultado, conclusión.

### Modificar

- `docs/specs/001-vesper/SPEC.md` — cambiar `[POR VERIFICAR]` por `[VERIFICADO]` o anotar la corrección acordada en §5.1, §5.2, §6.1 y §13.

## Pasos detallados

1. Anotar la versión instalada: `node -e "console.log(require('next/package.json').version)"` y `pnpm list @tanstack/react-query`.
2. Consultar Context7 para Next.js: forma de `revalidate` en una ruta con `generateStaticParams`, comportamiento con `cacheComponents` y requisito de `Suspense` con `useSearchParams`.
3. Consultar Context7 para TanStack Query v5: nombre y firma de la opción de hora del dato inicial.
4. Ejecutar y guardar la respuesta de:
   `https://api.open-meteo.com/v1/forecast?latitude=4.61&longitude=-74.08&hourly=cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,visibility,temperature_2m,relative_humidity_2m,dew_point_2m,wind_speed_10m,wind_gusts_10m,precipitation_probability,precipitation,is_day&daily=sunrise,sunset,moon_phase&current=temperature_2m,relative_humidity_2m,dew_point_2m,cloud_cover,wind_speed_10m,wind_gusts_10m,is_day&timezone=auto&past_days=3&forecast_days=16`
5. Ejecutar la misma URL con una variable inventada (`hourly=no_existe`) y guardar código y cuerpo.
6. Probar la geocodificación con 2 caracteres y con 3, y guardar los campos de un resultado.
7. Revisar la documentación de Vercel sobre cabeceras de IP y anotar los nombres exactos.
8. Medir el peso de la consulta con el formulario de llamadas de Open-Meteo y anotar el número de llamadas que suma.
9. Actualizar el SPEC y el archivo de verificación.
10. Si algo contradice el SPEC, detenerse y avisar al dueño antes de cerrar la task.

## Criterios de aceptación

- [ ] Cada variable usada por la app existe con el nombre escrito.
- [ ] `past_days=3` y `forecast_days=16` conviven y devuelven 19 días.
- [ ] Está documentado el formato de `moon_phase` y la decisión de no usarlo como fuente.
- [ ] Está documentado el cuerpo de error 400.
- [ ] Están anotados los nombres exactos de las cabeceras de IP.
- [ ] Está anotada la forma de `revalidate`, el uso de `Suspense` y la opción de hora inicial.
- [ ] El SPEC ya no tiene `[POR VERIFICAR]` sin resolver en estos puntos.

## Verificación

- `verification-notes.md` contiene las consultas y respuestas literales.
- `grep -n "POR VERIFICAR" docs/specs/001-vesper/SPEC.md` ya no muestra estos puntos.

## Notas y bloqueos

- Si una suposición resulta falsa, no se improvisa: se avisa al dueño y se ajusta el SPEC.

---

## Registro de ejecución y desviaciones (2026-10-19)

**Resultado.** Task ejecutada. Se creó `docs/specs/001-vesper/verification-notes.md` y se actualizó `docs/specs/001-vesper/SPEC.md`. No se escribió código de producción ni se añadieron dependencias.

**Desviaciones y decisiones.**

1. **`revalidate` incompatible con `cacheComponents` (corrección autorizada).** La verificación contra Next.js 16.4.1 y su documentación instalada mostró que `export const revalidate` en la ruta produce error con `cacheComponents: true`. Se avisó al dueño y se autorizó mantener `cacheComponents` + `partialPrefetching` y documentar la revalidación con `'use cache'` + `cacheLife('hours')` (o `revalidate: 3600`). Se corrigieron §3, §3.1, §7.2, §7.4, §7.5 y §9 del SPEC. El `fetch` del servidor se cachea al ejecutarse dentro de `'use cache'` con `cacheLife`; `next: { revalidate: 3600 }` no cachea por sí solo con `cacheComponents`.
2. **429 no provocada en vivo.** Para no superar deliberadamente el límite de 600 llamadas/minuto, la respuesta 429 se documentó desde el código fuente oficial de Open-Meteo (`RateLimiter.swift` y `configure.swift`). El 400 sí se capturó en vivo. Código y cuerpo están en `verification-notes.md` §4.
3. **Peso de la consulta calculado con la fórmula oficial, no con el formulario web.** El formulario interactivo de precios no se pudo operar desde la terminal. Se usó la fórmula de `ForecastApiResult.calculateQueryWeight()` y el conteo de variables del servidor. La consulta combinada de T001 (23 variables, 19 días) suma ≈3,12 llamadas. Detalle en `verification-notes.md` §5.
4. **TanStack Query no está instalado.** `pnpm list @tanstack/react-query --depth 0` no devuelve nada y `package.json` no lo incluye. No se pudo verificar contra una versión instalada; `initialDataUpdatedAt` se confirmó contra la documentación de v5 (timestamp en milisegundos). No se añadió la dependencia.
5. **Matices de geocodificación.** Los campos pedidos existen, pero `country` puede faltar en registros aislados (`Bøur`) y con 2 caracteres `Bo` devolvió `Bøur` (prefijo, no coincidencia exacta). La app exige 3 caracteres, así que no afecta al flujo; se anotó en §5.2 y en `verification-notes.md` §6.
6. **Interpolación de `current`.** La respuesta trae `current.interval: 900` y el código fuente interpola a 15 minutos; no es un comportamiento limitado a Europa central y Norteamérica. Se matizó §5.1 y se documentó en `verification-notes.md` §1 y §11.
7. **Puntos fuera del alcance de T001.** Siguen pendientes las funciones exactas de astronomy-engine (refracción y culminación) y las coordenadas/altitud/zona horaria de las ciudades curadas. No se tocaron.

**Archivos tocados.**

- `docs/specs/001-vesper/verification-notes.md` — creado; contiene consultas, respuestas literales, conclusiones y el apéndice con la respuesta completa de la consulta grande.
- `docs/specs/001-vesper/SPEC.md` — marcas y correcciones en §3, §3.1, §5.1, §5.2, §5.3, §6.1, §6.3, §7.2, §7.3, §7.4, §7.5, §9 y §13.
- `docs/specs/001-vesper/tasks/T001-verificar-open-meteo-vercel-stack.md` — esta sección de registro.

**Criterios de aceptación.**

- [x] Cada variable usada por la app existe con el nombre escrito.
- [x] `past_days=3` y `forecast_days=16` conviven y devuelven 19 días.
- [x] Está documentado el formato de `moon_phase` y la decisión de no usarlo como fuente.
- [x] Está documentado el cuerpo de error 400 (y el de 429, desde el código fuente).
- [x] Están anotados los nombres exactos de las cabeceras de IP.
- [x] Está anotada la forma de `revalidate`, el uso de `Suspense` y la opción de hora inicial.
- [x] El SPEC ya no tiene `[POR VERIFICAR]` sin resolver en los puntos de T001. Quedan la definición de la leyenda (línea 11) y §5.4 (astronomy-engine), fuera del alcance de esta task.

**Verificación.**

- `verification-notes.md` contiene las consultas y respuestas literales; el apéndice A reproduce la respuesta completa de la consulta grande.
- `grep -n "POR VERIFICAR" docs/specs/001-vesper/SPEC.md` devuelve solo la definición de la leyenda y §5.4 (astronomy-engine).
