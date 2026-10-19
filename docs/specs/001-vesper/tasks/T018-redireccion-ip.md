# T018 — Redirección de `/` por cabeceras de IP

- **Fase:** F6
- **SPEC:** §6.1, §7.1
- **Depende de:** T005, T007
- **Desbloquea:** —
- **Estado:** Pendiente

## Objetivo

Redirigir la raíz al slug de coordenadas aproximadas del visitante, sin llamar a Open-Meteo.

## Resultado esperado

`/` responde 307 a `/clima/<lat>_<lon>` con las coordenadas redondeadas de la IP, o a `/clima/bogota` si no hay cabeceras. La ruta es dinámica y no es estática.

## Alcance

**Incluye**

- Lectura de las cabeceras de IP de Vercel confirmadas en T001.
- Redondeo a 2 decimales y construcción del slug de solo coordenadas.
- Respaldo a Bogotá sin cabeceras o con datos inválidos.
- Redirección 307, nunca permanente.
- Cero llamadas a Open-Meteo.

**No incluye**

- Buscar la ciudad curada más cercana (prohibido por el SPEC).
- Nombrar la ubicación con una ciudad.
- Abrir la geocodificación.

## Archivos

### Crear

- `src/modules/location/utils/ip-location.ts`
  - `readApproximateLocation(headerList: Headers): ICoordinates | null`
  - `APPROXIMATE_LOCATION_ID = 'ubicacion-aproximada'`
- `src/modules/location/utils/ip-location.test.ts`

### Modificar

- `src/app/page.tsx` — componente servidor asíncrono que lee `headers()` y llama a `redirect()`.

## Pasos detallados

1. Confirmar en T001 los nombres exactos de las cabeceras; usar por defecto `x-vercel-ip-latitude` y `x-vercel-ip-longitude`.
2. Implementar `readApproximateLocation`:
   - Leer ambas cabeceras, convertir con `Number.parseFloat`.
   - Si falta alguna o el resultado no es finito o está fuera de rango → `null`.
   - Redondear con `roundCoordinates` de T005.
3. Implementar `src/app/page.tsx`:
   ```tsx
   export const dynamic = 'force-dynamic';
   export default async function HomePage(): Promise<never> {
     const headerList = await headers();
     const location = readApproximateLocation(headerList);
     if (!location) redirect(ROUTES.clima.detail('bogota'));
     redirect(ROUTES.clima.detail(buildCoordinatesSlug(null, location)));
   }
   ```
   Ajustar la firma real si el tipo de retorno del componente no admite `never`.
4. Confirmar que `redirect()` emite 307 en un componente de servidor; si no, usar la alternativa que T001 documente.
5. Escribir pruebas de `readApproximateLocation`: cabeceras válidas, una sola cabecera, valores no numéricos y fuera de rango.
6. Ejecutar `pnpm test src/modules/location`.

## Criterios de aceptación

- [ ] Con cabeceras válidas, la redirección usa solo coordenadas redondeadas.
- [ ] Sin cabeceras, redirige a Bogotá.
- [ ] La redirección es 307.
- [ ] No se llama a Open-Meteo ni se consulta la lista curada.
- [ ] La ruta no se prerenderiza.

## Verificación

- `pnpm test src/modules/location` pasa.
- `curl -I http://localhost:3000/` muestra `307` y el `location` esperado con cabeceras simuladas.

## Notas y bloqueos

- Si los nombres de cabecera confirmados en T001 difieren, se cambia solo `ip-location.ts`.
