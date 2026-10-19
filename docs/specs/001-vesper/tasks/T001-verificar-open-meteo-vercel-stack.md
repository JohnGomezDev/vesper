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
