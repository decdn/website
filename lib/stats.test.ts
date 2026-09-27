import { afterEach, describe, expect, it, vi } from "vitest";
import {
  asStats,
  FLEET_ROWS,
  fleetView,
  formatBytes,
  formatUsdc,
  loadStats,
  type Stats,
  STATS_URL,
  TERMINAL_SESSIONS,
  terminalSessions,
  timeAgo,
  truncateHex,
} from "./stats";

const settlement = (i: number) => ({
  txHash: `0x${String(i).padStart(64, "a")}` as const,
  logIndex: 0,
  blockNumber: 212_345_678 + i,
  timestamp: 1_790_000_000 - i * 60,
  operator: "0x00000000000000000000000000000000000000a1" as const,
  bytesDelivered: "13400000000",
  amount: "130900",
  epoch: 42,
});

const base: Stats = {
  chainId: 421614,
  updatedAt: "2026-09-27T12:00:00.000Z",
  lastBlock: 212_345_700,
  caughtUp: true,
  totals: { valueSettled: "0", bytesServed: "0", settlementCount: 0 },
  hourly: [],
  settlements: [],
  nodes: {},
};

describe("STATS_URL", () => {
  it("names the Arbitrum Sepolia file on the public bucket", () => {
    expect(STATS_URL).toBe("https://data.decdn.org/stats-421614.json");
  });
});

describe("asStats", () => {
  it("accepts the indexer's shape, extra fields and all", () => {
    const file = { ...base, feeRouter: "0x1", daily: [], poolOwners: {} };
    expect(asStats(file)).toBe(file);
  });

  it("accepts a file with settlements", () => {
    expect(asStats({ ...base, settlements: [settlement(0)] })).not.toBeNull();
  });

  it.each([
    ["null", null],
    ["an array", []],
    ["another chain", { ...base, chainId: 1 }],
    ["an unparseable updatedAt", { ...base, updatedAt: "soon" }],
    [
      "a float total",
      { ...base, totals: { ...base.totals, bytesServed: "1.5" } },
    ],
    ["no nodes", { ...base, nodes: undefined }],
    [
      "a malformed settlement",
      { ...base, settlements: [{ ...settlement(0), amount: 5 }] },
    ],
    [
      "a settlement without a logIndex",
      { ...base, settlements: [{ ...settlement(0), logIndex: undefined }] },
    ],
  ])("rejects %s", (_name, value) => {
    expect(asStats(value)).toBeNull();
  });
});

describe("formatBytes", () => {
  it.each([
    ["0", "0 B"],
    ["999", "999 B"],
    ["550000000", "550.0 MB"],
    ["13400000000", "13.4 GB"],
    ["2000000000000000000", "2000.0 PB"],
  ])("%s → %s", (bytes, text) => {
    expect(formatBytes(bytes)).toBe(text);
  });
});

describe("formatUsdc", () => {
  it.each([
    ["0", "$0.00"],
    ["130900", "$0.1309"],
    ["318", "$0.000318"],
    ["12500000", "$12.50"],
    ["40485136", "$40.48"],
    ["1234567000000", "$1,234,567.00"],
  ])("%s → %s", (base, text) => {
    expect(formatUsdc(base)).toBe(text);
  });
});

describe("truncateHex", () => {
  it("keeps the head and tail", () => {
    expect(truncateHex("0x0123456789abcdef")).toBe("0x0123…cdef");
  });

  it("leaves short values alone", () => {
    expect(truncateHex("0x1234")).toBe("0x1234");
  });
});

describe("timeAgo", () => {
  const now = 1_790_000_000_000;
  it.each([
    [1_790_000_000 - 30, "just now"],
    [1_790_000_000 - 4 * 60, "4 min ago"],
    [1_790_000_000 - 3 * 3600, "3 h ago"],
    [1_790_000_000 - 3 * 86_400, "3 d ago"],
  ])("%i → %s", (timestamp, text) => {
    expect(timeAgo(timestamp, now)).toBe(text);
  });
});

