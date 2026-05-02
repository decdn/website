<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Stack

Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · TypeScript · pnpm.

## Commands

```bash
pnpm install          # required — husky hooks and lint-staged invoke `pnpm exec`
pnpm dev              # dev server on :3000
pnpm build            # static export → ./out
pnpm lint             # eslint (flat config)
pnpm format           # prettier --write .
```

## Layout

- `app/` — App Router entry (`layout.tsx`, `page.tsx`, `globals.css`); no route groups yet.
- `components/site/` — page sections composed by `app/page.tsx` (Hero, Problem, …).
- `components/ui/` — low-level primitives (Button, Section, Stat, Mono).
- `lib/` — shared helpers (currently just `links.ts`).
- Path alias `@/*` → project root (e.g. `@/lib/links`, not `@/src/...`).

## Gotchas

- **Static export only.** `next.config.ts` has `output: "export"`. No SSR, route handlers, ISR, middleware, or Image Optimization API. Build output lands in `out/`.
- **Tailwind v4.** `globals.css` uses `@import "tailwindcss"` and `@theme inline { … }`. There is no `tailwind.config.*` — theme tokens live in CSS. Don't reach for v3 directives.
- **Conventional commits required.** `commitlint` runs in the `commit-msg` husky hook; non-conforming messages are rejected.
- **`metadataBase` is live.** `lib/links.ts` `site` is the real origin and `robots: { index: true }`. Anything that absolutizes through `metadataBase` (OG, JSON-LD, canonical) ships to production — keep payloads accurate.
