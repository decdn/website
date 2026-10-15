import { describe, expect, it, vi } from "vitest";
import { links } from "@/lib/links";
import { attrs, findSome } from "@/test-utils/react-tree";
import { Contact } from "./Contact";

// FleetStatus is a client component that calls useStats, which can't run
// outside a renderer; the links under test don't depend on it.
vi.mock("@/components/site/FleetStatus", () => ({ FleetStatus: () => null }));

const anchors = () => findSome(Contact(), "a").map(attrs);
const pills = () => anchors().filter((a) => a.className === "social-pill");

describe("Contact links", () => {
  it("keeps the email as the first, underlined link", () => {
    const [email] = anchors();
    expect(email.href).toBe(links.contact);
    expect(email.className).toContain("underline-brutal");
  });

  it("lists the social pills as GitHub, Discord, LinkedIn, X", () => {
    expect(pills().map((p) => p.href)).toEqual([
      links.github,
      links.discord,
      links.linkedin,
      links.x,
    ]);
  });

  it.each([
    ["GitHub", 0],
    ["Discord", 1],
    ["LinkedIn", 2],
    ["X", 3],
  ] as const)(
    "%s opens in a new tab and is named for screen readers",
    (name, i) => {
      const pill = pills()[i];
      expect(pill.target).toBe("_blank");
      expect(pill.rel).toBe("noopener noreferrer");
      expect(pill["aria-label"]).toContain(name);
    },
  );
});
