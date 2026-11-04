# T029 — Despliegue en Vercel

- **Fase:** F9
- **SPEC:** §3, §6.1
- **Depende de:** T027, T028
- **Desbloquea:** —
- **Estado:** Terminada (2026-11-04; con salvedad en la medición temporal de la regeneración)

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

- [x] `/` responde 307 y usa las cabeceras de IP reales.
- [x] Sin cabeceras, redirige a Bogotá (verificado en local; el edge de producción siempre añade las cabeceras).
- [x] El GPS funciona por HTTPS.
- [x] La regeneración respeta 3600 s (por configuración y cabeceras; no se esperó una hora).
- [x] La atribución es visible en producción.
- [x] README y `acceptance.md` reflejan la URL y el estado.

## Verificación

- `curl -I https://<deploy>/` muestra 307.
- Revisión manual de la pestaña de red en producción.

## Notas y bloqueos

- Si el plan gratuito de Vercel no registra las cabeceras esperadas, se documenta y se consulta al dueño.

## Registro de ejecución y desviación (2026-11-04)

**Resultado.** Task ejecutada. La app está desplegada en **https://vesper-sandy-seven.vercel.app/** y se verificó producción con `curl` y Chrome headless.

### Verificación en producción

- `/` responde `307` con `location: /clima/4.61_-74.08`; el edge usa las cabeceras de IP reales. Vercel sobrescribe las cabeceras `x-vercel-ip-*` que envíe el cliente, así que la ausencia de cabeceras solo se pudo probar en local.
- `/clima/bogota` responde `200` con `x-vercel-cache: PRERENDER`, `x-nextjs-prerender: 1`, `x-nextjs-stale-time: 300` y pronóstico incrustado. El navegador hace 1 petición (bloque «ahora»).
- Un slug no curado responde `200`, sirve la shell genérica y lleva `noindex, nofollow`; el navegador hace 2 peticiones (pronóstico + «ahora»).
- Un slug inválido responde `404`.
- La atribución a Open-Meteo con CC-BY 4.0 es visible.
- El GPS funciona por HTTPS: `isSecureContext` es `true` y el clic con geolocalización simulada navega a `/clima/6.24_-75.58`.
- No hay errores de hidratación en consola.
- `canonical`, `sitemap.xml` y `robots.txt` usan la URL de producción, lo que confirma `NEXT_PUBLIC_SITE_URL`.

### Preparado

- `README.md` actualizado con la URL y el estado.
- `docs/specs/001-vesper/acceptance.md` actualizado con la sección de producción.
- `docs/specs/001-vesper/tasks/README.md` actualizado.
- No se creó `vercel.json`: el proyecto es un Next.js estándar y no usa `output: 'export'`; Vercel detectó la configuración con su preset.

### Salvedad

- **Regeneración de 3600 s:** el código declara `cacheLife('hours')` y el edge devuelve `x-nextjs-stale-time: 300`, pero no se esperó una hora para observar la regeneración. Queda verificado por configuración y cabeceras, no por medición temporal.
- **Logs del servidor:** no son accesibles desde este entorno. La comprobación de que el servidor no llama a Open-Meteo en slugs no curados se hizo en local en T027; en producción la respuesta usa la shell genérica.
