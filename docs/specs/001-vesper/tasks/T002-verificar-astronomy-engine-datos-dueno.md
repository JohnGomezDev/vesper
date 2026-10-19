# T002 — Verificar astronomy-engine y recopilar datos del dueño

- **Fase:** F0
- **SPEC:** §5.4, §9, §11
- **Depende de:** —
- **Desbloquea:** T012, T013, T019, T025
- **Estado:** Completada (2026-10-19)

## Objetivo

Confirmar las funciones reales de astronomy-engine y conseguir los datos que solo puede entregar el dueño.

## Resultado esperado

Sección nueva en `docs/specs/001-vesper/verification-notes.md` con la firma exacta de cada función confirmada, y una lista cerrada de los datos que faltan del dueño. Sin valores inventados.

## Alcance

**Incluye**

- Firma exacta de: fase lunar, fracción iluminada, altitud y azimut, salida y puesta, cruce de altitud del Sol, elongación, magnitud aparente, separación angular y culminación.
- Confirmar que la refracción se aplica en altitud y en salida/puesta.
- Confirmar si existe función de culminación; si no, registrar el plan B (máximo de la serie, marcado aproximado).
- Solicitar al dueño: coordenadas, altitud y zona horaria de Desierto de la Tatacoa, Desierto de Checua y Lago de Tota; textos «por qué observar aquí»; textos legales.

**No incluye**

- Implementar los servicios de astronomía (eso es T012–T014).
- Rellenar datos con homónimos o aproximaciones.

## Archivos

### Crear

- `docs/specs/001-vesper/verification-notes.md` — ampliar con la sección de astronomy-engine (si T001 ya lo creó, solo añadir).

### Modificar

- `docs/specs/001-vesper/SPEC.md` — §5.4 y §13: sustituir `[POR VERIFICAR]` por la firma confirmada.

## Pasos detallados

1. Consultar la documentación oficial de astronomy-engine (Context7 o repositorio del paquete).
2. Anotar la firma exacta de cada capacidad del SPEC §5.4 con su nombre real.
3. Confirmar con la documentación cómo se activa la refracción y si está activa por defecto.
4. Confirmar si existe `SearchRiseSet`, tránsito o equivalente; anotar la alternativa si no.
5. Redactar la petición de datos al dueño con la lista exacta de campos por ciudad: `slug`, `name`, `latitude`, `longitude`, `elevationM`, `timeZone`, `description`.
6. Registrar en el archivo de verificación que los datos están pendientes, sin rellenarlos.
7. Actualizar el SPEC §5.4 y §13.

## Criterios de aceptación

- [x] Cada capacidad del §5.4 tiene función confirmada o sustituto documentado.
- [x] Está claro si la culminación es nativa o muestreada. → Nativa: `SearchHourAngle(body, observer, 0, dateStart)`.
- [x] La refracción queda documentada como activa. → Activa pasando `"normal"` (no por defecto); `SearchRiseSet` siempre, `SearchAltitude` la omite por convención.
- [x] Los datos de Tatacoa, Checua y Lago de Tota figuran como pendientes del dueño, sin valores inventados.

## Verificación

- `verification-notes.md` incluye los nombres de función copiados de la documentación.
- No aparece ninguna coordenada de esas tres ciudades que no venga del dueño.

## Notas y bloqueos

- T019 y T025 quedan bloqueadas en su parte de contenido hasta que el dueño entregue los datos.

---

## Registro de ejecución (2026-10-19)

### Resultado

Completada. Se confirmaron las firmas reales de astronomy-engine contra el `.d.ts` publicado del paquete `astronomy-engine@2.1.19` (npm `latest`) y el README oficial, y se dejó cerrada la petición de datos al dueño sin rellenar nada.

- Fase lunar: `MoonPhase(date)`.
- Fracción iluminada: `Illumination(body, date).phase_fraction`.
- Altitud y azimut: `Equator(...)` + `Horizon(date, observer, ra, dec, refraction)`; observador `Observer(latitude, longitude, height)`.
- Salida y puesta: `SearchRiseSet(body, observer, direction, dateStart, limitDays, metersAboveGround?)`; `direction` numérico (`+1`/`-1`).
- Crepúsculos: `SearchAltitude(...)`.
- Elongación: `Elongation(body, date)`.
- Magnitud: `Illumination(body, date).mag`.
- Separación angular: sin función directa; sustituto `AngleBetween(a, b)` con vectores de `Equator` (y `AngleFromSun` para Sol–cuerpo).
- Culminación: nativa con `SearchHourAngle(body, observer, 0, dateStart)`.
- Refracción: activa al pasar `"normal"`; `SearchRiseSet` siempre; `SearchAltitude` la omite por convención.

### Archivos tocados

- `docs/specs/001-vesper/verification-notes.md` — nuevas secciones 12 a 16 (T002) y encabezado con índice. No se tocó ninguna sección de T001.
- `docs/specs/001-vesper/SPEC.md` — §5.4 (tabla de funciones confirmadas y refracción) y §13 (bloque «Verificado en T002» y pendientes reformulados).
- `docs/specs/001-vesper/tasks/T002-verificar-astronomy-engine-datos-dueno.md` — estado, criterios y este registro.

### Desviaciones

1. **Refracción descrita como «siempre activa» en el SPEC §5.4.** La librería no la aplica por defecto: hay que pasar `"normal"` a `Horizon`, y `SearchAltitude` la omite a propósito. Se corrigió la redacción del SPEC según lo indicado por el dueño («usa lo más conveniente»): la app pasa `"normal"` siempre y los crepúsculos son la excepción intencionada. No se reabrió ninguna decisión `[CERRADO]`.
2. **Separación angular sin función propia.** El SPEC §5.4 pedía «separación angular entre dos cuerpos». No existe tal función en la 2.1.19; se documentó `AngleBetween` sobre vectores de `Equator` como sustituto confirmado.
3. **Verificación contra el paquete publicado, no contra `node_modules`.** astronomy-engine no está instalado (añadirlo es T003). La firma se tomó del `.d.ts` de la versión publicada 2.1.19, que es la misma que verá TypeScript al instalar.
4. **`direction` es numérico en JavaScript.** La documentación de otros lenguajes usa un enum (`Direction.Rise`/`Direction.Set`); en JS son `+1`/`-1`. Queda anotado para no inventar un enum.
5. **`Elongation.visibility` llega en inglés** (`"morning"`/`"evening"`); la traducción a «de la mañana»/«de la tarde» la hace la app (SPEC §8.5).
6. **Datos del dueño pendientes.** Tatacoa, Checua y Lago de Tota siguen sin datos; no se inventó ninguna coordenada, altitud ni zona horaria. La petición con los campos exactos (`slug`, `name`, `latitude`, `longitude`, `elevationM`, `timeZone`, `description`) quedó en `verification-notes.md` §15.
