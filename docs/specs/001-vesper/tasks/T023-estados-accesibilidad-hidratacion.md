# T023 — Estados, accesibilidad e hidratación

- **Fase:** F7
- **SPEC:** §8.7, §10, §11
- **Depende de:** T022
- **Desbloquea:** T027
- **Diseño:** usar las imágenes de `docs/specs/001-vesper/design/` cuando estén disponibles.
- **Estado:** Pendiente

## Objetivo

Cerrar la experiencia con todos los estados, la accesibilidad y la ausencia de errores de hidratación.

## Resultado esperado

Cada estado del SPEC §8.7 tiene su vista, la pantalla es navegable por teclado y no hay avisos de hidratación en consola.

## Alcance

**Incluye**

- Carga con esqueletos del tamaño final.
- Error de red o API con reintento; dato viejo en memoria con aviso de antigüedad.
- Pestaña nueva sin red; ciudad curada puede mostrar el HTML.
- Lugar sin datos con acceso al buscador.
- Límite 429 con mensaje específico.
- Fecha ausente, inválida o fuera de rango; latitudes altas.
- Hidratación: «ahora», hora actual, noche actual, `?date=`, GPS y umbral tras montar.
- Accesibilidad: teclado, etiquetas, contraste, información no solo por color y `prefers-reduced-motion`.
- Responsive según las imágenes.

**No incluye**

- Cambiar el diseño aprobado.
- Añadir estados que el SPEC no pida.

## Archivos

### Crear

- `src/lib/hooks/use-mounted.ts` — `useMounted(): boolean`.
- `src/modules/night/components/NightSkeleton.tsx` — esqueleto del tamaño final.
- `src/modules/night/components/NightStates.tsx` — mensajes de vacío, sin red y fuera de rango.

### Modificar

- `src/modules/night/components/NightContainer.tsx` — usar `useMounted`, decidir la noche solo tras montar y cubrir todos los estados.
- `src/modules/night/components/*.tsx` y `src/modules/weather/components/CurrentConditions.tsx` — `aria-label`, roles y `focus-visible`.
- `src/components/ui/*.tsx` — contraste y tamaño de objetivos táctiles.

## Pasos detallados

1. Crear `use-mounted` y usarlo para todo lo dependiente del reloj del dispositivo.
2. Implementar `NightSkeleton` con las mismas dimensiones que el contenido para no saltar.
3. Implementar en `NightContainer` el orden de decisión:
   `isLoading → NightSkeleton`; `isError → ErrorState` con reintento; `error.status === 429 → mensaje de límite`; sin datos → `EmptyState` con enlace al buscador; fecha inválida o fuera de rango → `NightStates` con mensaje y selector usable; sin noche astronómica → mensaje explícito.
4. Mostrar aviso de antigüedad si `dataUpdatedAt` supera el `staleTime`.
5. Revisar cada componente interactivo: botones con `type="button"`, `aria-label`, foco visible y navegación por teclado.
6. Asegurar que ninguna clase de nubosidad se transmita solo por color; añadir texto o patrón.
7. Envolver animaciones en `@media (prefers-reduced-motion: reduce)`.
8. Probar en 360 px, 768 px y 1280 px.
9. Ejecutar `pnpm build`, `pnpm lint` y revisar la consola.

## Criterios de aceptación

- [ ] No hay advertencias de hidratación en consola.
- [ ] Todos los estados del §8.7 son alcanzables y tienen mensaje claro.
- [ ] La pantalla se navega completa solo con teclado.
- [ ] La información de nubosidad no depende solo del color.
- [ ] Las animaciones se desactivan con `prefers-reduced-motion`.
- [ ] El layout no salta al cargar.

## Verificación

- `pnpm build` pasa.
- Navegar con la pestaña de red en «Slow 3G», con «Offline» y con teclado; revisar consola.

## Notas y bloqueos

- Para probar el 429, simular la respuesta desde el cliente de fetch o interceptar la petición.
