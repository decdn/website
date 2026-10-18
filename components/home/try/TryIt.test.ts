import { describe, expect, it } from "vitest";
import { BUNDLE_GROUPS, commandFor } from "./TryIt";
import {
  CLOSED,
  flatOptions,
  keyToAction,
  reduce,
  type ListboxState,
} from "@/components/ui/listbox-state";
import { ITEMS, PLATFORMS, getCommand, groupByKind } from "@/lib/models";

// TryIt runs hooks, so the tree walker can't call it. What it renders comes
// from BUNDLE_GROUPS (the picker's options) and commandFor (the terminal
// line); these tests drive the picker's keyboard logic over the real
// catalogue and check the line that results.

const options = flatOptions(BUNDLE_GROUPS);
const labels = options.map((o) => o.label);

/** The picker's value after `keys`, the way SelectMenu applies them. */
function pickWith(keys: string[], value = ITEMS[0].id): string {
  let state: ListboxState = CLOSED;
  let current = value;
  keys.forEach((key, i) => {
    const ctx = {
      labels,
      selected: options.findIndex((o) => o.value === current),
    };
    const r = keyToAction({ key }, state, i * 50);
    if (!r) return;
    if (r.action) state = reduce(state, r.action, ctx);
    if (r.commit) {
      current = options[state.active].value;
      state = CLOSED;
    }
  });
  return current;
}

describe("the bundle picker", () => {
  it("offers every item, grouped by kind in the catalogue's order", () => {
    expect(BUNDLE_GROUPS.map((g) => g.id)).toEqual(
      groupByKind(ITEMS).map((g) => g.kind),
    );
    expect(options.map((o) => o.value).sort()).toEqual(
      ITEMS.map((i) => i.id).sort(),
    );
  });

  it.each(PLATFORMS.map((p) => p.id))(
    "selecting an item updates the %s command to that item",
    (platform) => {
      const id = pickWith(["Enter", "ArrowDown", "ArrowDown", "Enter"]);
      const item = ITEMS.find((i) => i.id === id)!;
      expect(id).toBe(options[2].value);
      expect(commandFor(id, platform)).toBe(
        getCommand(item.hash, platform, item.namespace, item.entry),
      );
      expect(commandFor(id, platform)).not.toBe(
        commandFor(ITEMS[0].id, platform),
      );
    },
  );

  it("type-ahead picks by name", () => {
    const ubuntu = ITEMS.find((i) => i.name.startsWith("Ubuntu"))!;
    expect(pickWith(["u", "Enter"])).toBe(ubuntu.id);
    expect(commandFor(pickWith(["u", "Enter"]), "unix")).toContain(
      ubuntu.hash.replace(/^b3:/, ""),
    );
  });

  it("Escape leaves the value and the command as they were", () => {
    const before = commandFor(ITEMS[0].id, "unix");
    const id = pickWith(["Enter", "End", "Escape"]);
    expect(id).toBe(ITEMS[0].id);
    expect(commandFor(id, "unix")).toBe(before);
  });

  it("an unknown id falls back to the first item's command", () => {
    expect(commandFor("nope", "unix")).toBe(commandFor(ITEMS[0].id, "unix"));
  });
});
