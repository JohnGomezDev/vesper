# T025 — Páginas legales

- **Fase:** F8
- **SPEC:** §2.1, §11
- **Depende de:** T004
- **Desbloquea:** T027
- **Estado:** Pendiente
- **Bloqueo:** el texto legal lo entrega el dueño.

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

- [ ] Ambas rutas responden 200.
- [ ] El aviso de texto pendiente es visible mientras no haya texto.
- [ ] No se inventa contenido legal.
- [ ] La privacidad menciona cada punto del §11 cuando el texto llegue.
- [ ] Los enlaces del pie funcionan.

## Verificación

- `pnpm build` pasa.
- Navegar a `/terminos` y `/privacidad` y comprobar los enlaces.

## Notas y bloqueos

- No cerrar esta task como terminada hasta que el dueño entregue los textos; mientras tanto queda «Pendiente (bloqueada)».
