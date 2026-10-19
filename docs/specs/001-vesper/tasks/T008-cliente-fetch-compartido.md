# T008 — Cliente fetch compartido

- **Fase:** F3
- **SPEC:** §5, §7.2
- **Depende de:** T004
- **Desbloquea:** T009
- **Estado:** Pendiente

## Objetivo

Tener una única función que ejecute las peticiones a Open-Meteo y bifurque el comportamiento servidor/cliente.

## Resultado esperado

`src/lib/api/api-client.ts` exporta `fetchOpenMeteo`, la clase `ApiError` y los tipos de opciones. Ninguna petición de la app se hace fuera de esta función.

## Alcance

**Incluye**

- Función `fetchOpenMeteo<T>(url, options)` con `cacheMode: 'server' | 'client'`.
- Servidor: `next: { revalidate: 3600 }`. Cliente: `cache: 'no-store'` y sin `revalidate`.
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
   - Construir `init`: `{ signal }` y, según `cacheMode`, `{ next: { revalidate: SERVER_REVALIDATE_SECONDS } }` o `{ cache: 'no-store' }`.
   - Nunca añadir `revalidate` en modo cliente.
   - `const response = await fetch(url, init as RequestInit & { next?: ... })` con un tipo auxiliar, sin `any`.
   - Si `!response.ok`, leer `await response.text()` y lanzar `new ApiError(...)`.
   - Si `ok`, `return (await response.json()) as T` solo tras validar el tipo en el servicio (el cast genérico está permitido).
3. Escribir pruebas con `fetch` simulado: modo servidor recibe `next.revalidate`, modo cliente recibe `cache: 'no-store'` y no `revalidate`, 400 lanza `ApiError` con el cuerpo, y un fallo de red se propaga.
4. Ejecutar `pnpm test src/lib/api`.

## Criterios de aceptación

- [ ] En modo cliente nunca aparece la propiedad `revalidate`.
- [ ] En modo servidor siempre aparece `revalidate: 3600`.
- [ ] Un 400 lanza `ApiError` con `status` 400 y el cuerpo de Open-Meteo.
- [ ] Un error de red se propaga tal cual, sin convertirse en `ApiError` de respuesta.
- [ ] Ninguna URL incluye `elevation` (eso se comprueba en T009).

## Verificación

- `pnpm test src/lib/api` pasa.
- Revisar en el código que no exista otro `fetch(` fuera de `api-client.ts`.

## Notas y bloqueos

- Si T001 concluyó que `next.revalidate` se declara de otra forma en la versión instalada, ajustar solo esta función y anotarlo.
