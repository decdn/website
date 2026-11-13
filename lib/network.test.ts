import { describe, expect, it } from "vitest";
import {
  CLIENT_TILES,
  DATA_TILES,
  GOVERNANCE_RAIL,
  NETWORK_TILES,
  PAYMENT_RAIL,
  TOPIC_IDS,
  TOPICS,
  TOUR_IDS,
  TOUR_STEP_MAX,
  TOURS,
  isTopicId,
} from "./network";

const tiles = [
  ...Object.values(CLIENT_TILES),
  ...NETWORK_TILES,
  ...DATA_TILES,
  ...GOVERNANCE_RAIL.tiles,
  ...PAYMENT_RAIL.tiles,
];

describe("network explainer data", () => {
  it("has a topic for every id", () => {
    expect(Object.keys(TOPICS).sort()).toEqual([...TOPIC_IDS].sort());
  });

  it("links every related topic to a real one, never to itself", () => {
    for (const [id, topic] of Object.entries(TOPICS)) {
      for (const r of topic.related) {
        expect(isTopicId(r), `${id} → ${r}`).toBe(true);
        expect(r, `${id} relates to itself`).not.toBe(id);
      }
    }
  });

  it("opens a real topic from every tile", () => {
    for (const t of tiles) expect(isTopicId(t.topic), t.label).toBe(true);
  });

  it("lights only topics that have a box on the map", () => {
    const onMap = new Set<string>(tiles.map((t) => t.topic));
    for (const id of TOUR_IDS) {
      for (const step of TOURS[id].steps) {
        for (const topic of step.topics) {
          expect(onMap.has(topic), `${id}: ${topic}`).toBe(true);
        }
      }
    }
  });

  it("keeps every walkthrough step to one line", () => {
    for (const id of TOUR_IDS) {
      for (const step of TOURS[id].steps) {
        expect(step.text.length, step.text).toBeLessThanOrEqual(TOUR_STEP_MAX);
      }
    }
  });

  it("names no specific chain", () => {
    const all = JSON.stringify({
      TOPICS,
      TOURS,
      GOVERNANCE_RAIL,
      PAYMENT_RAIL,
    });
    expect(all).not.toMatch(/arbitrum/i);
  });
});
