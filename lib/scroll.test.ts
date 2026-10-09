import { describe, expect, it, vi } from "vitest";
import {
  HOME_SECTION_ID,
  focusSection,
  homeNavTarget,
  parseScrollMarginTop,
  queueSectionFocus,
  shouldInterceptNavClick,
  takeSectionFocus,
} from "./scroll";

describe("homeNavTarget", () => {
  it("maps the home root and the intro anchor to the top (no fragment)", () => {
    expect(homeNavTarget("/")).toEqual({ type: "top" });
    expect(homeNavTarget("/#intro")).toEqual({ type: "top" });
  });

  it("locks the home section id to intro", () => {
    expect(HOME_SECTION_ID).toBe("intro");
    expect(homeNavTarget(`/#${HOME_SECTION_ID}`)).toEqual({ type: "top" });
  });

  it("matches the intro id exactly (case-sensitive, no normalization)", () => {
    // The id compare is exact; only the lowercase ids callers emit fold to
    // the top. "/#INTRO" stays a section (then misses getElementById).
    expect(homeNavTarget("/#INTRO")).toEqual({ type: "section", id: "INTRO" });
  });

  it("returns null for a query before the intro hash (not a clean /#…)", () => {
    // Symmetric with the "/?x=1#method" case: the query breaks the "/#"
    // prefix, so a query-bearing home href is not recognized as the top.
    expect(homeNavTarget("/?x=1#intro")).toBeNull();
  });

  it("maps a section hash href to a section target", () => {
    expect(homeNavTarget("/#method")).toEqual({
      type: "section",
      id: "method",
    });
    expect(homeNavTarget("/#contact")).toEqual({
      type: "section",
      id: "contact",
    });
  });

  it("returns null when there is no target section", () => {
    expect(homeNavTarget("/#")).toBeNull();
  });

  it("returns null for a bare hash (resolves against current URL, not home)", () => {
    expect(homeNavTarget("#method")).toBeNull();
    expect(homeNavTarget("#intro")).toBeNull();
  });

  it("returns null for cross-route navigation", () => {
    expect(homeNavTarget("/blog/foo")).toBeNull();
    expect(homeNavTarget("/blog/foo/#method")).toBeNull();
  });

  it("does not sanitize multi-hash or trailing-slash input (callers pass clean ids)", () => {
    expect(homeNavTarget("/#method#method")).toEqual({
      type: "section",
      id: "method#method",
    });
    expect(homeNavTarget("/#intro/")).toEqual({
      type: "section",
      id: "intro/",
    });
    expect(homeNavTarget("/?x=1#method")).toBeNull();
  });
});

describe("parseScrollMarginTop", () => {
  it("parses a normal resolved px value", () => {
    expect(parseScrollMarginTop("80px")).toBe(80);
    expect(parseScrollMarginTop("0px")).toBe(0);
    expect(parseScrollMarginTop("24.5px")).toBe(24.5);
  });

  it("falls back to 0 for an empty computed value (the #124 bug case)", () => {
    expect(parseScrollMarginTop("")).toBe(0);
  });

  it("falls back to 0 for a non-numeric computed value", () => {
    expect(parseScrollMarginTop("auto")).toBe(0);
  });

  it("tolerates leading whitespace (parseFloat semantics)", () => {
    expect(parseScrollMarginTop("  16px ")).toBe(16);
  });

  it("guards finiteness only, not sign (a negative value passes through)", () => {
    // scroll-margin-top is subtracted into live scroll math, so the
    // helper deliberately clamps NaN — not the sign — to 0.
    expect(parseScrollMarginTop("-8px")).toBe(-8);
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

describe("focusSection", () => {
  const fakeEl = (tabIndex: number) => ({
    tabIndex,
    setAttribute: vi.fn(),
    focus: vi.fn(),
  });

  it("makes a non-focusable section programmatically focusable", () => {
    const el = fakeEl(-1);
    focusSection(el);
    expect(el.setAttribute).toHaveBeenCalledWith("tabindex", "-1");
  });

  it("leaves an already-focusable element in the tab order", () => {
    const el = fakeEl(0);
    focusSection(el);
    expect(el.setAttribute).not.toHaveBeenCalled();
  });

  it("focuses without scrolling, so it can't race the nav's scroll", () => {
    for (const el of [fakeEl(-1), fakeEl(0)]) {
      focusSection(el);
      expect(el.focus).toHaveBeenCalledWith({ preventScroll: true });
    }
  });
});

describe("queueSectionFocus / takeSectionFocus", () => {
  it("returns nothing when no section is queued", () => {
    expect(takeSectionFocus("#method")).toBeNull();
  });

  it("returns the queued id when the URL landed on its hash", () => {
    queueSectionFocus("method");
    expect(takeSectionFocus("#method")).toBe("method");
  });

  it("is single-use", () => {
    queueSectionFocus("method");
    takeSectionFocus("#method");
    expect(takeSectionFocus("#method")).toBeNull();
  });

  it("ignores a stale id on an arrival with a different hash", () => {
    // e.g. an aborted section nav followed by a home nav (no hash).
    queueSectionFocus("method");
    expect(takeSectionFocus("")).toBeNull();
    queueSectionFocus("method");
    expect(takeSectionFocus("#faq")).toBeNull();
  });

  it("clears the queue even when the hash doesn't match", () => {
    queueSectionFocus("method");
    takeSectionFocus("");
    expect(takeSectionFocus("#method")).toBeNull();
  });
});
