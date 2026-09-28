import { describe, expect, it } from "vitest";
import { HeroStatusLink } from "./HeroStatus";
import { HERO_STATUS } from "@/lib/copy";
import { STATUS_URL } from "@/lib/links";
import {
  FLEET_WINDOW_HOURS,
  fleetView,
  type Stats,
  type StatsResult,
} from "@/lib/stats";
import { attrs, findAll, findOne, textOf } from "@/test-utils/react-tree";

// HeroStatus itself calls useStats (useState), so the tree walker can't invoke
// it; HeroStatusLink is its render half.

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
      registeredNodes: 1,
    },
    {
      hour: "2026-09-27T12",
      valueSettled: "1000000",
      bytesServed: "2000000000",
      settlementCount: 1,
      registeredNodes: 1,
    },
  ],
  settlements: [],
  nodes: {},
};

const fetchedAt = 1_790_000_000_000;

const render = (result: StatsResult) => {
  const tree = HeroStatusLink({ result });
  const spans = findAll(tree, "span");
  const strip = spans.find((el) => attrs(el).className === "status-strip");
  const dot = spans.find((el) =>
    String(attrs(el).className).startsWith("status-live"),
  );
  if (!strip || !dot) throw new Error("strip or dot missing");
  const levels = findAll(strip, "span")
    .filter((el) => el !== strip)
    .map((el) => (attrs(el).style as Record<string, number>)["--level"]);
  return { tree, levels, dotClass: attrs(dot).className };
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
    "renders a flat strip and no live pulse while $status",
    (result) => {
      const { levels, dotClass } = render(result);
      expect(levels).toHaveLength(FLEET_WINDOW_HOURS);
      expect(levels.every((l) => l === 0)).toBe(true);
      expect(dotClass).toBe("status-live");
    },
  );

  it("renders the last 24h of settlement and pulses when current", () => {
    const { levels, dotClass } = render({ status: "ok", stats, fetchedAt });
    expect(levels).toEqual(fleetView(stats).settledSpark);
    expect(levels.at(-1)).toBe(1);
    expect(dotClass).toBe("status-live status-live-active");
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
