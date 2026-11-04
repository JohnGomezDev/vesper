# T004 — Esqueleto base: Provider, layout, base visual y rutas

- **Fase:** F1
- **SPEC:** §3, §11
- **Depende de:** T003
- **Desbloquea:** T005, T008, T025, T026
- **Diseño:** usar las imágenes de `docs/specs/001-vesper/design/` cuando estén disponibles.
- **Estado:** Terminada

## Objetivo

Crear el esqueleto técnico y visual sobre el que se construyen los módulos.

## Resultado esperado

La app arranca con un `QueryClient` estable montado en el layout raíz, tokens visuales base, componentes de estado compartidos, rutas constantes y un entorno de pruebas que ejecuta una prueba de ejemplo.

## Alcance

**Incluye**

- `Providers` con un `QueryClient` por sesión, con `staleTime` y `gcTime` por defecto del SPEC §7.3.
- Layout raíz que monta `Providers` y define metadata base.
- Tokens de tema y estilos base en `globals.css`.
- Componentes compartidos: carga, error, vacío y esqueleto.
- Constantes de rutas del SPEC §6.
- Estructura de carpetas de `src/modules/`.
- Configuración de Vitest para lógica pura.

**No incluye**

- Lógica de negocio, hooks de datos ni componentes de la pantalla.
- La atribución a Open-Meteo (es T026).
- La política de reintentos (es T010).

## Archivos

### Crear

- `src/lib/providers/Providers.tsx` — `'use client'`; exporta `Providers` y la instancia de `QueryClient` por sesión.
- `src/components/ui/LoadingState.tsx` — exporta `LoadingState`.
- `src/components/ui/ErrorState.tsx` — exporta `ErrorState`.
- `src/components/ui/EmptyState.tsx` — exporta `EmptyState`.
- `src/components/ui/Skeleton.tsx` — exporta `Skeleton`.
- `src/lib/constants/routes.constants.ts` — exporta `ROUTES`.
- `vitest.config.ts` — entorno `node`, patrón `src/**/*.test.ts`.
- `src/lib/constants/routes.constants.test.ts` — prueba de ejemplo que verifica `ROUTES.clima.detail('bogota')`.

### Modificar

- `src/app/layout.tsx` — envolver `children` con `Providers`, metadata base.
- `src/app/globals.css` — tokens de tema y estilos base.

## Pasos detallados

1. Crear `Providers`:
   ```tsx
   'use client';
   import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
   import { useState } from 'react';
   ```
   El `QueryClient` se crea con `useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 60 * 60 * 1000, gcTime: 24 * 60 * 60 * 1000 } } }))`. No deshabilitar `refetchOnWindowFocus` ni cambiar el comportamiento de pestaña oculta.
2. Crear `ROUTES`:
   ```ts
   export const ROUTES = {
     home: '/',
     clima: { detail: (slug: string) => `/clima/${slug}` },
     legal: { terms: '/terminos', privacy: '/privacidad' },
   } as const;
   ```
3. Crear los cuatro componentes de estado con las props:
   - `ILoadingStateProps { label?: string }`
   - `IErrorStateProps { message: string; onRetry?: () => void }`
   - `IEmptyStateProps { message: string; children?: React.ReactNode }`
   - `ISkeletonProps { className?: string }`
4. Montar `Providers` en `layout.tsx` y añadir `metadata` base (`title`, `description`).
5. Definir en `globals.css` los tokens a partir de las imágenes de referencia, con `@theme inline`.
6. Configurar `vitest.config.ts` con el alias `@` apuntando a `src`.
7. Crear la estructura de carpetas de `modules/` con un `.gitkeep` en las vacías.
8. Ejecutar `pnpm test` y `pnpm build`.

## Criterios de aceptación

- [x] `QueryClient` no se recrea al navegar entre rutas.
- [x] `app/` no contiene lógica de negocio ni llamadas a `fetch`.
- [x] Ningún componente escribe rutas a mano: todas salen de `ROUTES`.
- [x] Los componentes de estado tienen el tamaño final para evitar saltos.
- [x] Las animaciones respetan `prefers-reduced-motion`.
- [x] `pnpm test` ejecuta la prueba de ejemplo.

## Verificación

- `pnpm test` y `pnpm build` pasan.
- Navegar entre `/` y una ruta de prueba y comprobar en React Query Devtools que la caché persiste.

## Notas y bloqueos

- Si aún no hay imágenes de diseño, usar tokens neutros y dejar los valores finales para cuando lleguen, sin bloquear la task.

---

## Registro de ejecución y desviaciones (2026-10-20)

**Resultado.** Task ejecutada. La app arranca con `Providers` montado en el layout raíz, un `QueryClient` creado una vez por sesión con `staleTime` de 1 hora y `gcTime` de 24 horas, tokens visuales base, los cuatro componentes de estado compartidos, `ROUTES` y Vitest con una prueba de ejemplo. `pnpm test`, `pnpm typecheck`, `pnpm lint` y `pnpm build` pasan.

**Archivos creados.**

- `src/lib/providers/Providers.tsx` — `Providers` con `QueryClient` por sesión.
- `src/components/ui/LoadingState.tsx`
- `src/components/ui/ErrorState.tsx`
- `src/components/ui/EmptyState.tsx`
- `src/components/ui/Skeleton.tsx`
- `src/lib/constants/routes.constants.ts`
- `src/lib/constants/routes.constants.test.ts`
- `vitest.config.ts` — entorno `node`, patrón `src/**/*.test.ts` y alias `@`.
- Estructura `src/modules/` de `location`, `weather`, `astronomy`, `night` y `legal`, con `.gitkeep` en las carpetas hoja vacías.

