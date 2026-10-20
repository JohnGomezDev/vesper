# Tasks — 001-vesper

Tasks generadas a partir del [`PLAN.md`](../PLAN.md). Cada archivo es una unidad ejecutable, acotada y verificable. Antes de tocar una task, leer el [`SPEC.md`](../SPEC.md) y estas convenciones comunes.

## Convenciones de implementación comunes

### Arquitectura de archivos

```text
src/
├── app/
│   ├── layout.tsx                    # layout raíz con Providers
│   ├── page.tsx                      # redirección por IP
│   ├── not-found.tsx
│   ├── error.tsx
│   ├── globals.css
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── terminos/page.tsx
│   ├── privacidad/page.tsx
│   └── clima/[slug]/page.tsx
├── components/
│   ├── ui/{LoadingState,ErrorState,EmptyState,Skeleton}.tsx
│   └── Attribution.tsx
├── lib/
│   ├── api/api-client.ts
│   ├── providers/Providers.tsx
│   └── constants/routes.constants.ts
└── modules/
    ├── location/  { components, constants, hooks, services, types, utils }
    ├── weather/   { components, constants, hooks, services, types }
    ├── astronomy/ { components, services, types, utils }
    ├── night/     { components, constants, types, utils }
    └── legal/     { components }
```

- Carpetas `utils/` y `constant/`: helpers puros y constantes. Los nombres de archivo son kebab-case.
- Sin archivos `index.ts` de barril: se importa siempre desde el archivo exacto.
- Cada módulo declara sus propios `*.query-keys.ts`; nunca se comparten claves entre módulos.
- Las pruebas viven junto a la unidad que prueban, con sufijo `*.test.ts`.

### Reglas de código

- Identificadores en inglés; textos de interfaz en español. Ver `AGENTS.md`.
- Interfaces con prefijo `I`, alias de tipo con prefijo `T`, hooks con prefijo `use`.
- Componentes con export nombrado y tipo de retorno `React.JSX.Element` o `React.ReactNode`.
- `'use client'` lo más abajo posible del árbol.
- Sin `as` inseguros, sin `any`, sin `@ts-ignore` sin justificar.
- No llamar a servicios ni a `fetch` desde componentes: solo desde hooks o desde páginas de servidor.

### Tipos base compartidos

Se definen en `src/modules/location/types/location.types.ts` y los importa el resto de módulos:

```ts
export interface ICoordinates {
  latitude: number; // grados, 2 decimales
  longitude: number; // grados, 2 decimales
}

export interface ILocation {
  slug: string;
  name: string;
  coordinates: ICoordinates;
  elevationM: number | null;
  timeZone: string; // IANA
  isCurated: boolean;
}
```

### Unidades y representaciones

- Instantes internos: epoch en milisegundos UTC (`number`).
- Open-Meteo entrega horas locales sin offset (`2026-10-19T18:00`); se convierten con `parseLocalDateTime(localIso, timeZone)`.
- Todo lo visible se formatea en la zona horaria del lugar.
- Nubosidad, iluminación y humedad: porcentaje 0–100.
- Altitudes y separaciones: grados.
- Duraciones: milisegundos.

### Errores de red

`src/lib/api/api-client.ts` exporta:

```ts
export class ApiError extends Error {
  readonly status: number | null;
  readonly body: string;
  constructor(message: string, status: number | null, body: string);
}

export type TCacheMode = 'server' | 'client';

export interface IFetchOptions {
  cacheMode: TCacheMode;
  signal?: AbortSignal;
}

export function fetchOpenMeteo<T>(url: string, options: IFetchOptions): Promise<T>;
```

- `cacheMode: 'server'` añade `next: { revalidate: 3600 }`.
- `cacheMode: 'client'` añade `cache: 'no-store'` y nunca `revalidate`.
- Un status no `ok` lanza `ApiError` con el cuerpo de Open-Meteo.

### Servicios

Todo servicio recibe las coordenadas y `IFetchOptions`, y devuelve la respuesta ya tipada:

```ts
export function fetchForecast(
  coordinates: ICoordinates,
  options: IFetchOptions,
): Promise<IForecastResponse>;
```

El hook de TanStack Query pasa `{ signal, cacheMode: 'client' }`; la página de servidor pasa `{ cacheMode: 'server' }`.

### Fechas y pruebas

- Las utilidades de fecha reciben `timeZone` explícito; nunca usan la zona de la máquina.
- Las pruebas fijan fechas en UTC y pasan la zona de forma explícita.
- Cada dado nulo se trata como desconocido; nunca se sustituye por cero.

