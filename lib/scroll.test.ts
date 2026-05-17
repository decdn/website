import { describe, expect, it } from "vitest";
import { homeHashSectionId } from "./scroll";

describe("homeHashSectionId", () => {
  it("returns the section id for a home-page hash href", () => {
    expect(homeHashSectionId("/#method")).toBe("method");
    expect(homeHashSectionId("/#intro")).toBe("intro");
    expect(homeHashSectionId("/#contact")).toBe("contact");
  });

  it("returns null when there is no target section", () => {
    expect(homeHashSectionId("/#")).toBeNull();
    expect(homeHashSectionId("/")).toBeNull();
  });

  it("returns null for a bare hash (resolves against current URL, not home)", () => {
    expect(homeHashSectionId("#method")).toBeNull();
  });

  it("returns null for cross-route navigation", () => {
    expect(homeHashSectionId("/blog/foo")).toBeNull();
    expect(homeHashSectionId("/blog/foo/#method")).toBeNull();
  });
});
