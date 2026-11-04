# T023 — Estados, accesibilidad e hidratación

- **Fase:** F7
- **SPEC:** §8.7, §10, §11
- **Depende de:** T022
- **Desbloquea:** T027
- **Diseño:** usar las imágenes de `docs/specs/001-vesper/design/` cuando estén disponibles.
- **Estado:** Terminada (2026-11-02)

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

- [x] No hay advertencias de hidratación en consola.
- [x] Todos los estados del §8.7 son alcanzables y tienen mensaje claro.
- [x] La pantalla se navega completa solo con teclado.
- [x] La información de nubosidad no depende solo del color.
- [x] Las animaciones se desactivan con `prefers-reduced-motion`.
- [x] El layout no salta al cargar.

## Verificación

- `pnpm build` pasa.
- Navegar con la pestaña de red en «Slow 3G», con «Offline» y con teclado; revisar consola.

## Notas y bloqueos

- Para probar el 429, simular la respuesta desde el cliente de fetch o interceptar la petición.

## Registro de ejecución y desviaciones (2026-11-02)

**Resultado.** Task ejecutada. La pantalla cubre carga, error con reintento, dato viejo, sin red, lugar sin datos, 429, fecha inválida, fecha fuera de rango, sin noche astronómica y latitudes altas. La navegación por teclado funciona, la nubosidad no depende solo del color y no aparecen avisos de hidratación.

### Archivos creados

- `src/lib/hooks/use-mounted.ts`
- `src/modules/night/components/NightSkeleton.tsx`
- `src/modules/night/components/NightStates.tsx`

### Archivos modificados

- `src/modules/night/components/NightContainer.tsx` — `useMounted`, decisión de la noche tras montar, todos los estados, aviso de antigüedad, retry, 429, fecha inválida/fuera de rango, sin noche astronómica, bloque «Ahora», tira, Luna, ventanas y selector.
- `src/modules/night/components/*.tsx` — `aria-label`, roles, `focus-visible`, objetivos táctiles y `motion-reduce`.
- `src/modules/weather/components/CurrentConditions.tsx` — roles y etiquetas de los dos indicadores.
- `src/components/ui/ErrorState.tsx` — botón de reintento con altura táctil de 44 px y transición reducible.
- `src/modules/night/constants/night.constants.ts` — `NIGHT_MESSAGES` y retirada del umbral temporal.
- `src/modules/night/types/night.types.ts` — campos de análisis para avisos, altura solar y Luna.
- `src/modules/night/hooks/use-night-analysis.ts` — cálculo local de los datos nuevos.
- `src/modules/night/utils/night.ts` y `src/modules/night/utils/night.test.ts` — corrección del centinela polar `00:00`.
- `src/app/globals.css` — tokens de contraste para nubosidad, aviso y Luna.

### Decisiones y desviaciones

