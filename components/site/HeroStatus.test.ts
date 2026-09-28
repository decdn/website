import { describe, expect, it } from "vitest";
import { HeroStatusLink } from "./HeroStatus";
import { HERO_STATUS } from "@/lib/copy";
import { STATUS_URL } from "@/lib/links";
import type { Stats, StatsResult } from "@/lib/stats";
import { attrs, findAll, findOne, textOf } from "@/test-utils/react-tree";

// HeroStatus itself calls useStats (useState), so the tree walker can't invoke
// it; HeroStatusLink is its render half.

const stats: Stats = {
  chainId: 421614,
  updatedAt: "2026-09-27T12:00:00.000Z",
  lastBlock: 100,
  caughtUp: true,
  totals: { valueSettled: "0", bytesServed: "0", settlementCount: 0 },
  hourly: [],
  settlements: [],
  nodes: {},
};

const fetchedAt = 1_790_000_000_000;

const render = (result: StatsResult) => {
  const tree = HeroStatusLink({ result });
  const dot = findAll(tree, "span").find((el) =>
    String(attrs(el).className).startsWith("status-live"),
  );
  if (!dot) throw new Error("live dot missing");
  return { tree, dotClass: attrs(dot).className };
};

describe("HeroStatusLink", () => {
  it("links to the status site in a new tab", () => {
    const a = findOne(render({ status: "loading" }).tree, "a");
    expect(attrs(a).href).toBe(STATUS_URL);
    expect(attrs(a).target).toBe("_blank");
    expect(attrs(a).rel).toBe("noopener noreferrer");
    expect(textOf(a)).toContain(HERO_STATUS.value);
  });

  it.each([{ status: "loading" }, { status: "error" }] as const)(
    "does not pulse while $status",
    (result) => {
      expect(render(result).dotClass).toBe("status-live");
    },
  );

  it("pulses when the stats are current", () => {
    expect(render({ status: "ok", stats, fetchedAt }).dotClass).toBe(
      "status-live status-live-active",
    );
  });

  it("does not claim live while the index is catching up", () => {
    const { dotClass } = render({
      status: "ok",
      stats: { ...stats, caughtUp: false },
      fetchedAt,
    });
    expect(dotClass).toBe("status-live");
  });
});
