// The seeded launch catalogue, read from public/models.json at build time.
//
// public/models.json is written by the seeding runbook and is the single
// source for which models the site offers: a model appears here only once its
// verified BLAKE3 hash lands in that file. The file also ships as a static
// asset at /models.json for anyone scripting against the catalogue.
//
// The command carries the hash, never the model's name: the hash is what
// `decdn-sponsored` fetches and what every byte is verified against, so the
// line a visitor copies names exactly the bytes they get.

import catalogue from "@/public/models.json";
import { links } from "@/lib/links";

export type Model = {
  id: string;
  name: string;
  repo: string;
  license: string;
  /** `b3:` + 64 lowercase hex characters. */
  hash: string;
  /** The namespace the model is published under (ADR 002). Passed to
   *  `decdn-sponsored pull --namespace` so a node that has not cached the
   *  model pulls it from that namespace's origins. A routing hint only: the
   *  bytes are verified against `hash` either way. */
  namespace?: number;
  bytes: number;
};

export const MODELS: readonly Model[] = catalogue.models;

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

/** The one line that installs `decdn` + `decdn-sponsored` and pulls `hash`
 *  (published under `namespace`, when it has one) into the current
 *  directory: a POSIX shell pipe on macOS and Linux, a PowerShell one on
 *  Windows. `namespace` also takes a placeholder string for prose examples. */
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
    ? `irm ${links.installerPs1} | iex; decdn-sponsored ${pull}`
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