describe("terminalSessions", () => {
  const stats: Stats = {
    ...base,
    settlements: Array.from({ length: 20 }, (_, i) => settlement(i)),
    nodes: {
      "0x01": {
        operator: "0x00000000000000000000000000000000000000A1",
        region: "DE",
      },
    },
  };

  it("takes the newest settlements, newest first", () => {
    const sessions = terminalSessions(stats);
    expect(sessions).toHaveLength(TERMINAL_SESSIONS);
    expect(sessions[0].block).toBe("212,345,678");
  });

  it("formats one settlement for the terminal", () => {
    const [s] = terminalSessions(stats);
    expect(s).toMatchObject({
      epoch: "42",
      operator: "0x0000…00a1",
      region: "de",
      size: "13.4 GB",
      amount: "$0.1309",
    });
    expect(s.tx).toMatch(/^0xaaaaaaaa…aaa0$/);
  });

  it("leaves the region out for an operator with no registered node", () => {
    const [s] = terminalSessions({ ...stats, nodes: {} });
    expect(s.region).toBeNull();
  });
});

describe("fleetView", () => {
  it("lists registered nodes, most recently settled first", () => {
    const op = (n: number) =>
      `0x${String(n).padStart(40, "0")}` as `0x${string}`;
    const view = fleetView({
      ...base,
      settlements: [
        { ...settlement(0), operator: op(2), timestamp: 300 },
        { ...settlement(1), operator: op(3), timestamp: 200 },
        // An older row for the same operator doesn't move its last settlement.
        { ...settlement(2), operator: op(2), timestamp: 100 },
      ],
      nodes: {
        "0x01": { operator: op(1), region: "unknown" },
        "0x02": { operator: op(2), region: "US" },
        "0x03": { operator: op(3), region: "DE" },
        "0x04": { operator: op(4), region: "SG" },
      },
    });
    expect(view.registered).toBe(4);
    expect(
      view.nodes.map((n) => [n.region, n.operator, n.lastSettled]),
    ).toEqual([
      ["us", "0x0000…0002", 300],
      ["de", "0x0000…0003", 200],
      ["sg", "0x0000…0004", null],
      ["n/a", "0x0000…0001", null],
    ]);
  });

  it("folds nodes past the row limit into a count", () => {
    const nodes = Object.fromEntries(
      Array.from({ length: FLEET_ROWS + 3 }, (_, i) => [
        `0x${i}`,
        { operator: `0xa${i}`, region: "DE" },
      ]),
    ) as Stats["nodes"];
    const view = fleetView({ ...base, nodes });
    expect(view.nodes).toHaveLength(FLEET_ROWS);
    expect(view.moreNodes).toBe(3);
  });

  it("sums the last 24 hourly buckets and scales the sparks", () => {
    const hourly = Array.from({ length: 25 }, (_, i) => ({
      hour: `h${i}`,
      // The oldest bucket is outside the window and must not count.
      valueSettled: i === 0 ? "999000000" : i === 24 ? "2000000" : "0",
      bytesServed: i === 24 ? "4000" : i === 23 ? "1000" : "0",
      settlementCount: 0,
      registeredNodes: 0,
    }));
    const view = fleetView({ ...base, hourly });
    expect(view.settled24h).toBe("$2.00");
    expect(view.served24h).toBe("5.0 KB");
    expect(view.servedSpark).toHaveLength(24);
    expect(view.servedSpark.at(-1)).toBe(1);
    expect(view.servedSpark.at(-2)).toBe(0.25);
  });

  it("keeps an idle window flat", () => {
    const view = fleetView(base);
    expect(view.servedSpark).toEqual(Array(24).fill(0));
    expect(view.served24h).toBe("0 B");
    expect(view.settled24h).toBe("$0.00");
  });
});

describe("loadStats", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("resolves an error result, and retries on the next call", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response("nope", { status: 404 }))
      .mockResolvedValueOnce(Response.json(base));
    vi.stubGlobal("fetch", fetch);

    expect(await loadStats()).toEqual({ status: "error" });
    const loaded = await loadStats();
    expect(loaded).toMatchObject({ status: "ok", stats: base });
    // Once loaded, the result is shared: no third request.
    expect(await loadStats()).toBe(loaded);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[0][0]).toBe(STATS_URL);
  });
});
