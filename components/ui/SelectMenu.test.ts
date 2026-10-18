import { describe, expect, it } from "vitest";
import { NativeSelect, SelectMenuPanel, optionId } from "./SelectMenu";
import type { ListboxGroup } from "./listbox-state";
import {
  asElement,
  attrs,
  findAll,
  findOne,
  findSome,
  textOf,
} from "@/test-utils/react-tree";

// SelectMenu itself runs hooks, so the tree walker can't call it.
// SelectMenuPanel is the custom list's render half and NativeSelect the
// touch fallback; the keyboard, pointer, type-ahead and placement logic
// behind them is covered in listbox-state.test.ts.

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

  // APG select-only combobox: aria-selected follows the highlight (the
  // option aria-activedescendant points at); the check mark shows the value.
  it("puts aria-selected on the highlighted option only", () => {
    const opts = byRole("option");
    expect(opts.map((el) => attrs(el)["aria-selected"])).toEqual([
      false,
      false,
      true,
    ]);
  });

  it("marks the current value with the only check and data-current", () => {
    const opts = byRole("option");
    expect(opts.map((el) => findAll(el, "svg").length)).toEqual([0, 1, 0]);
    expect(opts.map((el) => attrs(el)["data-current"])).toEqual([
      undefined,
      true,
      undefined,
    ]);
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
  });
});

describe("NativeSelect", () => {
  const changes: string[] = [];
  const native = (g: ListboxGroup[] = groups) =>
    asElement(
      NativeSelect({
        groups: g,
        value: "b",
        onChange: (v) => changes.push(v),
        labelledBy: "caption",
        children: "Bravo",
      }),
    );

  // The <label> that used to wrap the select is gone, so this is now its
  // only accessible name.
  it("is named by the caller's label", () => {
    expect(attrs(findOne(native(), "select"))["aria-labelledby"]).toBe(
      "caption",
    );
  });

  it("shows the face to sight only; the select carries the value", () => {
    const face = findAll(native(), "span").find(
      (el) => attrs(el)["aria-hidden"],
    );
    expect(face && textOf(face)).toBe("Bravo");
    expect(attrs(findOne(native(), "select")).value).toBe("b");
  });

  it("has one optgroup per group, labelled, with its options", () => {
    const optgroups = findAll(native(), "optgroup");
    expect(optgroups.map((g) => attrs(g).label)).toEqual(["model", "iso"]);
    expect(optgroups.map((g) => findAll(g, "option").length)).toEqual([2, 1]);
  });

  it("drops optgroups when there is only one group", () => {
    const single = native([groups[0]]);
    expect(findAll(single, "optgroup")).toHaveLength(0);
    expect(findAll(single, "option").map((o) => attrs(o).value)).toEqual([
      "a",
      "b",
    ]);
  });

  it("passes the chosen value to onChange", () => {
    const onChange = attrs(findOne(native(), "select")).onChange as (e: {
      target: { value: string };
    }) => void;
    onChange({ target: { value: "c" } });
    expect(changes).toEqual(["c"]);
  });
});
