<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Stack

Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · TypeScript · pnpm. Node ≥24 (see `.nvmrc`).

## Commands

```bash
pnpm install          # required — husky hooks and lint-staged invoke `pnpm exec`
pnpm dev              # dev server on :3000
pnpm build            # static export → ./out
pnpm start            # serve a prior `next build` output (not the static export)
pnpm test             # vitest run — see `lib/blog.test.ts` for the pattern
pnpm lint             # eslint (flat config)
pnpm format           # prettier --write .
pnpm format:check     # prettier --check . (CI)
```

## Layout

- `app/` — App Router entry (`layout.tsx`, `page.tsx`, `globals.css`), the `blog/` and `blog/[slug]/` routes, the `legal/[doc]` route, the `robots.txt/route.ts` / `sitemap.xml/route.ts` / `sitemap-pages.xml/route.ts` handlers, and the file-convention assets (`favicon.ico`, `icon.svg`, `apple-icon.png`, `opengraph-image.{png,alt.txt}`).
- `components/site/` — page sections composed by `app/page.tsx` (Hero, Compare, Method, Faq, Contact, …) plus chrome (`Chrome`, `Footer`, `ScrollReveal`, …). Section components are named after their section `id` (e.g. `Contact.tsx` for `id="contact"`); `Hero` is the idiomatic exception for the top `id="intro"` section.
- `components/ui/` — low-level primitives (Frame, SectionHeader, Prose, Figure, …).
- `lib/` — shared helpers (`links.ts`, `blog.ts`, `faq.ts`, `legal.ts`, `jsonld.tsx`, …).
- `content/blog/` — MDX posts loaded by `lib/blog.ts` and rendered via `app/blog/[slug]/page.tsx`.
- `content/legal/` — MDX for the legal pages (`privacy`, `terms`, `disclaimer`) loaded by `lib/legal.ts` and rendered via `app/legal/[doc]/page.tsx`.
- `docs/` — Mintlify source for `docs.decdn.org` (separate build pipeline, not part of the static export).
- Path alias `@/*` → project root (e.g. `@/lib/links`, not `@/src/...`).

## Gotchas

- **Static export only.** `next.config.ts` has `output: "export"`. No SSR, ISR, middleware, or Image Optimization API. Route handlers (`app/robots.txt/route.ts`, `app/sitemap.xml/route.ts`, `app/sitemap-pages.xml/route.ts`) are allowed only when statically generated at build time (`dynamic = "force-static"`, GET-only). `robots.txt` is a hand-written route handler rather than the Next `app/robots.ts` metadata file so it can emit non-standard directives (`Content-Signal:` per contentsignals.org).
- **`trailingSlash: true`.** `next.config.ts` emits every route as `<path>/index.html` and canonical/internal links should expect a trailing slash. Cloudflare Pages serves `out/` as-is.
- **Tailwind v4.** `globals.css` uses `@import "tailwindcss"` and `@theme inline { … }`. There is no `tailwind.config.*` — theme tokens live in CSS. Don't reach for v3 directives.
- **Conventional commits required.** `commitlint` runs in the `commit-msg` husky hook; non-conforming messages are rejected.
- **`metadataBase` is live.** `lib/links.ts` `site` is the real origin and `INDEXABLE` is `true`. Anything anchored on this origin — OG and canonical (via `metadataBase`); JSON-LD, `app/sitemap.xml/route.ts`, `app/sitemap-pages.xml/route.ts`, `app/robots.txt/route.ts` (via `SITE_URL`) — ships to production. Adding a new non-blog page = append an entry to `app/sitemap-pages.xml/route.ts`; blog posts auto-derive from `content/blog/` and legal pages from the closed `LEGAL_SLUGS` list in `lib/legal.ts`. Flip `INDEXABLE` to mark pages noindex; `robots.txt` and the sitemap remain unchanged by design (see `lib/links.ts` for why).
- **`docs/` is a different product.** Mintlify Cloud builds it from `docs/docs.json` and serves it at `docs.decdn.org` — independent of `pnpm build`. The website code must not import from `docs/`; ESLint and the website CI workflow ignore it. Edits to MDX go through the `docs` workflow (Prettier + `markdownlint-cli2` + `mintlify broken-links`).
- **CSS custom properties in `style` props.** Known `--var` names are declared in `types/css.d.ts` (module-augmenting React's `CSSProperties`) so call sites can write `style={{ "--reveal-delay": "120ms" }}` without a cast. Add new vars there before using them.
