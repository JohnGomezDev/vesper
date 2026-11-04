# T029 — Despliegue en Vercel

- **Fase:** F9
- **SPEC:** §3, §6.1
- **Depende de:** T027, T028
- **Desbloquea:** —
- **Estado:** Pendiente de despliegue manual del dueño (preparación completada 2026-11-04)

## Objetivo

Publicar la app y verificar en producción lo que no se puede probar en local.

## Resultado esperado

La app está desplegada en Vercel, `/` redirige con 307 usando las cabeceras reales, el GPS funciona por HTTPS y la regeneración respeta 3600 s. README y estado actualizados.

## Alcance

**Incluye**

- Despliegue en Vercel sin exportación estática pura.
- Verificación de la redirección 307 y de las cabeceras de IP reales.
- Verificación de HTTPS para el GPS.
- Verificación de la regeneración y de la atribución visible.
- Actualización de `README.md` y `acceptance.md` con la URL y el estado.

**No incluye**

- Dominio propio.
- Analítica o planes de pago.

## Archivos

### Modificar

- `README.md` — enlace al despliegue y estado.
- `docs/specs/001-vesper/acceptance.md` — resultados de producción.
- `docs/specs/001-vesper/tasks/README.md` — marcar las tasks completadas.

### Crear

- Configuración de Vercel si el proyecto la requiere (por ejemplo `vercel.json`), solo si es imprescindible.

## Pasos detallados

1. Conectar el repositorio con Vercel y desplegar.
2. Definir `NEXT_PUBLIC_SITE_URL` con la URL de producción.
3. Abrir `/` y comprobar la redirección 307 y el slug de coordenadas.
4. Abrir `/clima/bogota` y un slug no curado; comprobar la atribución.
5. Probar el botón de GPS por HTTPS.
6. Comprobar la regeneración tras 3600 s midiendo los registros.
7. Registrar todo en `acceptance.md`.
8. Actualizar el README y el índice de tasks.

## Criterios de aceptación

- [ ] `/` responde 307 y usa las cabeceras de IP reales.
- [ ] Sin cabeceras, redirige a Bogotá.
- [ ] El GPS funciona por HTTPS.
- [ ] La regeneración respeta 3600 s.
- [ ] La atribución es visible en producción.
- [ ] README y `acceptance.md` reflejan la URL y el estado.

## Verificación

- `curl -I https://<deploy>/` muestra 307.
- Revisión manual de la pestaña de red en producción.

## Notas y bloqueos

- Si el plan gratuito de Vercel no registra las cabeceras esperadas, se documenta y se consulta al dueño.

## Registro de ejecución y bloqueo (2026-11-04)

**Resultado.** Preparación completada; **despliegue no ejecutado**. No hay Vercel CLI, sesión ni token en el entorno. El dueño hará el despliegue manual desde el dashboard de Vercel y aportará la URL para cerrar la verificación de producción.

### Preparado

- `README.md` actualizado con el estado real y una sección de despliegue manual.
- `docs/specs/001-vesper/acceptance.md` creado y actualizado con el estado de producción pendiente (D5).
- `docs/specs/001-vesper/tasks/README.md` actualizado.
- No se creó `vercel.json`: el proyecto es un Next.js estándar y no usa `output: 'export'`; Vercel detecta la configuración con su preset de Next.js. No se añadió configuración innecesaria.

### Pendiente (requiere el dueño)

1. Conectar el repositorio en Vercel y desplegar (sin exportación estática pura).
2. Definir `NEXT_PUBLIC_SITE_URL` con la URL de producción.
3. Abrir `/` y comprobar `307` y el slug de coordenadas con las cabeceras reales.
4. Abrir `/clima/bogota` y un slug no curado; comprobar la atribución.
5. Probar el botón de GPS por HTTPS.
6. Comprobar la regeneración de 3600 s en los registros.
7. Aportar la URL para actualizar `README.md` y `acceptance.md` y marcar esta task como terminada.

Los criterios de aceptación de la cabecera siguen sin marcar hasta que exista la verificación de producción.
