import { describe, expect, it } from "vitest";
import {
  CLOSED,
  TYPEAHEAD_MS,
  flatOptions,
  keyToAction,
  mouseAction,
  placeMenu,
  reduce,
  scrollToKeep,
  step,
  typeaheadMatch,
  type KeyInput,
  type ListboxGroup,
  type ListboxState,
} from "./listbox-state";

// Shaped like the Try section's catalogue: headed groups, letters shared
// across groups (Stable / Sintel, Debian / …), so type-ahead has to cycle.
const groups: ListboxGroup[] = [
  {
    id: "model",
    label: "model",
    options: [
      { value: "mistral", label: "Mistral 7B Instruct" },
      { value: "qwen", label: "Qwen2.5 7B Instruct" },
      { value: "stable", label: "Stable Diffusion XL" },
    ],
  },
  {
    id: "dataset",
    label: "dataset",
    options: [{ value: "libri", label: "LibriSpeech ASR corpus" }],
  },
  {
    id: "iso",
    label: "iso",
    options: [
      { value: "ubuntu", label: "Ubuntu 26.04 LTS" },
      { value: "debian", label: "Debian 13 DVD-1" },
    ],
  },
  {
    id: "video",
    label: "video",
    options: [
      { value: "dune", label: "Dune trailer" },
      { value: "sintel", label: "Sintel 4K" },
    ],
  },
];

const options = flatOptions(groups);
const labels = options.map((o) => o.label);
const at = (value: string) => options.findIndex((o) => o.value === value);

/**
 * Presses `keys` through `step`, the function SelectMenu's keydown handler
 * runs, and applies a commit the way the handler's `pick` does: onChange
 * only when the value actually changes. Returns the final state and value,
 * each key's preventDefault, and every onChange call.
 */
function press(
  keys: (string | KeyInput)[],
  { value = "mistral", now = 1_000, every = 50 } = {},
) {
  let state: ListboxState = CLOSED;
  let current = value;
  const prevented: boolean[] = [];
  const changes: string[] = [];
  keys.forEach((k, i) => {
    const ctx = { labels, selected: at(current) };
    const key = typeof k === "string" ? { key: k } : k;
    const r = step(state, key, ctx, now + i * every);
    prevented.push(r?.prevent ?? false);
    if (!r) return;
    state = r.state;
    if (r.commit !== undefined && options[r.commit].value !== current) {
      current = options[r.commit].value;
      changes.push(current);
    }
  });
  return { state, value: current, prevented, changes };
}

describe("opening and closing", () => {
  it.each(["Enter", " ", "ArrowDown", "ArrowUp"])(
    "%j opens on the selected option",
    (key) => {
      const { state, value } = press([key], { value: "ubuntu" });
      expect(state.open).toBe(true);
      expect(state.active).toBe(at("ubuntu"));
      expect(value).toBe("ubuntu");
    },
  );

  it("Home and End open on the first and last option", () => {
    expect(press(["Home"]).state.active).toBe(0);
    expect(press(["End"]).state.active).toBe(options.length - 1);
  });

  it.each(["Enter", " "])(
    "%j selects the highlighted option and closes",
    (key) => {
      const { state, value } = press(["Enter", "ArrowDown", "ArrowDown", key]);
      expect(state).toEqual(CLOSED);
      expect(value).toBe("stable");
    },
  );

  it("Escape closes without changing the value", () => {
    const { state, value, prevented } = press([
      "Enter",
      "ArrowDown",
      "ArrowDown",
      "Escape",
    ]);
    expect(state).toEqual(CLOSED);
    expect(value).toBe("mistral");
    expect(prevented.at(-1)).toBe(true);
  });

  it("Tab closes without changing the value and lets focus move on", () => {
    const { state, value, prevented } = press(["Enter", "End", "Tab"]);
    expect(state).toEqual(CLOSED);
    expect(value).toBe("mistral");
    expect(prevented.at(-1)).toBe(false);
  });

  it("reopening after Escape highlights the unchanged value again", () => {
    const { state } = press(["Enter", "End", "Escape", "Enter"], {
      value: "debian",
    });
    expect(state.active).toBe(at("debian"));
  });

  it("a closed list ignores Escape and Tab", () => {
    expect(keyToAction({ key: "Escape" }, CLOSED, 0)).toBeNull();
    expect(keyToAction({ key: "Tab" }, CLOSED, 0)).toBeNull();
  });
});

