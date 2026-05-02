# deCDN — marketing site

A peer-to-peer delivery layer for bytes at scale. Anyone can serve bytes; clients pay per megabyte in USDC.

![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Tailwind CSS v4](https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)
![TypeScript 5](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=white)
![Cloudflare Pages](https://img.shields.io/badge/Cloudflare%20Pages-deployed-F38020?logo=cloudflarepages&logoColor=white)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-FE5196?logo=conventionalcommits&logoColor=white)](https://www.conventionalcommits.org)
![Code style: Prettier](https://img.shields.io/badge/code%20style-Prettier-F7B93E?logo=prettier&logoColor=black)

This is the source for the static one-page deCDN marketing site.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · TypeScript · pnpm. Static export, deployed to Cloudflare Pages.

## Getting started

```bash
pnpm install   # required (not npm/yarn) — husky hooks shell out to `pnpm exec`
pnpm dev       # dev server on :3000
pnpm build     # static export → ./out
pnpm lint      # eslint (flat config)
pnpm format    # prettier --write .
```

## Project layout

- `app/` — App Router entry (`layout.tsx`, `page.tsx`, `globals.css`).
- `components/site/` — page sections composed by `app/page.tsx` (Hero, Comparison, Method, Faq, Close).
- `components/ui/` — low-level primitives (Frame, SectionHeader, Figure, …).
- `lib/` — shared helpers (currently just `links.ts`).
- Path alias: `@/*` maps to the project root (e.g. `@/lib/links`, not `@/src/...`).

## Gotchas

- **Static export only.** `next.config.ts` sets `output: "export"`; the build emits `./out`. No SSR, route handlers, ISR, middleware, or Image Optimization API.
- **Tailwind v4.** Theme tokens live in `app/globals.css` under `@theme inline { … }` — there is no `tailwind.config.*`.
- **Conventional commits enforced.** `commitlint` runs in the `commit-msg` husky hook; non-conforming messages are rejected.
- **Placeholder links.** `lib/links.ts` points at `decdn.example`, and `app/layout.tsx` keeps `robots: { index: false }`. Flip both together, never one alone.

## Deploy

Cloudflare Pages serves the `out/` directory produced by `pnpm build`.

## Agent contributors

See [`AGENTS.md`](./AGENTS.md) for the full ruleset (`CLAUDE.md` is a one-line include of it).
