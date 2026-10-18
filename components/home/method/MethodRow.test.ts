import { describe, expect, it } from "vitest";
import { MethodRow } from "./MethodRow";
import { asElement, childElements, textOf } from "@/test-utils/react-tree";

const STEP = {
  n: "01",
  word: "probe",
  body: "in a single handshake, the client asks nearby peers who has the file.",
};

describe("MethodRow", () => {
  // Before this the homepage had no h3 at all: probe/swarm/settle were divs,
  // so the outline a crawler built stopped at h1 plus four h2 — two of them
  // sr-only.
  it("names the step in an h3", () => {
    const row = asElement(MethodRow(STEP));
    expect(childElements(row).map((c) => c.type)).toEqual(["div", "h3", "p"]);
    const [, heading] = childElements(row);
    expect(textOf(heading)).toBe("probe");
  });

  it("keeps the ordinal and the body alongside it", () => {
    const [ordinal, , body] = childElements(MethodRow(STEP));
    expect(textOf(ordinal)).toBe("01");
    expect(textOf(body)).toBe(STEP.body);
  });
});
