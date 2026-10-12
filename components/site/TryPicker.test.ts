import { describe, expect, it } from "vitest";
import { TryPicker } from "./TryPicker";
import { ITEMS, KINDS, formatSize } from "@/lib/models";
import { attrs, findAll, findSome, textOf } from "@/test-utils/react-tree";

// TryIt holds the selection and typing state, so the tree walker can't invoke
// it; TryPicker is its render half.

const noop = () => {};
const second = ITEMS[1];

describe("TryPicker", () => {
  it("offers every seeded item as one radio in a single group", () => {
    const radios = findSome(
      TryPicker({ selectedId: "", onSelect: noop }),
      "input",
    );
    expect(radios.map((r) => attrs(r).value)).toEqual(
      expect.arrayContaining(ITEMS.map((i) => i.id)),
    );
    expect(radios).toHaveLength(ITEMS.length);
    for (const radio of radios) {
      expect(attrs(radio).type).toBe("radio");
      expect(attrs(radio).name).toBe("try-item");
    }
  });

  it("groups the boxes by kind, in KINDS order, leaving empty kinds out", () => {
    const tree = TryPicker({ selectedId: "", onSelect: noop });
    const present = KINDS.filter((k) => ITEMS.some((i) => i.kind === k.id));
    expect(findSome(tree, "legend").map(textOf)).toEqual(
      present.map((k) => k.label),
    );
    for (const fieldset of findAll(tree, "fieldset")) {
      const label = textOf(findSome(fieldset, "legend")[0]);
      const kind = KINDS.find((k) => k.label === label)?.id;
      const ids = findSome(fieldset, "input").map((r) => attrs(r).value);
      expect(ids).toEqual(
        ITEMS.filter((i) => i.kind === kind).map((i) => i.id),
      );
    }
  });

  it("checks exactly the selected item", () => {
    if (!second) throw new Error("demo.json needs at least two items");
    const radios = findSome(
      TryPicker({ selectedId: second.id, onSelect: noop }),
      "input",
    );
    const checked = radios.filter((r) => attrs(r).checked);
    expect(checked.map((r) => attrs(r).value)).toEqual([second.id]);
  });

  it("names each box and gives its size", () => {
    const labels = findSome(
      TryPicker({ selectedId: "", onSelect: noop }),
      "label",
    );
    expect(labels).toHaveLength(ITEMS.length);
    for (const label of labels) {
      const item = ITEMS.find(
        (i) => i.id === attrs(findSome(label, "input")[0]).value,
      );
      expect(item).toBeDefined();
      if (!item) continue;
      expect(textOf(label)).toContain(item.name);
      expect(textOf(label)).toContain(formatSize(item.bytes));
    }
  });

  it("reports the picked id", () => {
    let picked = "";
    const radio = findSome(
      TryPicker({ selectedId: "", onSelect: (id) => (picked = id) }),
      "input",
    ).find((r) => attrs(r).value === second?.id);
    (attrs(radio!).onChange as () => void)();
    expect(picked).toBe(second?.id);
  });
});
