# T003 — Dependencias, scripts y configuración base

- **Fase:** F1
- **SPEC:** §3, §11
- **Depende de:** T001
- **Desbloquea:** T004 y todo el proyecto
- **Estado:** Pendiente

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

- [ ] Las tres dependencias de producción están en `dependencies`.
- [ ] Prettier ordena clases de Tailwind con el plugin.
- [ ] Los ocho scripts existen y funcionan.
- [ ] `.env.example` existe y no contiene claves.
- [ ] `next.config.ts` no se toca salvo que T001 lo justifique por escrito.

## Verificación

- `pnpm lint && pnpm typecheck && pnpm build` termina sin errores.
- `pnpm format --check` no falla por clases de Tailwind.

## Notas y bloqueos

- No añadir Zod, Yup, axios ni otra librería fuera del SPEC.
