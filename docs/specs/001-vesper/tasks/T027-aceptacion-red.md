# T027 — Aceptación §12 y comprobaciones de red

- **Fase:** F9
- **SPEC:** §7.1, §12
- **Depende de:** T023, T024, T025, T026
- **Desbloquea:** T028, T029
- **Estado:** Pendiente

## Objetivo

Demostrar que la app cumple los criterios de aceptación y el reparto servidor/cliente.

## Resultado esperado

`docs/specs/001-vesper/acceptance.md` con los 16 criterios del SPEC §12 marcados con su evidencia, y los comandos de calidad en verde.

## Alcance

**Incluye**

- Ejecutar y registrar cada criterio del §12.
- Comprobar el reparto de red del §7.1.
- Comprobar que el número de peticiones del build coincide con las ciudades curadas.
- Ejecutar `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build`.
- Corregir los fallos detectados.

**No incluye**

- El contraste astronómico externo (T028).
- El despliegue (T029).

## Archivos

### Crear

- `docs/specs/001-vesper/acceptance.md` — tabla criterio → resultado → evidencia.

### Modificar

- Los archivos que hagan falta para corregir fallos, sin cambiar el alcance.

## Pasos detallados

1. Crear `acceptance.md` con las filas 1–16 del SPEC §12.
2. Criterio 1: abrir `/clima/bogota` y ver blocos «ahora», noche actual, tira y selector.
3. Criterio 2: probar a las 03:00 locales y a las 15:00 locales con reloj simulado.
4. Criterio 3: cambiar de noche y comprobar que no hay peticiones nuevas.
5. Criterio 4: probar sin `?date=`, con fecha mal formada y fuera de −3…+14.
6. Criterio 5: verificar el refresco de «ahora» sin invalidar el pronóstico.
7. Criterio 6: contrastar Luna con fuente externa (se completa en T028, dejar constancia).
8. Criterio 7: consultar un lugar de otra zona horaria.
9. Criterio 8: revisar la consola en busca de hidratación.
10. Criterio 9: abrir una noche D anterior a hoy y ver «pronóstico archivado».
11. Criterio 10: comprobar la atribución visible.
12. Criterio 11: `curl -I /` con y sin cabeceras de IP.
13. Criterio 12: en un slug no curado, revisar red del navegador y registros del servidor.
14. Criterio 13: comprobar que el Sol no aparece como ventana.
15. Criterio 14: cambiar el umbral y comprobar que no hay petición.
16. Criterio 15: `/clima/slug.invalido` responde 404.
17. Criterio 16: abrir una pestaña nueva sin red y comprobar que no se pretende mostrar caché inexistente.
18. Ejecutar los cuatro comandos de calidad y anotar el resultado.

## Criterios de aceptación

- [ ] Los 16 criterios están registrados con resultado.
- [ ] Cualquier criterio que falle queda corregido o escalado al dueño con motivo.
- [ ] No hay peticiones de servidor fuera de ciudades curadas.
- [ ] Las peticiones del navegador no llevan `revalidate`.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build` pasan.

## Verificación

- `acceptance.md` completo.
- `pnpm build` y revisión de la salida con el número de rutas prerenderizadas.

## Notas y bloqueos

- Si un criterio depende de datos del dueño (textos, ciudades), se marca como bloqueado, no como fallo.
