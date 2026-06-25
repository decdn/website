import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import matter from "gray-matter";

const LEGAL_DIR = path.join(process.cwd(), "content", "legal");

// The closed set of legal documents, served from app/legal/[doc]/. Adding
// one means adding its MDX file under content/legal/ and a slug here; the
// route, sitemap entry, and metadata all derive from this list. A footer
// link is the only other manual step.
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
// Exported for tests.
export function formatEffective(iso: string, file: string): string {
  if (!ISO_DATE_RE.test(iso)) {
    throw new Error(
      `[legal] ${file}: frontmatter \`effective\` must be an ISO date (YYYY-MM-DD), got "${iso}"`,
    );
  }
  const [y, m, d] = iso.split("-").map(Number);
  // The regex only checks digit count, so shape-valid but non-existent dates
  // (2026-13-40, 2026-02-30) still get here and would index MONTHS out of
  // bounds, silently rendering "undefined". `Date.UTC` normalizes out-of-range
  // parts, so a round-trip mismatch means the calendar day doesn't exist; UTC
  // keeps it timezone-stable.
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() !== m - 1 ||
    dt.getUTCDate() !== d
  ) {
    throw new Error(
      `[legal] ${file}: frontmatter \`effective\` "${iso}" is not a real calendar date`,
    );
  }
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

function requireString(value: unknown, field: string, file: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`[legal] ${file}: frontmatter \`${field}\` is required`);
  }
  return value.trim();
}

// YAML coerces an unquoted `YYYY-MM-DD` into a Date, which would then fail the
// `requireString` check even though the value is present. Coerce back to a
// stable ISO string so both quoted and unquoted `effective:` are accepted.
function requireEffective(value: unknown, file: string): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return requireString(value, "effective", file);
}

export function getLegalDoc(slug: LegalSlug): LegalDoc {
  const file = `${slug}.mdx`;
  const raw = fs.readFileSync(path.join(LEGAL_DIR, file), "utf8");
  let parsed;
  try {
    parsed = matter(raw);
  } catch (err) {
    // gray-matter / js-yaml errors carry "line N, column M" but no filename.
    // Re-throw with file context so an operator can find the bad doc.
    throw new Error(
      `[legal] ${file}: failed to parse frontmatter — ${(err as Error).message}`,
      { cause: err },
    );
  }
  const { data, content } = parsed;
  const effective = requireEffective(data.effective, file);
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
  const canonical = `/legal/${slug}/`;
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
