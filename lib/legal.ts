import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import matter from "gray-matter";

const LEGAL_DIR = path.join(process.cwd(), "content", "legal");

// The closed set of legal documents. Adding one means adding its MDX file,
// a route under app/<slug>/, a footer link, and a sitemap-pages entry — see
// the PR that introduced these for the full checklist.
export const LEGAL_SLUGS = ["privacy", "terms", "disclaimer"] as const;
export type LegalSlug = (typeof LEGAL_SLUGS)[number];

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export type LegalDoc = {
  slug: LegalSlug;
  title: string;
  description: string;
  /** ISO `YYYY-MM-DD` for the `<time dateTime>` attribute. */
  effective: string;
  /** Human-readable effective date, e.g. "22 June 2026". */
  effectiveLabel: string;
  body: string;
};

// Manual format avoids `new Date(iso).toLocaleDateString()`, which is banned
// in some run contexts and would also shift the day across timezones.
function formatEffective(iso: string, file: string): string {
  if (!ISO_DATE_RE.test(iso)) {
    throw new Error(
      `[legal] ${file}: frontmatter \`effective\` must be an ISO date (YYYY-MM-DD), got "${iso}"`,
    );
  }
  const [y, m, d] = iso.split("-");
  return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`;
}

function requireString(value: unknown, field: string, file: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`[legal] ${file}: frontmatter \`${field}\` is required`);
  }
  return value.trim();
}

export function getLegalDoc(slug: LegalSlug): LegalDoc {
  const file = `${slug}.mdx`;
  const raw = fs.readFileSync(path.join(LEGAL_DIR, file), "utf8");
  const { data, content } = matter(raw);
  const effective = requireString(data.effective, "effective", file);
  return {
    slug,
    title: requireString(data.title, "title", file),
    description: requireString(data.description, "description", file),
    effective,
    effectiveLabel: formatEffective(effective, file),
    body: content.trim(),
  };
}

export function legalMetadata(slug: LegalSlug): Metadata {
  const doc = getLegalDoc(slug);
  const canonical = `/${slug}/`;
  return {
    title: doc.title,
    description: doc.description,
    alternates: { canonical },
    openGraph: {
      title: doc.title,
      description: doc.description,
      url: canonical,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: doc.title,
      description: doc.description,
    },
  };
}
