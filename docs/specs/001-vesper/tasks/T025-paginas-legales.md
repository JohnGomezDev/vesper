# T025 — Páginas legales

- **Fase:** F8
- **SPEC:** §2.1, §11
- **Depende de:** T004
- **Desbloquea:** T027
- **Estado:** Terminada (2026-11-03)

## Objetivo

Dejar operativas las rutas legales con el contenido del dueño.

## Resultado esperado

`/terminos` y `/privacidad` existen, son accesibles y muestran el texto del dueño o un estado explícito de «texto pendiente». No se inventa contenido legal.

## Alcance

**Incluye**

- Ruta `/terminos` y ruta `/privacidad`.
- Componentes de contenido separados de `app/`.
- Si falta el texto: mensaje «Texto pendiente de redacción» y un comentario claro en el componente.
- La privacidad recoge: coordenadas enviadas a Open-Meteo desde navegador y servidor, retención de registros de Open-Meteo, uso de IP y GPS, ausencia de almacenamiento propio y exposición de coordenadas al compartir un slug.
- Enlaces desde el pie de página.

**No incluye**

- Redactar el texto legal.
- Añadir cookies, analítica ni terceros.

## Archivos

### Crear

- `src/app/terminos/page.tsx` — metadata y composición.
- `src/app/privacidad/page.tsx` — metadata y composición.
- `src/modules/legal/components/TermsContent.tsx`
- `src/modules/legal/components/PrivacyContent.tsx`

### Modificar

- `src/app/layout.tsx` o el componente de pie — enlaces a ambas rutas con `ROUTES.legal`.

## Pasos detallados

1. Crear las dos páginas como shells que renderizan su componente de contenido.
2. Crear los componentes con la estructura de títulos del texto del dueño; dejar el cuerpo como `{/* PENDIENTE: texto del dueño */}` con un mensaje visible.
3. Añadir metadatos propios a cada página.
4. Añadir los enlaces en el pie con `ROUTES.legal.terms` y `ROUTES.legal.privacy`.
5. Cuando el dueño entregue el texto, sustituir el bloque pendiente sin tocar la estructura.
6. Ejecutar `pnpm build`.

## Criterios de aceptación

- [x] Ambas rutas responden 200.
- [x] El aviso de texto pendiente es visible mientras no haya texto.
- [x] No se inventa contenido legal.
- [x] La privacidad menciona cada punto del §11 cuando el texto llegue.
- [x] Los enlaces del pie funcionan.

## Verificación

- `pnpm build` pasa.
- Navegar a `/terminos` y `/privacidad` y comprobar los enlaces.

## Notas y bloqueos

- No cerrar esta task como terminada hasta que el dueño entregue los textos; mientras tanto queda «Pendiente (bloqueada)».

## Registro de ejecución y desviaciones (2026-11-03)

**Resultado (primera ejecución).** Rutas y shells implementados. `/terminos` y `/privacidad` responden 200, muestran «Texto pendiente de redacción» y están enlazadas desde el pie. La task quedó **Pendiente (bloqueada)** hasta la aprobación del texto; ver «Cierre (2026-11-03)».

### Archivos creados

- `src/app/terminos/page.tsx` — metadata y composición.
- `src/app/privacidad/page.tsx` — metadata y composición.
- `src/modules/legal/components/TermsContent.tsx` — título y bloque pendiente.
- `src/modules/legal/components/PrivacyContent.tsx` — título, bloque pendiente y comentario con los puntos de §11 que debe cubrir el texto del dueño.

### Archivos modificados

- `src/app/layout.tsx` — enlaces a `ROUTES.legal.terms` y `ROUTES.legal.privacy` en el pie visible (compartido con T026).

### Desviaciones y bloqueo

1. **Task no cerrada como Terminada en la primera ejecución (autorizado por el dueño).** La task prohíbe cerrarla hasta recibir los textos legales. Se implementó la estructura y el estado pendiente. El cierre llegó el 2026-11-03 con el texto aprobado por el dueño; ver «Cierre (2026-11-03)».
2. **Sin texto legal inventado.** El cuerpo visible es solo «Texto pendiente de redacción». No se redactaron términos ni política de privacidad. En `PrivacyContent.tsx` quedó un comentario con los cinco puntos del SPEC §11 para que el texto del dueño los cubra cuando llegue.
3. **Enlace «Volver al inicio» en ambas páginas.** Se añadió como salida de navegación; no es contenido legal.
4. **Metadatos propios.** Títulos y descripciones son genéricos de página (`Términos — Vesper`, `Privacidad — Vesper`); no describen obligaciones legales.

### Verificación

- `pnpm build`: correcto; `/terminos` y `/privacidad` se prerenderizan.
- `curl`: ambas rutas responden 200.
- El aviso «Texto pendiente de redacción» es visible en ambas.
- El pie muestra los enlaces «Términos» y «Privacidad» y la atribución a Open-Meteo.
- `pnpm exec prettier --check` sobre los archivos tocados: conforme.

## Cierre (2026-11-03)

El dueño aprobó el borrador de términos y privacidad y se integró en la app.

### Trabajo realizado

- `TermsContent.tsx` y `PrivacyContent.tsx`: sustituido el bloque pendiente por el texto completo aprobado, con encabezados, listas, enlaces internos y externos, descargo de responsabilidad, datos del titular y fecha/versión.
- `src/app/terminos/page.tsx` y `src/app/privacidad/page.tsx`: metadatos definitivos y `alternates.canonical` con `ROUTES.legal`.
- Contenido alineado con el SPEC §11: coordenadas enviadas a Open-Meteo desde navegador y servidor, retención de 90 días, uso de IP/GPS, ausencia de almacenamiento propio, exposición de coordenadas al compartir slugs, cookies/analítica, Vercel y derechos.
- Privacidad enlaza a Open-Meteo y a los Términos; Términos enlaza a la Privacidad. Ambas páginas se enlazan desde el pie.
- Se mantiene el ancho máximo `max-w-7xl` de la corrección anterior.

### Verificación

- `pnpm typecheck`, `pnpm lint`, `pnpm test` y `pnpm build`: correctos.
- `/terminos` y `/privacidad`: 200, texto visible y sin aviso de pendiente.
- Metadatos: títulos y descripciones únicos; canonical correcto.
- `pnpm exec prettier --check`: conforme.

### Nota

El texto es un borrador aprobado por el dueño. Antes de un uso comercial o de un cambio sustancial de alcance, conviene una revisión legal profesional.

## Corrección posterior (2026-11-03)

Solicitud del dueño: las páginas legales deben tener el mismo ancho máximo que la pantalla principal. Se cambió el contenedor de `/terminos` y `/privacidad` de `max-w-3xl` a `max-w-7xl`, el mismo que usan la cabecera y el `<main>` de `/clima/[slug]`. No se modificó el contenido ni los metadatos.

Verificación: `pnpm typecheck`, `pnpm lint`, `pnpm test` y `pnpm build` correctos; ambas rutas siguen respondiendo 200.