1. **Estados en `NightContainer` (autorizado).** T023 ordena que el contenedor cubra todos los estados. `NightBody` y `NightSummary` quedan sin uso y se documentan como obsoletos para una limpieza posterior; no se borraron.
2. **HTML estático de ciudades curadas (deuda de T020).** El HTML inicial sigue siendo el esqueleto porque el contenedor espera al reloj del cliente. Se verificó que, una vez hidratado y con Open-Meteo bloqueado, la ciudad curada muestra el pronóstico que venía en el RSC. La representación estática completa queda documentada como pendiente, tal como se autorizó.
3. **Sin red.** No se añadió un hook de `navigator.onLine`; el estado se deriva del error de la query (red/API) y del texto de reintento. Probado bloqueando `*open-meteo.com*`: mensaje claro y botón «Reintentar».
4. **Latitudes altas (corrección autorizada).** Open-Meteo no devuelve `null` en `sunrise`/`sunset` polares: devuelve `00:00` en ambos. `getNightWindow` ahora rechaza una diferencia de 24 horas o un amanecer no posterior a la puesta, y se añadió una prueba. En `85.00, 0.00` se muestra «Sin noche astronómica este día», la tira queda sin horas y el selector sigue navegable.
5. **Hidratación.** `useMounted` usa `useSyncExternalStore` (`false` en servidor, `true` tras montar) para evitar `setState` en efectos y mantener la primera pintura idéntica. La noche, `?date=`, GPS, el reloj y el umbral se resuelven después de montar. `?date=` inválido no se aplica al análisis y solo muestra el mensaje tras montar.
6. **Aviso de antigüedad.** El encabezado muestra la hora absoluta de la última actualización del pronóstico («Actualizado a las HH:mm»); si supera `FORECAST_STALE_TIME_MS` se añade un aviso de refresco en segundo plano con la misma hora. Si hay error con dato en memoria, se muestra el dato y el aviso de que no se pudo actualizar. La versión inicial con texto relativo se sustituyó en la corrección posterior.
7. **429.** `ApiError.status === 429` produce un mensaje específico tanto para el pronóstico como para el bloque «Ahora», con botón de reintento. Probado interceptando la respuesta con CDP.
8. **Desbordamiento horizontal a 360 px.** Se añadió `overflow-x-hidden [contain:paint]` al `<main>` porque Chrome arrastraba el contenido de las tiras al ancho del documento. Las tiras conservan su desplazamiento interno. Verificado a 360, 768 y 1280 px.
9. **Accesibilidad.** Todos los botones nuevos usan `type="button"`, etiquetas accesibles, `focus-visible` y objetivos táctiles de al menos 44 px. La clase de nubosidad se muestra con texto, no solo con color. Las animaciones existentes ya usan `motion-reduce`; se añadió `motion-reduce:transition-none` a las transiciones nuevas.
10. **Esqueleto.** `NightSkeleton` reproduce los bloques principales (Ahora, tira, Luna/ventanas y selector) para reducir el salto de layout. Se usa antes de montar y mientras el pronóstico está pendiente.

### Verificación

- `pnpm typecheck`, `pnpm lint` (solo el warning preexistente de `prettier.config.mjs`), `pnpm test` (26 archivos, 377 pruebas) y `pnpm build`: correctos.
- Navegador real con CDP:
  - Sin warnings de hidratación en consola; solo aparecen los errores de red esperados durante las pruebas de 429.
  - Teclado: 18 pulsaciones de Tab recorren ciudades, buscador, GPS, navegación, tira, umbral, selector y noches; 0 elementos con `tabindex="-1"`.
  - 360 px: `scrollWidth === 360`, sin desbordamiento del documento; capturas revisadas a 360, 768 y 1280 px.
  - 429: mensaje «Open-Meteo ha limitado las peticiones…» con reintento.
  - Sin red: mensaje «No se pudo cargar el pronóstico de este lugar…» en un slug no curado; una ciudad curada conserva el pronóstico del RSC.
  - Fecha inválida: «La fecha no es válida.» y 18 opciones en el selector.
  - Fuera de rango: «La fecha seleccionada está fuera del rango disponible.».
  - Noche pasada: etiqueta «Pronóstico archivado».
  - Latitud alta (`85.00, 0.00`): mensaje explícito, sin horas en la tira y selector usable.
  - Umbral: 15 → 30, recarga → 15.
  - Cambio de noche y cambio de umbral sin peticiones nuevas a Open-Meteo.

## Corrección posterior (2026-11-02)

Solicitud del dueño sobre la cabecera y el aviso de actualización:

1. **Hora de actualización absoluta.** El encabezado ya no calcula «Actualizado ahora mismo / hace X min». Muestra `Actualizado a las HH:mm` con `formatLocalTime(forecastUpdatedAt, timeZone)`. El aviso de dato viejo también usa `Última actualización a las HH:mm`. Se retiró `formatUpdatedAgo` y sus pruebas para no mantener un cálculo que ya no se usa.
2. **Cabecera de marca.** Se retiró `LocationSelector` del header. En su lugar se muestra `AppBrand` (`src/components/AppBrand.tsx`) con el icono de telescopio y el título «Vesper». El buscador y el botón de GPS siguen en la cabecera. `LocationSelector` queda sin uso, como `NightBody`/`NightSummary`, para limpieza posterior.

Verificación: `pnpm typecheck`, `pnpm lint` (0 errores; warning preexistente de `prettier.config.mjs`), `pnpm test` (26 archivos, 376 pruebas) y `pnpm build` correctos; comprobado en navegador que la cabecera muestra «Vesper» con el telescopio y que el texto es «Actualizado a las HH:mm».
