# T026 — Atribución, not-found y error

- **Fase:** F8
- **SPEC:** §2.1, §5.3, §8.7
- **Depende de:** T004
- **Desbloquea:** T027
- **Estado:** Pendiente

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

- [ ] La atribución es visible y enlaza a Open-Meteo.
- [ ] Se menciona CC-BY 4.0.
- [ ] Un slug inválido muestra `not-found` con salida.
- [ ] Un error de render muestra `error` con reintento funcional.

## Verificación

- `pnpm build` pasa.
- Visitar `/clima/slug-invalido@` y forzar un error de render.

## Notas y bloqueos

- La atribución no puede quedar oculta en un pie que solo aparece al final de una página muy larga sin ser alcanzable.