### Estados internos explícitos

Cuando una operación puede fallar por validación (slug inválido, fecha fuera de rango, noche sin puesta ni salida), se devuelve una unión discriminada en vez de lanzar:

```ts
export type TSlugParseResult =
  | { kind: 'curated'; slug: string }
  | { kind: 'coordinates'; label: string | null; coordinates: ICoordinates }
  | { kind: 'invalid' };
```

## Diseño

Las imágenes de referencia viven en [`../design/`](../design/README.md). Las tasks de UI las toman como fuente visual; si una imagen contradice el SPEC, manda el SPEC.

## Formato obligatorio de cada task

1. Metadatos (fase, SPEC, dependencias, estado).
2. Objetivo.
3. Resultado esperado.
4. Alcance (incluye / no incluye).
5. Archivos (crear / modificar) con los símbolos exportados.
6. Pasos detallados.
7. Criterios de aceptación.
8. Verificación.
9. Notas y bloqueos.

## Índice

| Task | Fase | Título                                                 | Depende de             | Estado    |
| ---- | ---- | ------------------------------------------------------ | ---------------------- | --------- |
| T001 | F0   | Verificar Open-Meteo, Vercel y el stack de caché       | —                      | Terminada |
| T002 | F0   | Verificar astronomy-engine y recopilar datos del dueño | —                      | Terminada |
| T003 | F1   | Dependencias, scripts y configuración base             | T001                   | Terminada |
| T004 | F1   | Esqueleto base: Provider, layout, base visual y rutas  | T003                   | Terminada |
| T005 | F2   | Tipos de dominio y validación de URL                   | T004                   | Pendiente |
| T006 | F2   | Zona horaria, noches y noche actual                    | T005                   | Pendiente |
| T007 | F2   | Pruebas de dominio                                     | T006                   | Pendiente |
| T008 | F3   | Cliente fetch compartido                               | T004                   | Pendiente |
| T009 | F3   | Servicios de Open-Meteo y geocodificación              | T008                   | Pendiente |
| T010 | F3   | Query keys, hooks, caché y reintentos                  | T009                   | Pendiente |
| T011 | F3   | Prefetch, datos iniciales y pruebas de datos           | T010                   | Pendiente |
| T012 | F4   | Observador, conversión de tiempo y Sol                 | T006                   | Pendiente |
| T013 | F4   | Luna y planetas                                        | T012                   | Pendiente |
| T014 | F4   | Muestreo de 10 minutos y pruebas de humo               | T013                   | Pendiente |
| T015 | F5   | Nubosidad y fases lunares                              | T006, T014             | Pendiente |
| T016 | F5   | Ventanas de observación e interferencia lunar          | T015                   | Pendiente |
| T017 | F5   | Mejor ventana, puntuación y pruebas                    | T016                   | Pendiente |
| T018 | F6   | Redirección de `/` por cabeceras de IP                 | T005, T007             | Pendiente |
| T019 | F6   | Ruta `/clima/[slug]`, lista curada y datos iniciales   | T010, T011, T017       | Pendiente |
| T020 | F6   | Contenedor cliente, búsqueda, GPS y nombres            | T019                   | Pendiente |
| T021 | F7   | Bloque «Ahora» y tira horaria                          | T020                   | Pendiente |
| T022 | F7   | Luna, ventanas y selectores                            | T021                   | Pendiente |
| T023 | F7   | Estados, accesibilidad e hidratación                   | T022                   | Pendiente |
| T024 | F8   | SEO, sitemap, robots y noindex                         | T019                   | Pendiente |
| T025 | F8   | Páginas legales                                        | T004                   | Pendiente |
| T026 | F8   | Atribución, not-found y error                          | T004                   | Pendiente |
| T027 | F9   | Aceptación §12 y comprobaciones de red                 | T023, T024, T025, T026 | Pendiente |
| T028 | F9   | Casos límite, zonas horarias y contraste astronómico   | T027                   | Pendiente |
| T029 | F9   | Despliegue en Vercel                                   | T027, T028             | Pendiente |

## Orden de ejecución

`T001–T002` → `T003–T004` → `T005–T007` → `T008–T011` → `T012–T014` → `T015–T017` → `T018–T020` → `T021–T023` → `T024–T026` → `T027–T029`.

Las tasks de una misma fase pueden solaparse, pero no se adelanta una dependencia. Las tasks que dependen de datos del dueño (T019, T025) se completan cuando los datos estén disponibles, sin inventarlos.
