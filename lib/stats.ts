// Live testnet figures for the two homepage panels (HeroTerminal, FleetStatus).
//
// The decdn/stats Worker indexes the FeeRouter, CapacityBond and PaymentPool
// logs on Arbitrum Sepolia every five minutes and writes the result to a
// public R2 bucket as `stats-<CHAIN_ID>.json`. The site stays a static export:
// the panels render an honest "loading" state into the HTML and fill in from
// that file in the browser. The file's CORS policy allows any origin; our own
// CSP has to allow it too (`connect-src` in public/_headers).
//
// Everything in this module is pure except `loadStats`, so the shape check,
// the formatting and the view models are unit-tested without a network.

export const STATS_CHAIN_ID = 421614;
export const STATS_ORIGIN = "https://data.decdn.org";
export const STATS_URL = `${STATS_ORIGIN}/stats-${STATS_CHAIN_ID}.json`;

type Hex = `0x${string}`;

/** One FeeRouter `Settled` log. Amounts and byte counts are decimal strings:
 *  USDC in 6-decimal base units, bytes as a raw count. */
export type SettlementRow = {
  txHash: Hex;
  logIndex: number;
  blockNumber: number;
  timestamp: number;
  operator: Hex;
  bytesDelivered: string;
  amount: string;
  epoch: number;
};

export type HourlyPoint = {
  /** UTC hour, "2026-09-23T14". */
  hour: string;
  valueSettled: string;
  bytesServed: string;
  settlementCount: number;
  registeredNodes: number;
};

/**
 * The subset of the stats file the panels read. The full shape (and the
 * indexer that writes it) lives in decdn/stats `worker/src/stats.ts`; fields
 * we don't use are left out rather than restated.
 */
export type Stats = {
  chainId: number;
  updatedAt: string;
  lastBlock: number;
  /** False while the indexer is backfilling: totals are partial and the
   *  hourly series ends in the past. */
  caughtUp: boolean;
  totals: {
    valueSettled: string;
    bytesServed: string;
    settlementCount: number;
  };
  hourly: HourlyPoint[];
  /** Newest first. */
  settlements: SettlementRow[];
  /** The CapacityBond registered set, keyed by nodeId. `region` is an
   *  upper-case ISO 3166-1 alpha-2 code, or `UNKNOWN_REGION`. */
  nodes: Record<Hex, { operator: Hex; region: string }>;
};

/** Where the indexer counts a node with no valid region hint. */
export const UNKNOWN_REGION = "unknown";

const isUint = (value: unknown) =>
  typeof value === "string" && /^\d+$/.test(value);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** The parsed file as `Stats` when it has the shape the panels read, else
 *  null — an older schema, the wrong chain, or not stats at all. */
export function asStats(value: unknown): Stats | null {
  if (!isRecord(value)) return null;
  const s = value as Partial<Stats>;
  const ok =
    s.chainId === STATS_CHAIN_ID &&
    typeof s.updatedAt === "string" &&
    !Number.isNaN(Date.parse(s.updatedAt)) &&
    typeof s.lastBlock === "number" &&
    typeof s.caughtUp === "boolean" &&
    isRecord(s.totals) &&
    isUint(s.totals.valueSettled) &&
    isUint(s.totals.bytesServed) &&
    typeof s.totals.settlementCount === "number" &&
    Array.isArray(s.hourly) &&
    s.hourly.every(
      (p) => isRecord(p) && isUint(p.valueSettled) && isUint(p.bytesServed),
    ) &&
    Array.isArray(s.settlements) &&
    s.settlements.every(
      (r) =>
        isRecord(r) &&
        typeof r.txHash === "string" &&
        typeof r.logIndex === "number" &&
        typeof r.operator === "string" &&
        typeof r.blockNumber === "number" &&
        typeof r.timestamp === "number" &&
        typeof r.epoch === "number" &&
        isUint(r.bytesDelivered) &&
        isUint(r.amount),
    ) &&
    isRecord(s.nodes);
  return ok ? (s as Stats) : null;
}

// --- formatting -----------------------------------------------------------

const BYTE_UNITS = ["B", "KB", "MB", "GB", "TB", "PB"];

