# Landing pública — Consejo Independiente de Verificación de Credenciales

Front público de veeduría ciudadana. Es **uno de tres proyectos independientes**:

| Carpeta         | Qué es                                                                       | Puerto |
| --------------- | ---------------------------------------------------------------------------- | ------ |
| `../api`        | Backend NestJS. Única fuente de verdad; el único que toca PostgreSQL y MinIO | 3001   |
| `.` (este)      | Landing pública. Sólo lectura de endpoints públicos                          | 3000   |
| `../backoffice` | Panel interno de secretaría, evaluación y publicación                        | 3002   |

No son un monorepo: cada uno tiene su `package.json`, su `node_modules` y su
propio despliegue.

## Arrancar

```bash
cd ../api && pnpm infra:up && pnpm dev   # la API debe estar arriba
pnpm install && pnpm dev                 # esta aplicación, en :3000
```

Variables en `.env.local` (plantilla en `.env.example`). Sólo `NEXT_PUBLIC_*`:
este proyecto no maneja ningún secreto.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript 6 · Tailwind CSS 4 · Zod 4 ·
Vitest 5 · pnpm 12 · Node 24.

TypeScript se mantiene en **6.0.3 a propósito**: `typescript-eslint` aún declara
`typescript <6.1.0`, así que TypeScript 7 rompería el linter con tipos.

## Antes de tocar nada visible

Lee la skill `front-publico-civis` (en `.claude/skills/`). Contiene la paleta,
la escala tipográfica y las cinco reglas que no se negocian — entre ellas, que
esta aplicación **no hace ninguna petición a terceros**.

## Comprobación antes de dar algo por terminado

```bash
pnpm validate    # formato + lint + typecheck + pruebas
pnpm build
```

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
