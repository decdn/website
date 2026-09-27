import { describe, expect, it } from "vitest";
import { FleetPanel } from "./FleetStatus";
import { PANEL_CAPTIONS } from "@/lib/copy";
import type { Stats, StatsResult } from "@/lib/stats";
import { attrs, findAll, findOne, textOf } from "@/test-utils/react-tree";

// Both panels delegate the <figure>/<figcaption> structure to
// components/ui/PanelFigure, whose own test asserts that the caption sits
// outside the aria-hidden subtree. What is left to check here is that the
// fleet panel composes it with the right caption, and renders each state.
//
// FleetStatus itself calls useStats (useState), so the tree walker can't
// invoke it; FleetPanel is its render half. HeroTerminal is all client state —
// scripts/check-out.mjs greps the built HTML for both captions, which is the
// only check that sees HeroTerminal render.

const stats: Stats = {
  chainId: 421614,
  updatedAt: "2026-09-27T12:00:00.000Z",
  lastBlock: 100,
  caughtUp: true,
  totals: {
    valueSettled: "1500000",
    bytesServed: "3000000000",
    settlementCount: 2,
  },
  hourly: [
    {
      hour: "2026-09-27T11",
      valueSettled: "500000",
      bytesServed: "1000000000",
      settlementCount: 1,
      registeredNodes: 3,
    },
    {
      hour: "2026-09-27T12",
      valueSettled: "1000000",
      bytesServed: "2000000000",
      settlementCount: 1,
      registeredNodes: 3,
    },
  ],
  settlements: [
    {
      txHash: "0xabc",
      logIndex: 0,
      blockNumber: 100,
      timestamp: 1_790_000_000 - 4 * 60,
      operator: "0x00000000000000000000000000000000000000a1",
      bytesDelivered: "1000000000",
      amount: "500000",
      epoch: 7,
    },
  ],
  nodes: {
    "0x01": {
      operator: "0x00000000000000000000000000000000000000a1",
      region: "DE",
    },
    "0x02": {
      operator: "0x00000000000000000000000000000000000000a2",
      region: "DE",
    },
    "0x03": {
      operator: "0x00000000000000000000000000000000000000a3",
      region: "unknown",
    },
  },
};

const fetchedAt = 1_790_000_000_000;

const panel = (result: StatsResult) => {
  const tree = FleetPanel({ result, className: "block w-full" });
  const [hidden] = findAll(tree, "div").filter(
    (el) => attrs(el)["aria-hidden"] === true,
  );
  return { tree, text: textOf(hidden) };
};

describe("FleetPanel", () => {
  it("renders through PanelFigure", () => {
    const { tree } = panel({ status: "loading" });
    const figure = findOne(tree, "figure");
    expect(attrs(figure).className).toBe("block w-full");
    const panels = findAll(tree, "div").filter(
      (el) => attrs(el)["aria-hidden"] === true,
    );
    expect(panels).toHaveLength(1);
    expect(attrs(panels[0]).className).toBe("fleet");
  });

  it("captions the panel with the fleet caption", () => {
    const { tree } = panel({ status: "loading" });
    expect(textOf(findOne(tree, "figcaption"))).toBe(PANEL_CAPTIONS.fleet);
  });

  // The static HTML is this state: it must carry no figures at all.
  it("renders no figures while loading", () => {
    const { text } = panel({ status: "loading" });
    expect(text).toContain("loading");
    expect(text.replaceAll("24h", "")).not.toMatch(/\d/);
  });

  it("says so when the stats file is unavailable", () => {
    expect(panel({ status: "error" }).text).toContain("stats unavailable");
  });

  it("renders one row per registered node and the 24h aggregates", () => {
    const { text } = panel({ status: "ok", stats, fetchedAt });
    expect(text).toContain("3nodes registered");
    expect(text).toContain("de0x0000…00a1 · settled 4 min ago");
    expect(text).toContain("de0x0000…00a2 · idle");
    expect(text).toContain("n/a0x0000…00a3 · idle");
    expect(text).toContain("$1.50");
    expect(text).not.toContain("catching up");
  });

  it("flags a backfilling index", () => {
    const { text } = panel({
      status: "ok",
      stats: { ...stats, caughtUp: false },
      fetchedAt,
    });
    expect(text).toContain("catching up");
  });
});
