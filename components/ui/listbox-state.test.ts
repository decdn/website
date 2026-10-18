import { describe, expect, it } from "vitest";
import {
  CLOSED,
  TYPEAHEAD_MS,
  flatOptions,
  keyToAction,
  placeMenu,
  reduce,
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
 * Drives the keyboard the way SelectMenu does: keyToAction, then reduce, and
 * on `commit` hand the highlighted value to onChange and close. Returns the
 * final state and value, plus what each key did to preventDefault.
 */
function press(
  keys: (string | KeyInput)[],
  { value = "mistral", now = 1_000, step = 50 } = {},
) {
  let state: ListboxState = CLOSED;
  let current = value;
  const prevented: boolean[] = [];
  keys.forEach((k, i) => {
    const t = now + i * step;
    const ctx = { labels, selected: at(current) };
    const r = keyToAction(typeof k === "string" ? { key: k } : k, state, t);
    prevented.push(r?.prevent ?? false);
    if (!r) return;
    if (r.action) state = reduce(state, r.action, ctx);
    if (r.commit) {
      current = options[state.active].value;
      state = reduce(state, { type: "close" }, ctx);
    }
  });
  return { state, value: current, prevented };
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
    const { state } = press(["Enter", "s", "i"], { step: TYPEAHEAD_MS });
    // "s" then, after the pause, a lone "i": no option starts with "i".
    expect(options[state.active].value).toBe("stable");
  });

  it("no match leaves the highlight where it was", () => {
    expect(press(["Enter", "ArrowDown", "z"]).state.active).toBe(1);
  });

  it("selecting after type-ahead commits the match", () => {
    const { value } = press(["Enter", "u", "Enter"]);
    expect(value).toBe("ubuntu");
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

  it("keeps every placement inside the viewport", () => {
    for (const triggerTop of [10, 120, 400, 650, 850]) {
      for (const selectedCenter of [10, 150, 290]) {
        const p = placeMenu({ ...base, triggerTop, selectedCenter });
        const height = p.maxHeight ?? base.menuHeight;
        expect(triggerTop + p.top).toBeGreaterThanOrEqual(8);
        expect(triggerTop + p.top + height).toBeLessThanOrEqual(900 - 8);
      }
    }
  });
});