/** Raw byte count (decimal string) → "13.4 GB", base-1000 like the stats
 *  dashboard. Whole bytes stay whole: "0 B", not "0.0 B". */
export function formatBytes(bytes: string): string {
  let value = Number(bytes);
  let unit = 0;
  while (value >= 1000 && unit < BYTE_UNITS.length - 1) {
    value /= 1000;
    unit += 1;
  }
  return `${value.toFixed(unit === 0 ? 0 : 1)} ${BYTE_UNITS[unit]}`;
}

/** 6-decimal USDC base units → "$0.1309", "$0.000318", "$40.48". Exact (no
 *  float). Below a dollar every significant digit stays — testnet settlements
 *  are often fractions of a cent, and rounding them to "$0.00" would say
 *  nothing; from a dollar up, cents (truncated, never rounded up). */
export function formatUsdc(base: string): string {
  const value = BigInt(base);
  const scale = BigInt(1_000_000);
  const whole = value / scale;
  const digits = (value % scale).toString().padStart(6, "0");
  const frac =
    whole > BigInt(0)
      ? digits.slice(0, 2)
      : digits.replace(/0+$/, "").padEnd(2, "0");
  return `$${whole.toLocaleString("en-US")}.${frac}`;
}

/** "0x12ab34…cd56". */
export function truncateHex(hex: string, lead = 6, tail = 4): string {
  if (hex.length <= lead + tail + 1) return hex;
  return `${hex.slice(0, lead)}…${hex.slice(-tail)}`;
}

/** Unix seconds relative to `now` (ms) → "just now", "4 min ago", "3 h ago",
 *  "2 d ago". */
