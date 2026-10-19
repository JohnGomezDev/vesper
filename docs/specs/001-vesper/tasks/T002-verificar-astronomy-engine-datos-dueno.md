# T002 — Verificar astronomy-engine y recopilar datos del dueño

- **Fase:** F0
- **SPEC:** §5.4, §9, §11
- **Depende de:** —
- **Desbloquea:** T012, T013, T019, T025
- **Estado:** Pendiente

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

- [ ] Cada capacidad del §5.4 tiene función confirmada o sustituto documentado.
- [ ] Está claro si la culminación es nativa o muestreada.
- [ ] La refracción queda documentada como activa.
- [ ] Los datos de Tatacoa, Checua y Lago de Tota figuran como pendientes del dueño, sin valores inventados.

## Verificación

- `verification-notes.md` incluye los nombres de función copiados de la documentación.
- No aparece ninguna coordenada de esas tres ciudades que no venga del dueño.

## Notas y bloqueos

- T019 y T025 quedan bloqueadas en su parte de contenido hasta que el dueño entregue los datos.
