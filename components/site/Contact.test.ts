import { describe, expect, it, vi } from "vitest";
import { CONTACT_SOCIALS } from "@/lib/copy";
import { links } from "@/lib/links";
import { attrs, findSome, textOf } from "@/test-utils/react-tree";
import { Contact } from "./Contact";

// findSome expands function components, so without this FleetStatus would
// call useStats (and its useState) outside a renderer and throw; the links
// under test don't depend on it.
vi.mock("@/components/site/FleetStatus", () => ({ FleetStatus: () => null }));

const anchors = () => findSome(Contact(), "a");
const pills = () =>
  anchors().filter((a) => attrs(a).className === "social-pill");

describe("Contact links", () => {
  it("keeps the email as the first, underlined link", () => {
    const email = attrs(anchors()[0]);
    expect(email.href).toBe(links.contact);
    expect(email.className).toContain("underline-brutal");
  });

  it("lists the social pills as GitHub, Discord, LinkedIn, X", () => {
    expect(pills().map((p) => attrs(p).href)).toEqual([
      links.github,
      links.discord,
      links.linkedin,
      links.x,
    ]);
  });

  it.each(CONTACT_SOCIALS.map((s, i) => [s.name, i] as const))(
    "%s opens in a new tab and its accessible name contains its visible label",
    (name, i) => {
      const pill = pills()[i];
      const label = textOf(pill);
      expect(label).toBe(name);
      expect(attrs(pill).target).toBe("_blank");
      expect(attrs(pill).rel).toBe("noopener noreferrer");
      expect(attrs(pill)["aria-label"]).toBe(`decdn on ${name}`);
      expect(attrs(pill)["aria-label"]).toContain(label);
    },
  );
});
