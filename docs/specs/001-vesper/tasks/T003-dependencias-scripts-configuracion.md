# T003 — Dependencias, scripts y configuración base

- **Fase:** F1
- **SPEC:** §3, §11
- **Depende de:** T001
- **Desbloquea:** T004 y todo el proyecto
- **Estado:** Terminada

## Objetivo

Dejar instaladas y configuradas las dependencias, los scripts y el formato del proyecto.

## Resultado esperado

`package.json` con las dependencias del stack y los scripts; Prettier con el plugin de Tailwind; `.env.example` presente. `pnpm lint`, `pnpm typecheck` y `pnpm build` pasan.

## Alcance

**Incluye**

- Instalar dependencias de producción: `@tanstack/react-query`, `astronomy-engine`, `react-hook-form`.
- Instalar dependencias de desarrollo: `prettier`, `prettier-plugin-tailwindcss`, `vitest`.
- Añadir scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:watch`, `format`, `format:check`.
- Crear `.env.example` con la nota de que no hay claves.
- Revisar `next.config.ts` solo si T001 concluyó que `cacheComponents` o `partialPrefetching` rompen el modelo de caché del SPEC.

**No incluye**

- Crear componentes, hooks ni lógica de negocio.
- Configurar pruebas de componentes con DOM (el entorno de pruebas es de lógica pura).

## Archivos

### Crear

- `prettier.config.mjs` — configuración de Prettier.
- `.env.example` — comentario: la app no requiere variables de entorno.

### Modificar

- `package.json` — dependencias, `devDependencies` y `scripts`.
- `next.config.ts` — solo si T001 lo exige.

## Pasos detallados

1. Ejecutar:
   `pnpm add @tanstack/react-query astronomy-engine react-hook-form`
2. Ejecutar:
   `pnpm add -D prettier prettier-plugin-tailwindcss vitest`
3. En `package.json`, dejar los scripts:
   ```json
   {
     "dev": "next dev",
     "build": "next build",
     "start": "next start",
     "lint": "eslint .",
     "typecheck": "tsc --noEmit",
     "test": "vitest run",
     "test:watch": "vitest",
     "format": "prettier --write .",
     "format:check": "prettier --check ."
   }
   ```
4. Crear `prettier.config.mjs` con:
   ```js
   export default {
     singleQuote: true,
     trailingComma: 'all',
     printWidth: 100,
     semi: true,
     plugins: ['prettier-plugin-tailwindcss'],
   };
   ```
5. Crear `.env.example`:
   ```bash
   # Vesper no requiere variables de entorno.
   # Open-Meteo es público y no usa API key.
   ```
6. Ejecutar `pnpm typecheck`, `pnpm lint` y `pnpm build`.
7. Verificar que no existe ninguna variable sensible ni pública sin usar.

## Criterios de aceptación

- [x] Las tres dependencias de producción están en `dependencies`.
- [x] Prettier ordena clases de Tailwind con el plugin (verificado con clases reales en JSX).
- [x] Los ocho scripts existen y funcionan. `test` y `test:watch` se ejecutan, pero `vitest run`
      termina con código 1 mientras no haya archivos de prueba; el primer test llega en T007.
- [x] `.env.example` existe y no contiene claves.
- [x] `next.config.ts` no se toca salvo que T001 lo justifique por escrito. T001 concluyó que
      `cacheComponents` y `partialPrefetching` se mantienen; el archivo solo cambió de formato por
      Prettier (comillas), sin cambios de configuración.

## Verificación

- `pnpm lint && pnpm typecheck && pnpm build` termina sin errores.
- `pnpm format --check` no falla por clases de Tailwind.

## Notas y bloqueos

- No añadir Zod, Yup, axios ni otra librería fuera del SPEC.

---

## Registro de ejecución y desviaciones (2026-10-20)

**Resultado.** Task ejecutada. Se instalaron las dependencias del stack, se añadieron los ocho scripts, se creó `prettier.config.mjs` y `.env.example`. `pnpm typecheck`, `pnpm lint`, `pnpm build` y `pnpm format:check` terminan sin errores. No se escribió código de negocio ni se modificó la configuración funcional de Next.js.

**Versiones instaladas.** `@tanstack/react-query` 5.104.5, `astronomy-engine` 2.1.19, `react-hook-form` 7.90.0 (producción); `prettier` 3.9.10, `prettier-plugin-tailwindcss` 0.8.1, `vitest` 5.0.5 (desarrollo).

**Desviaciones y decisiones.**

1. **Carpeta `types/` obsoleta eliminada (autorizado por el dueño).** La raíz del repositorio versionaba `types/` con archivos generados por Next.js (`validator.ts`, `routes.d.ts`, `cache-life.d.ts`, `root-params.d.ts`) de una versión anterior. No la usa el proyecto: `next-env.d.ts` referencia `.next/types/`, que es donde Next 16.4.1 genera los tipos. Esa carpeta hacía fallar `pnpm typecheck`, `pnpm lint` y `pnpm build` con cuatro errores (`TS2307` y `TS2344`) ajenos a esta task. Se eliminó y con ello las tres comprobaciones pasan. La eliminación no forma parte del alcance original de T003.
2. **`.gitignore`: excepción `!.env.example` (autorizado por el dueño).** La regla `.env*` ignoraba el archivo requerido por el paso 5. Se añadió la negación para que `.env.example` se pueda versionar. Cambio fuera del alcance original.
3. **`pnpm format:check` en lugar de `pnpm format --check`.** El comando de la sección «Verificación» no es válido: `pnpm format` ya ejecuta `prettier --write .` y `--check` no es un argumento reconocido en esa posición. El script correcto es `pnpm format:check`, que termina con «All matched files use Prettier code style!».
4. **Formato aplicado a todo el repositorio (autorizado por el dueño).** `pnpm format` reescribió 22 archivos preexistentes fuera del alcance de la task: `AGENTS.md`, `README.md`, `docs/**`, `.agents/**`, `.opencode/skills/**`, `eslint.config.mjs`, `next.config.ts`, `src/app/{globals.css,layout.tsx,page.tsx}`, `tsconfig.json` (sin cambios), `pnpm-lock.yaml` y `pnpm-workspace.yaml` (sin cambios). Son cambios de formato (comillas, reflujo Markdown, orden de clases Tailwind), no de contenido. `next.config.ts` solo cambió comillas; su configuración (`cacheComponents`, `partialPrefetching`, `turbopack`) quedó intacta, por lo que se cumple el criterio de no tocarlo. `pnpm install --frozen-lockfile` sigue aceptando el lockfile reformateado.
5. **`pnpm test` sin archivos de prueba (decisión autorizada: dejar el script literal).** `vitest run` termina con código 1 y el mensaje «No test files found». El script se mantuvo exactamente como pide el paso 3; pasará cuando T007 añada las pruebas de dominio. `test:watch` se comporta igual (queda a la espera y no encuentra archivos).
6. **Aviso de peer dependency de `vitest`.** Vitest 5.0.5 declara `@types/node` `^22.0.0 || >=24.0.0`; el proyecto usa `^20`. No afecta a `typecheck`, `lint` ni `build`. No se actualizó `@types/node` porque no lo pide la task.
7. **Aviso de ESLint en `prettier.config.mjs`.** `pnpm lint` termina con 0 errores y 1 warning (`import/no-anonymous-default-export`) porque el paso 4 exige exportar el objeto directamente. Se conserva el contenido literal pedido.
8. **Prettier y Tailwind v4.** El plugin ordena clases correctamente sin `tailwindStylesheet` (verificado sobre `src/app/page.tsx`: `flex flex-col flex-1` → `flex flex-1 flex-col`). No se añadieron opciones fuera de las del paso 4.

**Archivos tocados.**

- `package.json` — dependencias, `devDependencies` y los ocho scripts.
- `pnpm-lock.yaml` — actualizado por `pnpm add` y por Prettier.
- `prettier.config.mjs` — creado.
- `.env.example` — creado.
- `.gitignore` — excepción `!.env.example`.
- `types/` — eliminado (carpeta generada obsoleta).
- `docs/specs/001-vesper/tasks/T003-dependencias-scripts-configuracion.md` — estado, criterios y esta sección.
- `docs/specs/001-vesper/tasks/README.md` — T003 marcada como «Terminada».
- Resto de archivos reformateados por `pnpm format` (punto 4), solo formato.

**Criterios de aceptación.**

- [x] Las tres dependencias de producción están en `dependencies`.
- [x] Prettier ordena clases de Tailwind con el plugin.
- [x] Los ocho scripts existen y funcionan (`test`/`test:watch` fallan solo por ausencia de pruebas hasta T007).
- [x] `.env.example` existe, no contiene claves y ya no está ignorado.
- [x] `next.config.ts` no se toca salvo formato; T001 concluyó mantener `cacheComponents` y `partialPrefetching`.

**Verificación.**

- `pnpm typecheck` — sin salida, código 0.
- `pnpm lint` — 0 errores, 1 warning en `prettier.config.mjs`.
- `pnpm build` — compila y prerenderiza `/` y `/_not-found`.
- `pnpm format:check` — «All matched files use Prettier code style!».
- `pnpm test` — código 1, «No test files found» (esperado hasta T007).