describe("keyboard navigation", () => {
  it("arrows move one option at a time", () => {
    expect(press(["Enter", "ArrowDown"]).state.active).toBe(1);
    expect(press(["Enter", "ArrowDown", "ArrowUp"]).state.active).toBe(0);
  });

  it("arrows stop at the ends rather than wrapping", () => {
    expect(press(["Enter", "ArrowUp"]).state.active).toBe(0);
    expect(press(["End", "ArrowDown"]).state.active).toBe(options.length - 1);
  });

  it("Home and End jump to the first and last option", () => {
    expect(press(["Enter", "ArrowDown", "End"]).state.active).toBe(
      options.length - 1,
    );
    expect(press(["End", "Home"]).state.active).toBe(0);
  });

  it("skips group headings: Down from the end of a group lands on the next group's first option", () => {
    const { state } = press(["Enter", "ArrowDown"], { value: "stable" });
    expect(options[state.active].value).toBe("libri");
  });

  it("hover moves the highlight only while open", () => {
    const ctx = { labels, selected: 0 };
    const open = reduce(CLOSED, { type: "open" }, ctx);
    expect(reduce(open, { type: "hover", index: 4 }, ctx).active).toBe(4);
    expect(reduce(CLOSED, { type: "hover", index: 4 }, ctx)).toBe(CLOSED);
  });

  it("modified keys are left to the browser", () => {
    const open = press(["Enter"]).state;
    expect(keyToAction({ key: "a", metaKey: true }, open, 0)).toBeNull();
    expect(keyToAction({ key: "c", ctrlKey: true }, open, 0)).toBeNull();
  });
});

describe("type-ahead", () => {
  it("a letter jumps to the next option starting with it", () => {
    expect(options[press(["Enter", "u"]).state.active].value).toBe("ubuntu");
  });

  it("is case-insensitive", () => {
    expect(options[press(["Enter", "U"]).state.active].value).toBe("ubuntu");
  });

  it("typing on a closed list opens it on the match", () => {
    const { state } = press(["l"]);
    expect(state.open).toBe(true);
    expect(options[state.active].value).toBe("libri");
  });

  it("repeating a letter cycles through its matches, wrapping", () => {
    const pick = (keys: string[]) =>
      options[press(["Enter", ...keys]).state.active].value;
    expect(pick(["d"])).toBe("debian");
    expect(pick(["d", "d"])).toBe("dune");
    expect(pick(["d", "d", "d"])).toBe("debian");
  });

  it("several letters match as a prefix", () => {
    const pick = (keys: string[]) =>
      options[press(["Enter", ...keys]).state.active].value;
    expect(pick(["s"])).toBe("stable");
    expect(pick(["s", "i"])).toBe("sintel");
    expect(pick(["s", "t"])).toBe("stable");
  });

  it("a space mid-word is part of the search, not a selection", () => {
    const { state, value } = press(["Enter", "d", "u", "n", "e", " ", "t"]);
    expect(state.open).toBe(true);
    expect(options[state.active].value).toBe("dune");
    expect(value).toBe("mistral");
  });

  it("a pause starts a fresh search", () => {
    const { state } = press(["Enter", "s", "i"], { every: TYPEAHEAD_MS });
    // "s" then, after the pause, a lone "i": no option starts with "i".
    expect(options[state.active].value).toBe("stable");
  });

  it("no match leaves the highlight where it was", () => {
    expect(press(["Enter", "ArrowDown", "z"]).state.active).toBe(1);
  });

  it("arrowing ends the word, so a quick Space then selects", () => {
    for (const nav of ["ArrowDown", "ArrowUp", "Home", "End"]) {
      const { state, changes } = press(["Enter", "s", nav, " "], {
        value: "libri",
      });
      expect(state, nav).toEqual(CLOSED);
      expect(changes, nav).toHaveLength(1);
    }
  });

  it("an empty buffer matches nothing", () => {
    expect(typeaheadMatch(labels, 0, "")).toBe(-1);
  });

  it("selecting after type-ahead commits the match", () => {
    const { value } = press(["Enter", "u", "Enter"]);
    expect(value).toBe("ubuntu");
  });
});

describe("step", () => {
  it("re-picking the current value closes without an onChange", () => {
    const { state, changes } = press(["Enter", "Enter"], { value: "qwen" });
    expect(state).toEqual(CLOSED);
    expect(changes).toEqual([]);
  });

  it("a pick reports exactly one onChange", () => {
    expect(press(["Enter", "End", "Enter"]).changes).toEqual(["sintel"]);
  });

  it("commits the highlighted index, not the selected one", () => {
    const ctx = { labels, selected: 0 };
    const open = { ...CLOSED, open: true, active: 4 };
    expect(step(open, { key: "Enter" }, ctx, 0)).toEqual({
      state: CLOSED,
      commit: 4,
      prevent: true,
    });
  });

  it("keyToAction never returns both an action and a commit", () => {
    const open = press(["Enter"]).state;
    for (const key of ["Enter", " ", "ArrowDown", "Escape", "Tab", "a"]) {
      const r = keyToAction({ key }, open, 10_000);
      expect(r && "action" in r && "commit" in r).toBeFalsy();
    }
  });
});

