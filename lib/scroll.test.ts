import { describe, expect, it } from "vitest";
import { homeHashSectionId, shouldInterceptNavClick } from "./scroll";

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

  it("does not sanitize multi-hash or trailing-slash input (callers pass clean ids)", () => {
    expect(homeHashSectionId("/#method#method")).toBe("method#method");
    expect(homeHashSectionId("/#intro/")).toBe("intro/");
    expect(homeHashSectionId("/?x=1#method")).toBeNull();
  });
});

describe("shouldInterceptNavClick", () => {
  const plainLeftClick = {
    defaultPrevented: false,
    button: 0,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
  };

  it("intercepts a plain left-click", () => {
    expect(shouldInterceptNavClick(plainLeftClick)).toBe(true);
  });

  it("does not intercept an already-prevented click", () => {
    expect(
      shouldInterceptNavClick({ ...plainLeftClick, defaultPrevented: true }),
    ).toBe(false);
  });

  it("does not intercept a non-primary button (e.g. middle-click)", () => {
    expect(shouldInterceptNavClick({ ...plainLeftClick, button: 1 })).toBe(
      false,
    );
  });

  it("does not intercept a modified click (new tab / new window)", () => {
    expect(shouldInterceptNavClick({ ...plainLeftClick, metaKey: true })).toBe(
      false,
    );
    expect(shouldInterceptNavClick({ ...plainLeftClick, ctrlKey: true })).toBe(
      false,
    );
    expect(shouldInterceptNavClick({ ...plainLeftClick, shiftKey: true })).toBe(
      false,
    );
    expect(shouldInterceptNavClick({ ...plainLeftClick, altKey: true })).toBe(
      false,
    );
  });
});
