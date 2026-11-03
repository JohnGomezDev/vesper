# T026 — Atribución, not-found y error

- **Fase:** F8
- **SPEC:** §2.1, §5.3, §8.7
- **Depende de:** T004
- **Desbloquea:** T027
- **Estado:** Terminada (2026-11-03)

## Objetivo

Cumplir la atribución obligatoria a Open-Meteo y cerrar las páginas de error.

## Resultado esperado

La atribución es visible con enlace y mención de CC-BY 4.0; `not-found` y `error` ofrecen salida y reintento.

## Alcance

**Incluye**

- Componente `Attribution` con enlace a Open-Meteo y mención de CC-BY 4.0.
- Colocación de la atribución en el pie visible de la app.
- `not-found.tsx` con acceso a la selección de lugar.
- `error.tsx` con reintento y mensaje claro en español.

**No incluye**

- Textos legales (T025).
- Analítica ni terceros.

## Archivos

### Crear

- `src/components/Attribution.tsx` — props `IAttributionProps { className?: string }`.
- `src/app/not-found.tsx`
- `src/app/error.tsx` — `'use client'`, props `{ error: Error & { digest?: string }; reset: () => void }`.

### Modificar

- `src/app/layout.tsx` — montar `Attribution` en el pie.

## Pasos detallados

1. Implementar `Attribution`:
   ```tsx
   <p>
     Datos de clima de{' '}
     <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer">
       Open-Meteo
     </a>{' '}
     (CC-BY 4.0).
   </p>
   ```
2. Montar la atribución en el layout, visible en todas las páginas.
3. Implementar `not-found` con título, mensaje y enlace a `/` (que redirige al lugar).
4. Implementar `error` con `useEffect` para registrar el error en desarrollo y un botón «Reintentar» que llama a `reset`.
5. Ajustar ambos al diseño de referencia.
6. Ejecutar `pnpm build`.

## Criterios de aceptación

- [x] La atribución es visible y enlaza a Open-Meteo.
- [x] Se menciona CC-BY 4.0.
- [x] Un slug inválido muestra `not-found` con salida.
- [x] Un error de render muestra `error` con reintento funcional.

## Verificación

- `pnpm build` pasa.
- Visitar `/clima/slug-invalido@` y forzar un error de render.

## Notas y bloqueos

- La atribución no puede quedar oculta en un pie que solo aparece al final de una página muy larga sin ser alcanzable.

## Registro de ejecución y desviaciones (2026-11-03)

**Resultado.** Task ejecutada. La atribución a Open-Meteo es visible en el pie de todas las páginas, con enlace y mención de CC-BY 4.0; `not-found` ofrece salida y `error` ofrece reintento.

### Archivos creados

- `src/components/Attribution.tsx` — `IAttributionProps { className?: string }`.
- `src/app/not-found.tsx` — título, mensaje y enlace a `/`.
- `src/app/error.tsx` — `'use client'`, registro del error en desarrollo y botón «Reintentar».

### Archivos modificados

- `src/app/layout.tsx` — pie visible con `Attribution` y enlaces legales (compartido con T025).

### Desviaciones

1. **`reset` → `retry` (autorizado por el dueño).** Next.js 16.4.1 estabilizó la prop `retry` y la documentación recomienda usarla en lugar de `reset`, que solo limpia el estado del boundary sin volver a pedir datos. La firma es `{ error: Error & { digest?: string }; retry: () => void }`; el botón «Reintentar» llama a `retry()`.
2. **Pie en el layout raíz.** No existía un componente de pie; para no crear un archivo fuera del alcance se montó el `<footer>` directamente en `src/app/layout.tsx`, con `Attribution` y los enlaces legales. Si el pie crece, se puede extraer a `src/components/` en otra task.
3. **Enlace de salida en `error`.** Además de «Reintentar» se añadió «Volver al inicio» para cumplir «ofrecen salida y reintento» del resultado esperado. No es contenido nuevo del SPEC.
4. **Verificación con sonda temporal.** Para forzar un error de render se creó una ruta temporal `src/app/error-probe/page.tsx`, se comprobó el boundary en Chrome headless y se eliminó después. El build final no contiene esa ruta.

### Verificación

- `pnpm typecheck`, `pnpm lint` (solo el warning preexistente de `prettier.config.mjs`), `pnpm test` (26 archivos, 376 pruebas) y `pnpm build`: correctos.
- `/clima/slug-invalido@`: 404 y `not-found` con «Este lugar no existe» y enlace «Volver al inicio».
- Error de render forzado: la página muestra «Algo salió mal», el mensaje en español y el botón «Reintentar»; el boundary recibe `retry` de Next.js.
- Atribución visible en `/terminos`, `/privacidad`, `/clima/...` y `not-found`: «Datos de clima de Open-Meteo (CC-BY 4.0)» con enlace a `https://open-meteo.com`.
- Enlaces del pie a `/terminos` y `/privacidad`: presentes y operativos.
- `pnpm exec prettier --check` sobre los archivos tocados: conforme.