describe("pointer", () => {
  it("a primary press toggles the list", () => {
    expect(mouseAction("press", false)).toEqual({ type: "open" });
    expect(mouseAction("press", true)).toEqual({ type: "close" });
  });

  it("other buttons do nothing", () => {
    expect(mouseAction("press", false, { button: 2 })).toBeNull();
  });

  it("a click after a press is ignored", () => {
    expect(mouseAction("click", true, { detail: 1 })).toBeNull();
    expect(mouseAction("click", false, { detail: 1 })).toBeNull();
  });

  it("an assistive-tech click (detail 0) only opens", () => {
    expect(mouseAction("click", false, { detail: 0 })).toEqual({
      type: "open",
    });
    // Open already (e.g. after a keyboard Space): stays open.
    const open = press(["Enter"]).state;
    const action = mouseAction("click", true, { detail: 0 })!;
    expect(reduce(open, action, { labels, selected: 0 })).toBe(open);
  });
});

// In a height-clamped list the highlight is kept in view by moving the
// list's own scrollTop, never the page's.
describe("scrollToKeep", () => {
  it("leaves a visible row alone", () => {
    expect(scrollToKeep(40, 20, 0, 100)).toBe(0);
  });
  it("scrolls up to a row above the view", () => {
    expect(scrollToKeep(40, 20, 80, 100)).toBe(40);
  });
  it("scrolls down just enough for a row below the view", () => {
    expect(scrollToKeep(150, 20, 0, 100)).toBe(70);
  });
});

describe("page scroll", () => {
  // The list never locks the page: keys it doesn't use fall through to the
  // browser, which scrolls the page with them as usual.
  it.each(["PageDown", "PageUp"])(
    "%s still scrolls the page while open",
    (key) => {
      const open = press(["Enter"]).state;
      expect(keyToAction({ key }, open, 0)).toBeNull();
    },
  );
});

describe("placeMenu", () => {
  const base = {
    triggerTop: 400,
    triggerLeft: 100,
    triggerHeight: 40,
    viewportHeight: 900,
    menuHeight: 300,
    selectedCenter: 100,
    textInset: 30,
  };

  it("opens over the trigger with the selected row centred on it", () => {
    expect(placeMenu(base)).toEqual({ top: 20 - 100, left: -30 });
  });

  it("never shifts left past the viewport margin", () => {
    expect(placeMenu({ ...base, triggerLeft: 20 }).left).toBe(-12);
    expect(placeMenu({ ...base, triggerLeft: 0 }).left).toBe(0);
  });

  it("opens directly below the trigger when over-the-selection would cross the top", () => {
    expect(placeMenu({ ...base, triggerTop: 50 })).toEqual({
      top: 44,
      left: 0,
    });
  });

  it("opens directly above when neither over nor below fits", () => {
    const p = placeMenu({ ...base, triggerTop: 700, selectedCenter: 10 });
    expect(p).toEqual({ top: -304, left: 0 });
  });

  it("clamps the height on the roomier side when nothing fits", () => {
    const p = placeMenu({ ...base, viewportHeight: 300, triggerTop: 60 });
    // Below: 300 - 8 - (60 + 44) = 188px of room; above: 60 - 4 - 8 = 48px.
    expect(p).toEqual({ top: 44, left: 0, maxHeight: 188 });
  });

  it("keeps clear of a fixed nav covering the top", () => {
    // Over the trigger would start at 120 - 80 = 40px, under a 73px nav.
    const p = placeMenu({ ...base, triggerTop: 120, topInset: 73 });
    expect(p).toEqual({ top: 44, left: 0 });
  });

  it("clamps above the trigger below the nav too", () => {
    const p = placeMenu({
      ...base,
      viewportHeight: 500,
      triggerTop: 300,
      topInset: 73,
    });
    // Above: 300 - 4 - (73 + 8) = 215px; below: 500 - 8 - 344 = 148px.
    expect(p).toEqual({ top: -219, left: 0, maxHeight: 215 });
    expect(300 + p.top).toBe(81);
  });

  it("never clamps to less than one row, on either side", () => {
    const below = placeMenu({ ...base, viewportHeight: 60, triggerTop: 10 });
    expect(below.maxHeight).toBe(32);
    const above = placeMenu({ ...base, viewportHeight: 60, triggerTop: 40 });
    expect(above.maxHeight).toBeGreaterThanOrEqual(32);
    expect(above.top).toBe(-4 - above.maxHeight!);
  });

  it("keeps every placement inside the viewport", () => {
    for (const topInset of [0, 73]) {
      for (const triggerTop of [90, 120, 400, 650, 850]) {
        for (const selectedCenter of [10, 150, 290]) {
          const p = placeMenu({
            ...base,
            triggerTop,
            selectedCenter,
            topInset,
          });
          const height = p.maxHeight ?? base.menuHeight;
          expect(triggerTop + p.top).toBeGreaterThanOrEqual(topInset + 8);
          expect(triggerTop + p.top + height).toBeLessThanOrEqual(900 - 8);
        }
      }
    }
  });
});
