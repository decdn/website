# deCDN — marketing site

A decentralized delivery layer for bytes at scale. Anyone can serve bytes; clients pay per megabyte in USDC.

![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Tailwind CSS v4](https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)
![TypeScript 6](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=white)
![Cloudflare Pages](https://img.shields.io/badge/Cloudflare%20Pages-deployed-F38020?logo=cloudflarepages&logoColor=white)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-FE5196?logo=conventionalcommits&logoColor=white)](https://www.conventionalcommits.org)
![Code style: Prettier](https://img.shields.io/badge/code%20style-Prettier-F7B93E?logo=prettier&logoColor=black)

This is the source for the deCDN marketing site and blog.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · TypeScript · pnpm. Static export, deployed to Cloudflare Pages.

## Getting started

```bash
pnpm install   # required (not npm/yarn) — husky hooks shell out to `pnpm exec`
pnpm dev       # dev server on :3000
pnpm build     # static export → ./out
pnpm test      # vitest run
pnpm lint      # eslint (flat config)
pnpm format    # prettier --write .
```

## Project layout

- `app/` — App Router entry (`layout.tsx`, `page.tsx`, `globals.css`) plus the blog routes (`blog/`, `blog/[slug]/`), sitemap/robots handlers, and file-convention metadata assets.
- `components/site/` — page sections composed by `app/page.tsx` (Hero, Compare, Method, Faq, Contact).
- `components/ui/` — low-level primitives (Frame, SectionHeader, Figure, …).
- `lib/` — shared helpers (`links.ts`, `blog.ts`, `faq.ts`, `jsonld.tsx`).
- `content/blog/` — MDX posts loaded by `lib/blog.ts` and rendered by `app/blog/[slug]/page.tsx`.
- `docs/` — Mintlify source for `docs.decdn.org`. Built and deployed independently of `pnpm build`; not part of the static export and not imported from the website code.
- Path alias: `@/*` maps to the project root (e.g. `@/lib/links`, not `@/src/...`).

## Gotchas

- **Static export only.** `next.config.ts` sets `output: "export"`; the build emits `./out`. No SSR, ISR, middleware, or Image Optimization API. Route handlers (`app/sitemap.xml/route.ts`, `app/sitemap-pages.xml/route.ts`) must be `dynamic = "force-static"` and GET-only; the `app/robots.ts` metadata file emits `robots.txt` and also requires `dynamic = "force-static"`.
- **`trailingSlash: true`.** Every route emits `<path>/index.html`. Internal links and hand-built URLs (sitemap entries, JSON-LD `@id`s) should expect a trailing slash — see `SITE_URL` and `BLOG_URL` in `lib/links.ts`.
- **Tailwind v4.** Theme tokens live in `app/globals.css` under `@theme inline { … }` — there is no `tailwind.config.*`.
- **Conventional commits enforced.** `commitlint` runs in the `commit-msg` husky hook; non-conforming messages are rejected.
- **`metadataBase` is live.** `lib/links.ts` `site` is the real origin and `INDEXABLE` is `true`. Anything anchored on this origin — OG and canonical (via `metadataBase`); JSON-LD and the sitemap/robots emitters (via `SITE_URL`) — ships to production. Flipping `INDEXABLE` flips `<meta name="robots">` only; `robots.txt` and the sitemap stay unconditional by design (rationale in `lib/links.ts`).

## Deploy

Cloudflare Pages serves the `out/` directory produced by `pnpm build`.

## Agent contributors

See [`AGENTS.md`](./AGENTS.md) for the full ruleset (`CLAUDE.md` is a one-line include of it).