export function timeAgo(timestamp: number, now: number): string {
  const minutes = Math.floor((now / 1000 - timestamp) / 60);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours} h ago`;
  return `${Math.floor(hours / 24)} d ago`;
}

const sum = (values: string[]) =>
  values.reduce((acc, v) => acc + BigInt(v), BigInt(0)).toString();

// --- view models ----------------------------------------------------------

/** How many recent settlements the hero terminal cycles through. */
export const TERMINAL_SESSIONS = 8;

export type TerminalSession = {
  key: string;
  tx: string;
  block: string;
  epoch: string;
  operator: string;
  /** The operator's registered region, lower-case, or null if unknown. */
  region: string | null;
  size: string;
  amount: string;
  timestamp: number;
};

/** The newest settlements, formatted for the hero terminal. */
export function terminalSessions(stats: Stats): TerminalSession[] {
  const regionOf = new Map<string, string>();
  for (const node of Object.values(stats.nodes)) {
    if (node.region !== UNKNOWN_REGION) {
      regionOf.set(node.operator.toLowerCase(), node.region.toLowerCase());
    }
  }
  return stats.settlements.slice(0, TERMINAL_SESSIONS).map((row) => ({
    key: `${row.txHash}:${row.logIndex}`,
    tx: truncateHex(row.txHash, 10, 4),
    block: row.blockNumber.toLocaleString("en-US"),
    epoch: String(row.epoch),
    operator: truncateHex(row.operator),
    region: regionOf.get(row.operator.toLowerCase()) ?? null,
    size: formatBytes(row.bytesDelivered),
    amount: formatUsdc(row.amount),
    timestamp: row.timestamp,
  }));
}

/** How many node rows the fleet panel lists. */
export const FLEET_ROWS = 8;
/** The fleet panel's aggregate window, in hourly buckets. */
export const FLEET_WINDOW_HOURS = 24;

export type FleetNode = {
  key: string;
  /** Lower-case alpha-2 code, or "n/a" for a node with no valid region. */
  region: string;
  operator: string;
  /** Unix seconds of the operator's newest settlement in the file's recent
   *  window, or null when it has none there. */
  lastSettled: number | null;
};

export type FleetView = {
  registered: number;
  nodes: FleetNode[];
  /** Nodes beyond FLEET_ROWS, folded into one count. */
  moreNodes: number;
  served24h: string;
  settled24h: string;
  /** Per-hour levels in [0, 1] for the two spark strips, oldest first. */
  servedSpark: number[];
  settledSpark: number[];
  caughtUp: boolean;
};

/** Whether a node's newest settlement falls inside the fleet window as of
 *  `now` (ms): its row pulses while this holds and greys out after. */
export function settledInWindow(
  lastSettled: number | null,
  now: number,
): boolean {
  return (
    lastSettled !== null &&
    now / 1000 - lastSettled < FLEET_WINDOW_HOURS * 60 * 60
  );
}

/** Each value as a fraction of the series max; all zeros stay zeros. */
function levels(values: string[]): number[] {
  const big = values.map((v) => BigInt(v));
  const max = big.reduce((a, b) => (b > a ? b : a), BigInt(0));
  if (max === BigInt(0)) return big.map(() => 0);
  return big.map((v) => Number((v * BigInt(1000)) / max) / 1000);
}

/** The registered nodes, most recently settled first, plus the last 24
 *  hours of bytes and USDC. */
export function fleetView(stats: Stats): FleetView {
  // `settlements` is newest first, so the first row seen per operator is its
  // newest. It holds only the indexer's recent window, so a node absent from
  // it has not settled recently — not necessarily never.
  const lastSettled = new Map<string, number>();
  for (const row of stats.settlements) {
    const operator = row.operator.toLowerCase();
    if (!lastSettled.has(operator)) lastSettled.set(operator, row.timestamp);
  }
  const all: FleetNode[] = Object.entries(stats.nodes)
    .map(([nodeId, node]) => ({
      key: nodeId,
      region:
        node.region === UNKNOWN_REGION ? "n/a" : node.region.toLowerCase(),
      operator: truncateHex(node.operator),
      lastSettled: lastSettled.get(node.operator.toLowerCase()) ?? null,
    }))
    .sort((a, b) => {
      if (a.lastSettled !== b.lastSettled) {
        return (b.lastSettled ?? -1) - (a.lastSettled ?? -1);
      }
      if (a.region !== b.region) {
        if (a.region === "n/a") return 1;
        if (b.region === "n/a") return -1;
        return a.region.localeCompare(b.region);
      }
      return a.operator.localeCompare(b.operator);
    });

  // Left-padded with empty hours, so the strips always span the full window
  // — a fresh index has fewer buckets than that.
  const window = stats.hourly.slice(-FLEET_WINDOW_HOURS);
  const pad = Array<string>(FLEET_WINDOW_HOURS - window.length).fill("0");
  const served = [...pad, ...window.map((p) => p.bytesServed)];
  const settled = [...pad, ...window.map((p) => p.valueSettled)];

  return {
    registered: Object.keys(stats.nodes).length,
    nodes: all.slice(0, FLEET_ROWS),
    moreNodes: Math.max(0, all.length - FLEET_ROWS),
    served24h: formatBytes(sum(served)),
    settled24h: formatUsdc(sum(settled)),
    servedSpark: levels(served),
    settledSpark: levels(settled),
    caughtUp: stats.caughtUp,
  };
}

// --- loading --------------------------------------------------------------

export type StatsResult =
  | { status: "loading" }
  /** `fetchedAt` (ms) is when the file arrived: the "now" relative times
   *  are measured from, so rendering stays pure. */
  | { status: "ok"; stats: Stats; fetchedAt: number }
  /** No usable file: a network or CORS failure, a timeout, a 404 before the
   *  first cron tick, or a schema this module doesn't read. */
  | { status: "error" };

const FETCH_TIMEOUT_MS = 15_000;

let pending: Promise<StatsResult> | null = null;

/**
 * Fetches and checks the stats file, once per page load. Both panels call
 * this; the shared promise means one request between them. Never rejects —
 * a failure resolves to `{ status: "error" }`, and a later call retries.
 */
export function loadStats(): Promise<StatsResult> {
  pending ??= (async (): Promise<StatsResult> => {
    try {
      const res = await fetch(STATS_URL, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`${STATS_URL}: ${res.status}`);
      const stats = asStats(await res.json());
      if (!stats) throw new Error(`${STATS_URL}: unexpected shape`);
      return { status: "ok", stats, fetchedAt: Date.now() };
    } catch (error) {
      console.warn(error);
      pending = null;
      return { status: "error" };
    }
  })();
  return pending;
}