**Archivos modificados.**

- `src/app/layout.tsx` — `Providers`, `lang="es"` y metadata base.
- `src/app/globals.css` — tokens semánticos y estilos base.
- `docs/specs/001-vesper/tasks/T004-esqueleto-base.md` — estado, criterios y este registro.
- `docs/specs/001-vesper/tasks/README.md` — T004 marcada como «Terminada».

**Decisiones y desviaciones.**

1. **`Providers` exporta solo el componente (autorizado por el dueño).** La sección «Archivos» pedía exportar «la instancia de `QueryClient` por sesión». Un export a nivel de módulo sería un singleton compartido entre peticiones del servidor y rompería el SPEC §7.3. La instancia se crea con `useState(() => new QueryClient(...))` dentro de `Providers`; los consumidores deben usar `useQueryClient` de TanStack Query. Se mantienen los valores exactos del paso 1 y no se desactiva `refetchOnWindowFocus`.
2. **Sin React Query Devtools (autorizado por el dueño).** No se instaló `@tanstack/react-query-devtools` porque T003 prohíbe añadir librerías fuera del SPEC. La estabilidad del `QueryClient` se garantiza por construcción (`useState` perezoso en el layout raíz), pero la comprobación visual de la caché con Devtools queda pendiente y no se ejecutó.
3. **Tokens provisionales por ausencia de imágenes de diseño.** `docs/specs/001-vesper/design/` solo contiene el README. Se definieron tokens semánticos neutros: `background`, `foreground`, `surface`, `surface-muted`, `muted`, `border`, `primary`, `primary-foreground`, `danger` y `danger-foreground`, con variantes clara y oscura mediante `prefers-color-scheme`. Los valores finales se ajustarán cuando lleguen las imágenes.
4. **`ErrorState` marcado con `'use client'`.** Es el único de los cuatro que recibe un manejador (`onRetry`) y renderiza un botón interactivo. `LoadingState`, `EmptyState` y `Skeleton` siguen siendo compatibles con servidor. No se añadió lógica de negocio.
5. **`lang="es"` y metadata base elegidos.** La task no especificaba el idioma ni los textos. Se usó `lang="es"` porque toda la interfaz es en español, y el título «Vesper — Clima y observación astronómica» con una descripción acorde. Los textos son provisionales y se pueden cambiar sin afectar a la arquitectura.
6. **Tamaño de los estados.** `LoadingState`, `ErrorState` y `EmptyState` usan `min-h-48` (12 rem) y `Skeleton` parte de `h-4 w-full`. Es una altura provisional para evitar saltos; sin imágenes de diseño no se puede fijar el tamaño definitivo. Las animaciones llevan `motion-reduce:animate-none`.
7. **Aviso de Vitest.** `pnpm test` pasa (1 archivo, 1 prueba), pero Vite avisa de que `vitest.config.ts` usa sintaxis ESM en un archivo cargado como CommonJS porque `package.json` no tiene `"type": "module"`. Se conservó el nombre `vitest.config.ts` que pide la task. No se añadió `"type": "module"` ni se renombró a `.mts` porque queda fuera del alcance y podría afectar a otras herramientas.
8. **`src/app/page.tsx` sin tocar.** No está en el alcance de T004. Sigue siendo la página de ejemplo de `create-next-app`; será sustituida por la redirección de T018 y la ruta de clima de T019. No contiene lógica de negocio ni llamadas a `fetch`.
9. **`.gitkeep` solo en carpetas hoja.** No se añadió a `src/modules/` ni a las carpetas de cada módulo porque ya quedan versionadas al contener subcarpetas con `.gitkeep`.

**Verificación.**

- `pnpm test` — 1 archivo y 1 prueba pasan; `ROUTES.clima.detail('bogota')` devuelve `/clima/bogota`.
- `pnpm typecheck` — sin errores.
- `pnpm lint` — 0 errores; se mantiene el warning preexistente de `prettier.config.mjs`.
- `pnpm build` — compila y prerenderiza `/` y `/_not-found`.
- `pnpm exec prettier --check` sobre los archivos tocados — todos conformes.
- `next start` en el puerto 3100 — el HTML responde con `lang="es"`, el título y la descripción esperados.
- Comprobación visual en React Query Devtools — no ejecutada por la decisión 2.

**Evaluación de librerías UI.** No se instaló ninguna. Para este proyecto, adoptar **shadcn/ui** completo no es necesario todavía: aporta primitivas accesibles de Radix y componentes copiables, pero también una estética por defecto y dependencias adicionales (`radix-ui`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`) que chocan con el alcance cerrado de T003 y con un diseño propio. Si más adelante hacen falta un combobox de búsqueda, un selector de noches o un diálogo, conviene valorar **solo las primitivas de Radix necesarias** (`@radix-ui/react-select`, `@radix-ui/react-dialog`, `@radix-ui/react-popover`, `@radix-ui/react-tooltip`) en una task propia, o usar `<select>`/`<dialog>` nativos si bastan. Otras recomendaciones: `clsx` + `tailwind-merge` para componer `className` cuando los componentes crezcan; `lucide-react` solo si se prefieren iconos de clima/astronomía a SVG propios; `@tanstack/react-query-devtools` como dependencia de desarrollo para verificar caché en T010/T011. No se recomiendan Zod/Yup, axios, date-fns ni Framer Motion: el SPEC y T003 ya fijan alternativas nativas, y CSS/`Intl` cubren lo necesario.
