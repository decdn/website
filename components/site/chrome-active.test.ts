import { describe, expect, it } from "vitest";
import { resolveActiveSection } from "./chrome-active";

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
