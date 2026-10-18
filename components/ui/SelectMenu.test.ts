import { describe, expect, it } from "vitest";
import { SelectMenuPanel, optionId } from "./SelectMenu";
import type { ListboxGroup } from "./listbox-state";
import {
  asElement,
  attrs,
  findAll,
  findSome,
  textOf,
} from "@/test-utils/react-tree";

// SelectMenu itself runs hooks, so the tree walker can't call it;
// SelectMenuPanel is its render half. The keyboard, type-ahead and placement
// behind it are covered in listbox-state.test.ts.

const groups: ListboxGroup[] = [
  {
    id: "model",
    label: "model",
    options: [
      { value: "a", label: "Alpha" },
      { value: "b", label: "Bravo" },
    ],
  },
  {
    id: "iso",
    label: "iso",
    options: [{ value: "c", label: "Charlie" }],
  },
];

const panel = (
  overrides: Partial<Parameters<typeof SelectMenuPanel>[0]> = {},
) =>
  asElement(
    SelectMenuPanel({
      id: "list",
      labelledBy: "caption",
      groups,
      value: "b",
      open: true,
      active: 2,
      ...overrides,
    }),
  );

const byRole = (role: string) =>
  findSome(panel(), "div").filter((el) => attrs(el).role === role);

describe("SelectMenuPanel", () => {
  it("is a listbox named by the caller's label", () => {
    const list = panel();
    expect(attrs(list).role).toBe("listbox");
    expect(attrs(list).id).toBe("list");
    expect(attrs(list)["aria-labelledby"]).toBe("caption");
  });

  it("stays mounted but hidden while closed", () => {
    expect(attrs(panel({ open: false })).hidden).toBe(true);
    expect(attrs(panel()).hidden).toBe(false);
  });

  it("wraps each group in role=group labelled by its heading", () => {
    const list = panel();
    const groupsEls = byRole("group");
    expect(groupsEls).toHaveLength(2);
    for (const group of groupsEls) {
      const headingId = attrs(group)["aria-labelledby"];
      const heading = findAll(list, "div").find(
        (el) => attrs(el).id === headingId,
      );
      expect(heading, `heading #${String(headingId)}`).toBeDefined();
      // Headings are not options, so neither the keyboard nor a click
      // can select one.
      expect(attrs(heading!).role).not.toBe("option");
    }
    expect(groupsEls.map(textOf)).toEqual(["modelAlphaBravo", "isoCharlie"]);
  });

  it("drops headings when there is only one group", () => {
    const single = panel({ groups: [groups[0]], value: "a", active: 0 });
    expect(
      findAll(single, "div").some((el) => attrs(el).role === "group"),
    ).toBe(false);
    expect(textOf(single)).toBe("AlphaBravo");
  });

  it("numbers options across groups, matching flatOptions order", () => {
    const opts = byRole("option");
    expect(opts.map((el) => attrs(el).id)).toEqual(
      [0, 1, 2].map((i) => optionId("list", i)),
    );
  });

  it("marks only the current value aria-selected, with the only check", () => {
    const opts = byRole("option");
    expect(opts.map((el) => attrs(el)["aria-selected"])).toEqual([
      false,
      true,
      false,
    ]);
    expect(opts.map((el) => findAll(el, "svg").length)).toEqual([0, 1, 0]);
  });

  it("highlights the active option, not the selected one", () => {
    const opts = byRole("option");
    const lit = (el: (typeof opts)[number]) =>
      String(attrs(el).className).includes("bg-whisper-text");
    expect(opts.map(lit)).toEqual([false, false, true]);
  });

  it("hands hover and click back by option index", () => {
    const hovered: number[] = [];
    const picked: number[] = [];
    const opts = findSome(
      panel({ onHover: (i) => hovered.push(i), onPick: (i) => picked.push(i) }),
      "div",
    ).filter((el) => attrs(el).role === "option");
    (attrs(opts[2]).onMouseMove as () => void)();
    (attrs(opts[0]).onClick as () => void)();
    expect(hovered).toEqual([2]);
    expect(picked).toEqual([0]);
  });

  // The list never locks the page: it is positioned against the trigger's
  // wrapper, not the viewport, so the page scrolls under it as usual and
  // the list travels with its trigger.
  it("is absolutely positioned against the trigger, never fixed", () => {
    const classes = String(attrs(panel()).className).split(/\s+/);
    expect(classes).toContain("absolute");
    expect(classes).not.toContain("fixed");
    expect(classes).not.toContain("overflow-hidden");
    expect(attrs(panel()).style).toBeUndefined();
  });
});
