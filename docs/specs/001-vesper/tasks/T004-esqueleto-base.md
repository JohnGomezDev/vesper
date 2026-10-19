# T004 — Esqueleto base: Provider, layout, base visual y rutas

- **Fase:** F1
- **SPEC:** §3, §11
- **Depende de:** T003
- **Desbloquea:** T005, T008, T025, T026
- **Diseño:** usar las imágenes de `docs/specs/001-vesper/design/` cuando estén disponibles.
- **Estado:** Pendiente

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

- [ ] `QueryClient` no se recrea al navegar entre rutas.
- [ ] `app/` no contiene lógica de negocio ni llamadas a `fetch`.
- [ ] Ningún componente escribe rutas a mano: todas salen de `ROUTES`.
- [ ] Los componentes de estado tienen el tamaño final para evitar saltos.
- [ ] Las animaciones respetan `prefers-reduced-motion`.
- [ ] `pnpm test` ejecuta la prueba de ejemplo.

## Verificación

- `pnpm test` y `pnpm build` pasan.
- Navegar entre `/` y una ruta de prueba y comprobar en React Query Devtools que la caché persiste.

## Notas y bloqueos

- Si aún no hay imágenes de diseño, usar tokens neutros y dejar los valores finales para cuando lleguen, sin bloquear la task.
