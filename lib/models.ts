// The seeded launch catalogue, read from public/demo.json at build time.
//
// public/demo.json is written by the seeding runbook and is the single
// source for which bundles the site offers (models, datasets, ISOs, videos):
// an item appears here only once its verified BLAKE3 hash lands in that file.
// The file also ships as a static asset at /demo.json for anyone scripting
// against the catalogue.
//
// The command carries the hash, never the item's name: the hash is what
// `decdn` fetches and what every byte is verified against, so the line a
// visitor copies names exactly the bytes they get.

import catalogue from "@/public/demo.json";
import { links } from "@/lib/links";

/** The kinds of bundle the catalogue offers, in display order. */
export const KINDS = [
  { id: "model", label: "models" },
  { id: "dataset", label: "datasets" },
  { id: "iso", label: "isos" },
  { id: "video", label: "videos" },
] as const;

export type Kind = (typeof KINDS)[number]["id"];

export type Item = {
  id: string;
  kind: Kind;
  name: string;
  license: string;
  /** Where the bytes were published upstream: a Hugging Face repo or the
   *  publisher's download page. */
  source: string;
  /** `b3:` + 64 lowercase hex characters. */
  hash: string;
  /** The namespace the item is published under (ADR 002). Passed to the
   *  installer's `pull --namespace` so a node that has not cached the
   *  item pulls it from that namespace's origins. A routing hint only: the
   *  bytes are verified against `hash` either way. */
  namespace?: number;
  bytes: number;
};

function isKind(kind: string): kind is Kind {
  return KINDS.some((k) => k.id === kind);
}

// JSON imports type `kind` as a plain string; an unknown kind fails the build
// here rather than rendering an item no group shows.
export const ITEMS: readonly Item[] = catalogue.items.map((item) => {
  if (!isKind(item.kind)) {
    throw new Error(`demo.json: ${item.id} has unknown kind "${item.kind}"`);
  }
  return { ...item, kind: item.kind };
});

/** The catalogue grouped by kind, in `KINDS` order, empty kinds left out. */
export function groupByKind(
  items: readonly Item[],
): { kind: Kind; label: string; items: Item[] }[] {
  return KINDS.map((k) => ({
    kind: k.id,
    label: k.label,
    items: items.filter((item) => item.kind === k.id),
  })).filter((group) => group.items.length > 0);
}

/** The source link's text: the repo path on Hugging Face, host + path
 *  elsewhere. */
export function sourceLabel(source: string): string {
  const url = new URL(source);
  const path = url.pathname.replace(/^\/|\/$/g, "");
  if (url.hostname === "huggingface.co") return path;
  return path ? `${url.hostname}/${path}` : url.hostname;
}

export const HASH_RE = /^b3:[0-9a-f]{64}$/;

/** The shell a visitor pastes the command into. */
export type Platform = "unix" | "windows";

export const PLATFORMS: readonly {
  id: Platform;
  label: string;
  shell: string;
  prompt: string;
}[] = [
  { id: "unix", label: "macos / linux", shell: "terminal", prompt: "$" },
  { id: "windows", label: "windows", shell: "powershell", prompt: "PS>" },
];

/** The one line that installs `decdn` and pulls `hash` (published under
 *  `namespace`, when it has one) into the current directory: a POSIX shell
 *  pipe on macOS and Linux; on Windows, the PowerShell installer run as a
 *  script block, so the pull arguments reach it. `namespace` also takes a
 *  placeholder string for prose examples. */
export function pullCommand(
  hash: string,
  platform: Platform = "unix",
  namespace?: number | string,
): string {
  const pull =
    namespace === undefined
      ? `pull ${hash}`
      : `pull ${hash} --namespace ${namespace}`;
  return platform === "windows"
    ? `& ([scriptblock]::Create((irm ${links.installerPs1}))) ${pull}`
    : `curl -fsSL ${links.installer} | sh -s -- ${pull}`;
}

/** Windows visitors get the PowerShell line; everyone else the POSIX one. */
export function detectPlatform(platformOrUserAgent: string): Platform {
  return /win/i.test(platformOrUserAgent) &&
    !/darwin/i.test(platformOrUserAgent)
    ? "windows"
    : "unix";
}

/** Decimal gigabytes, one place: 28995469846 → "29.0 GB". */
export function formatSize(bytes: number): string {
  return `${(bytes / 1e9).toFixed(1)} GB`;
}
