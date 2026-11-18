import { describe, expect, it } from "vitest";
import {
  bandUnderNav,
  opensOnDarkBand,
  resolveActiveSection,
  resolveOverDarkBand,
} from "./chrome-active";

describe("resolveActiveSection", () => {
  it.each([
    {
      name: "off-home + scrolled falls back",
      pathname: "/blog/foo/",
      scrolled: true,
      observed: "compare",
      expected: "intro",
    },
    {
      name: "home but not yet scrolled falls back (back-nav flash guard)",
      pathname: "/",
      scrolled: false,
      observed: "compare",
      expected: "intro",
    },
    {
      name: "home + scrolled returns the observed dark section",
      pathname: "/",
      scrolled: true,
      observed: "compare",
      expected: "compare",
    },
    {
      name: "home + scrolled passes other DARK_SECTIONS members through",
      pathname: "/",
      scrolled: true,
      observed: "faq",
      expected: "faq",
    },
    {
      name: "off-home dominates regardless of scrolled state",
      pathname: "/blog/",
      scrolled: false,
      observed: "faq",
      expected: "intro",
    },
    {
      name: "home with query string falls back (exact match)",
      pathname: "/?utm=x",
      scrolled: true,
      observed: "compare",
      expected: "intro",
    },
  ] as const)("$name", ({ pathname, scrolled, observed, expected }) => {
    expect(resolveActiveSection(pathname, scrolled, observed, "intro")).toBe(
      expected,
    );
  });
});

describe("opensOnDarkBand", () => {
  it.each([
    ["/blog/", true],
    ["/blog", true],
    ["/blog/testnet-is-live/", true],
    ["/", false],
    ["/network/", false],
    ["/legal/privacy/", false],
    ["/blogroll/", false],
  ])("%s → %s", (pathname, expected) => {
    expect(opensOnDarkBand(pathname)).toBe(expected);
  });
});

describe("resolveOverDarkBand", () => {
  it("uses the route default before the observer reports", () => {
    expect(resolveOverDarkBand("/blog/", null)).toBe(true);
    expect(resolveOverDarkBand("/", null)).toBe(false);
  });

  it("uses the observer's reading for the current route", () => {
    const reading = { pathname: "/blog/a/", dark: false };
    expect(resolveOverDarkBand("/blog/a/", reading)).toBe(false);
  });

  it("ignores a reading left over from another route", () => {
    expect(
      resolveOverDarkBand("/blog/b/", { pathname: "/blog/a/", dark: false }),
    ).toBe(true);
    expect(resolveOverDarkBand("/", { pathname: "/blog/", dark: true })).toBe(
      false,
    );
  });
});

describe("bandUnderNav", () => {
  it("is dark while the band covers the slice", () => {
    expect(bandUnderNav(600, 72)).toBe(true);
  });

  it("stays dark when overscroll pulls the band below the slice", () => {
    // Band top at 150 (> slice), bottom far below.
    expect(bandUnderNav(750, 72)).toBe(true);
  });

  it("is light once the band has scrolled past the slice", () => {
    expect(bandUnderNav(40, 72)).toBe(false);
    expect(bandUnderNav(72, 72)).toBe(false);
  });
});
