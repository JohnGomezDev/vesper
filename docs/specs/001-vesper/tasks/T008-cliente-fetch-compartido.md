# T008 — Cliente fetch compartido

- **Fase:** F3
- **SPEC:** §5, §7.2
- **Depende de:** T004
- **Desbloquea:** T009
- **Estado:** Terminada

## Objetivo

Tener una única función que ejecute las peticiones a Open-Meteo y bifurque el comportamiento servidor/cliente.

## Resultado esperado

`src/lib/api/api-client.ts` exporta `fetchOpenMeteo`, la clase `ApiError` y los tipos de opciones. Ninguna petición de la app se hace fuera de esta función.

## Alcance

**Incluye**

- Función `fetchOpenMeteo<T>(url, options)` con `cacheMode: 'server' | 'client'`.
- Servidor: sin opciones de caché de `fetch`; la caché la declara el wrapper `'use cache'` + `cacheLife` (SPEC §7.2, corrección de T001). Cliente: `cache: 'no-store'` y sin `revalidate`.
- Comprobación de `response.ok`; si falla, lanzar `ApiError` con `status` y el cuerpo textual.
- Propagación de `AbortSignal`.
- Constantes de las URLs base y de `SERVER_REVALIDATE_SECONDS = 3600`.
- Pruebas de las dos ramas, de un 400 y de un fallo de red.

**No incluye**

- Construir los parámetros de cada endpoint (es T009).
- Hooks de TanStack Query (es T010).

## Archivos

### Crear

- `src/lib/api/api-client.ts`
  - `class ApiError extends Error` con `status: number | null` y `body: string`.
  - `type TCacheMode = 'server' | 'client'`.
  - `interface IFetchOptions { cacheMode: TCacheMode; signal?: AbortSignal }`.
  - `function fetchOpenMeteo<T>(url: string, options: IFetchOptions): Promise<T>`.
- `src/lib/constants/api.constants.ts`
  - `OPEN_METEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'`
  - `OPEN_METEO_GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'`
  - `SERVER_REVALIDATE_SECONDS = 3600`
- `src/lib/api/api-client.test.ts`

### Modificar

- Ninguno.

## Pasos detallados

1. Crear `ApiError` guardando `status` y `body` y ajustando `name = 'ApiError'`.
2. Implementar `fetchOpenMeteo`:
   - Construir `init` con `{ signal }` y, según `cacheMode`, solo `{ signal }` en servidor o `{ cache: 'no-store' }` en cliente.
   - En servidor no se añade `next.revalidate`: con `cacheComponents: true` la caché se declara con `'use cache'` + `cacheLife` (SPEC §7.2 y §7.4; conclusión autorizada de T001).
   - Nunca añadir `revalidate` en modo cliente.
   - `const response = await fetch(url, init)` sin `any`.
   - Si `!response.ok`, leer `await response.text()` y lanzar `new ApiError(...)`.
   - Si `ok`, `return (await response.json()) as T` solo tras validar el tipo en el servicio (el cast genérico está permitido).
3. Escribir pruebas con `fetch` simulado: modo servidor recibe solo `signal` y ninguna opción de caché, modo cliente recibe `cache: 'no-store'` y no `revalidate`, 400 lanza `ApiError` con el cuerpo, y un fallo de red se propaga.
4. Ejecutar `pnpm test src/lib/api`.

## Criterios de aceptación

- [x] En modo cliente nunca aparece la propiedad `revalidate`.
- [x] En modo servidor no se declara `next.revalidate`; la caché la aporta el wrapper `'use cache'` + `cacheLife` de T019 (ajuste autorizado).
- [x] Un 400 lanza `ApiError` con `status` 400 y el cuerpo de Open-Meteo.
- [x] Un error de red se propaga tal cual, sin convertirse en `ApiError` de respuesta.
- [x] Ninguna URL incluye `elevation` (eso se comprueba en T009).

## Verificación

- `pnpm test src/lib/api` pasa.
- Revisar en el código que no exista otro `fetch(` fuera de `api-client.ts`.

## Notas y bloqueos

- Si T001 concluyó que `next.revalidate` se declara de otra forma en la versión instalada, ajustar solo esta función y anotarlo.

---

## Registro de ejecución y desviaciones (2026-10-27)

**Resultado.** Task ejecutada. `src/lib/api/api-client.ts` es el único punto de salida HTTP de la app: exporta `ApiError`, `TCacheMode`, `IFetchOptions` y `fetchOpenMeteo`. El modo cliente usa `cache: 'no-store'`; el modo servidor solo propaga el `AbortSignal`. Un 400 lanza `ApiError` con `status` y el cuerpo textual; un fallo de red se propaga sin envolver. Las constantes de URLs y `SERVER_REVALIDATE_SECONDS = 3600` viven en `src/lib/constants/api.constants.ts`.

**Archivos creados.**

- `src/lib/api/api-client.ts` — `ApiError`, `TCacheMode`, `IFetchOptions` y `fetchOpenMeteo`.
- `src/lib/constants/api.constants.ts` — URLs de pronóstico y geocodificación y `SERVER_REVALIDATE_SECONDS`.
- `src/lib/api/api-client.test.ts` — 4 pruebas.

**Archivos modificados.**

- `docs/specs/001-vesper/tasks/T008-cliente-fetch-compartido.md` — estado, alcance, pasos, criterios y este registro.
- `docs/specs/001-vesper/tasks/README.md` — T008 marcada como «Terminada» y convención de `cacheMode: 'server'` corregida.

**Decisiones y desviaciones.**

1. **Modo servidor sin `next.revalidate` (autorizado por el dueño).** La task pedía `next: { revalidate: 3600 }`, pero el SPEC §7.2/§7.4 y la corrección autorizada de T001 establecen que, con `cacheComponents: true`, `next.revalidate` no es el mecanismo de caché: la caché se declara con `'use cache'` + `cacheLife` en el wrapper de T019. Se implementó el modo servidor con `{ signal }` únicamente. `SERVER_REVALIDATE_SECONDS` se conserva para que T019 lo use en `cacheLife`. Se ajustaron el alcance, el paso 2 y el criterio de aceptación de esta task.
2. **Sin tipo auxiliar para `next`.** Al no enviar `next`, el `init` es un `RequestInit` normal y no hizo falta el tipo auxiliar ni ningún `as`. El único cast es el genérico `response.json() as T`, permitido por el paso 2 y validado después por las guardas de cada servicio.
3. **Mensaje de `ApiError` sin el cuerpo.** El cuerpo se guarda en `error.body` para que la interfaz lo muestre en desarrollo; el mensaje solo incluye el código de estado para no duplicar texto largo. No se inventó un texto de usuario.
4. **`revalidate` no aparece en el cliente.** Las pruebas comparan el `init` completo con `{ signal, cache: 'no-store' }`, así que cualquier propiedad añadida rompería el test.

**Verificación.**

- `pnpm test src/lib/api` — 2 archivos y 12 pruebas pasan (4 de `api-client` y 8 de `retry`).
- `pnpm typecheck` — sin errores.
- `pnpm lint` — 0 errores; se mantiene el warning preexistente de `prettier.config.mjs`.
- `pnpm build` — compila y prerenderiza `/` y `/_not-found`.
- `grep -rn "fetch(" src --include='*.ts' --include='*.tsx' | grep -v "\.test\."` devuelve solo `src/lib/api/api-client.ts:33`.
