import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { dottedDate, getPost, listPosts, seriesLabel } from "@/lib/blog";

// Static export: under `output: "export"` Next refuses to collect a
// metadata Route Handler without this flag — same rule as
// app/sitemap.xml/route.ts, app/sitemap-pages.xml/route.ts, app/robots.ts
// (see AGENTS.md "Static export only").
export const dynamic = "force-static";

// The metadata route does NOT inherit generateStaticParams from the
// sibling page.tsx — each file convention enumerates its own params.
// Driving both off listPosts() keeps them single-sourced. Posts with a
// frontmatter `image:` override are filtered out: their <meta> tags
// point at the override URL, so the generated card would ship as an
// unreferenced PNG in the static export.
export function generateStaticParams() {
  return listPosts()
    .filter((p) => !p.image)
    .map((p) => ({ slug: p.slug }));
}

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// Static alt by design. A per-post alt would force `generateImageMetadata`,
// which inserts an `id` segment into the emitted URL — the card itself
// carries the title visually, so a brand-level alt is acceptable.
export const alt = "deCDN — field notes";

// Inlined palette — Satori can't see app/globals.css CSS-var tokens.
// Keep in sync with --ink / --paper / --whisper there (lines 3–6).
const INK = "#000000";
const PAPER = "#ffffff";
const WHISPER = "#0f9d6a";

type Params = { slug: string };

export default async function Image({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  // Auto-shrink long titles so two-line layouts stay inside the safe
  // area. The cutoff (~44 chars) is the longest title that still fits
  // on one line at 76px in Geist Regular at this canvas width.
  const titleSize = post.title.length > 44 ? 60 : 76;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        backgroundColor: INK,
        color: PAPER,
      }}
    >
      {/* Eyebrow — echoes the site `.meta` treatment (uppercase, wide
            tracking, dimmed). */}
      <div
        style={{
          fontSize: 22,
          letterSpacing: "0.22em",
          color: "rgba(255, 255, 255, 0.6)",
        }}
      >
        DECDN · FIELD LOG
      </div>

      {/* Title — echoes the site `.hug` treatment (tight negative
            tracking on large display sizes). */}
      <div
        style={{
          fontSize: titleSize,
          letterSpacing: "-0.03em",
          lineHeight: 1.05,
        }}
      >
        {post.title}
      </div>

      {/* Bottom row — date · series · whisper dot. `space-between`
            pins the dot to the right edge without absolute positioning. */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 22,
          letterSpacing: "0.22em",
          color: "rgba(255, 255, 255, 0.6)",
        }}
      >
        <span>{dottedDate(post.date)}</span>
        <span>§ {seriesLabel(post.seriesNumber)}</span>
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: WHISPER,
          }}
        />
      </div>
    </div>,
    { ...size },
  );
}
