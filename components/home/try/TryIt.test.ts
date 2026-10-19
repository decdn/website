import { describe, expect, it } from "vitest";
import { BUNDLE_GROUPS, commandFor } from "./TryIt";
import {
  CLOSED,
  flatOptions,
  step,
  type ListboxState,
} from "@/components/ui/listbox-state";
import { ITEMS, PLATFORMS, groupByKind } from "@/lib/models";

// TryIt runs hooks, so the tree walker can't call it. What it renders comes
// from BUNDLE_GROUPS (the picker's options) and commandFor (the terminal
// line); these tests press keys through `step`, the logic SelectMenu's
// keydown handler runs, over the real catalogue, and check the line that
// results.

const options = flatOptions(BUNDLE_GROUPS);
const labels = options.map((o) => o.label);
const first = options[0].value;

/** The picker's value after `keys`, starting from `value`. */
function pickWith(keys: string[], value = first): string {
  let state: ListboxState = CLOSED;
  let current = value;
  keys.forEach((key, i) => {
    const selected = options.findIndex((o) => o.value === current);
    const r = step(state, { key }, { labels, selected }, i * 50);
    if (!r) return;
    state = r.state;
    if (r.commit !== undefined) current = options[r.commit].value;
  });
  return current;
}

/** The hex of an item's hash: what the command's `decdn:` URI carries. */
const hexOf = (id: string) =>
  ITEMS.find((i) => i.id === id)!.hash.replace(/^b3:/, "");

describe("the bundle picker", () => {
  it("offers every item, grouped by kind in the catalogue's order", () => {
    expect(BUNDLE_GROUPS.map((g) => g.id)).toEqual(
      groupByKind(ITEMS).map((g) => g.kind),
    );
    expect(options.map((o) => o.value).sort()).toEqual(
      ITEMS.map((i) => i.id).sort(),
    );
  });

  it("labels each option with its item's name", () => {
    for (const option of options) {
      expect(option.label).toBe(ITEMS.find((i) => i.id === option.value)!.name);
    }
  });

  it.each(PLATFORMS.map((p) => p.id))(
    "selecting an item switches the %s command to that item's hash",
    (platform) => {
      const id = pickWith(["Enter", "ArrowDown", "ArrowDown", "Enter"]);
      expect(id).toBe(options[2].value);
      expect(commandFor(id, platform)).toContain(hexOf(id));
      expect(commandFor(id, platform)).not.toContain(hexOf(first));
    },
  );

  it("type-ahead picks by name", () => {
    const ubuntu = ITEMS.find((i) => i.name.startsWith("Ubuntu"))!;
    const id = pickWith(["u", "Enter"]);
    expect(id).toBe(ubuntu.id);
    expect(commandFor(id, "unix")).toContain(hexOf(ubuntu.id));
  });

  it("Escape leaves the value, and so the command, as it was", () => {
    const start = options[3].value;
    expect(pickWith(["Enter", "End", "Escape"], start)).toBe(start);
  });

  it("an unknown id falls back to the first catalogue item's command", () => {
    expect(commandFor("nope", "unix")).toBe(commandFor(ITEMS[0].id, "unix"));
  });
});
