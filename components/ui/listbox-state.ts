// The select-only combobox's behaviour, as pure functions: which key does
// what (WAI-ARIA APG "Select-Only Combobox"), where the highlight goes, and
// where the open list sits, plus the small decisions behind each pointer
// event. SelectMenu.tsx wires these to the DOM and keeps only what needs one
// (measuring, focus, document listeners), which vitest, running without a
// DOM, does not reach.

export type ListboxOption = { value: string; label: string };

export type ListboxGroup = {
  id: string;
  label: string;
  options: readonly ListboxOption[];
};

/** Options in display order. Group headings are not in it, so neither the
 *  arrow keys nor type-ahead can land on one. */
export function flatOptions(groups: readonly ListboxGroup[]): ListboxOption[] {
  return groups.flatMap((group) => group.options);
}

/** `active` is the highlighted option's index in `flatOptions`, -1 while
 *  closed. `typed` / `typedAt` are the type-ahead buffer. */
export type ListboxState = {
  open: boolean;
  active: number;
  typed: string;
  typedAt: number;
};

export const CLOSED: ListboxState = {
  open: false,
  active: -1,
  typed: "",
  typedAt: 0,
};

/** A pause this long starts a fresh type-ahead search. */
export const TYPEAHEAD_MS = 500;

export type ListboxAction =
  | { type: "open"; to?: "first" | "last" }
  | { type: "close" }
  | { type: "move"; by: 1 | -1 }
  | { type: "home" }
  | { type: "end" }
  | { type: "hover"; index: number }
  | { type: "type"; char: string; now: number };

export type ListboxContext = {
  labels: readonly string[];
  /** Index of the current value in `labels`; -1 when none matches. */
  selected: number;
};

const clamp = (n: number, max: number) => Math.min(Math.max(n, 0), max);

const typing = (state: ListboxState, now: number) =>
  state.typed !== "" && now - state.typedAt < TYPEAHEAD_MS;

/**
 * The option a type-ahead buffer lands on, or -1. A buffer of one repeated
 * letter ("dd") cycles through the options starting with that letter; any
 * other buffer matches as a prefix, and a longer prefix may stay put on the
 * option it already matches.
 */
export function typeaheadMatch(
  labels: readonly string[],
  active: number,
  buffer: string,
): number {
  if (!buffer) return -1;
  const n = labels.length;
  const repeated = [...buffer].every((c) => c === buffer[0]);
  const needle = (repeated ? buffer[0] : buffer).toLowerCase();
  const start = repeated ? active + 1 : active;
  for (let i = 0; i < n; i++) {
    const j = (((start + i) % n) + n) % n;
    if (labels[j].toLowerCase().startsWith(needle)) return j;
  }
  return -1;
}

export function reduce(
  state: ListboxState,
  action: ListboxAction,
  { labels, selected }: ListboxContext,
): ListboxState {
  const last = labels.length - 1;
  if (last < 0) return CLOSED;
  // Every action but close/hover works from an open list, so one that
  // arrives while closed opens on the selected option first (APG). A `move`
  // on a closed list only opens; it doesn't also step.
  const base: ListboxState = state.open
    ? state
    : { ...CLOSED, open: true, active: clamp(selected, last) };

  switch (action.type) {
    case "open":
      if (state.open) return state;
      if (action.to === "first") return { ...base, active: 0 };
      if (action.to === "last") return { ...base, active: last };
      return base;
    case "close":
      return CLOSED;
    case "move":
      if (!state.open) return base;
      return {
        ...base,
        active: clamp(base.active + action.by, last),
        typed: "",
      };
    // Navigating ends a type-ahead word, so a Space right after selects.
    case "home":
      return { ...base, active: 0, typed: "" };
    case "end":
      return { ...base, active: last, typed: "" };
    case "hover":
      if (!state.open) return state;
      return { ...state, active: clamp(action.index, last) };
    case "type": {
      const typed = typing(state, action.now)
        ? state.typed + action.char
        : action.char;
      const match = typeaheadMatch(labels, base.active, typed);
      return {
        ...base,
        active: match === -1 ? base.active : match,
        typed,
        typedAt: action.now,
      };
    }
  }
}

export type KeyInput = {
  key: string;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
};

/** A key's effect: an `action` for `reduce`, or `commit` to pick the
 *  highlighted option and close — never both. */
export type KeyResult =
  | { action: ListboxAction; commit?: never; prevent: boolean }
  | { commit: true; action?: never; prevent: true };

/**
 * What a keydown on the trigger does (see `KeyResult`), and whether to
 * `preventDefault`.
 * `null` means the key is not ours — it does its usual thing, so PageUp,
 * PageDown and the rest still scroll the page while the list is open.
 *
 * Esc and Tab close without changing the value. Tab is not prevented, so
 * focus moves on as usual; everything else leaves focus on the trigger,
 * which never gave it up (the list uses aria-activedescendant).
 */
export function keyToAction(
  { key, altKey, ctrlKey, metaKey }: KeyInput,
  state: ListboxState,
  now: number,
): KeyResult | null {
  const printable = key.length === 1 && !altKey && !ctrlKey && !metaKey;
  const type = (): KeyResult => ({
    action: { type: "type", char: key, now },
    prevent: true,
  });

  if (!state.open) {
    switch (key) {
      case "Enter":
      case " ":
      case "ArrowDown":
      case "ArrowUp":
        return { action: { type: "open" }, prevent: true };
      case "Home":
        return { action: { type: "open", to: "first" }, prevent: true };
      case "End":
        return { action: { type: "open", to: "last" }, prevent: true };
    }
    return printable ? type() : null;
  }

  switch (key) {
    case "ArrowDown":
      return { action: { type: "move", by: 1 }, prevent: true };
    case "ArrowUp":
      return { action: { type: "move", by: -1 }, prevent: true };
    case "Home":
      return { action: { type: "home" }, prevent: true };
    case "End":
      return { action: { type: "end" }, prevent: true };
    case "Enter":
      return { commit: true, prevent: true };
    case " ":
      // Mid-word, a space is part of the search ("stable d…").
      return typing(state, now) ? type() : { commit: true, prevent: true };
    case "Escape":
      return { action: { type: "close" }, prevent: true };
    case "Tab":
      return { action: { type: "close" }, prevent: false };
  }
  return printable ? type() : null;
}

/**
 * One keydown, end to end: the next state, and `commit`, the index of the
 * option to hand to onChange, when the key picks one. `null` when the key
 * is not ours. SelectMenu's handler is this plus preventDefault and
 * onChange, so testing `step` tests the handler's logic.
 */
export function step(
  state: ListboxState,
  key: KeyInput,
  ctx: ListboxContext,
  now: number,
): { state: ListboxState; commit?: number; prevent: boolean } | null {
  const result = keyToAction(key, state, now);
  if (!result) return null;
  if (result.commit) {
    return { state: CLOSED, commit: state.active, prevent: result.prevent };
  }
  return { state: reduce(state, result.action, ctx), prevent: result.prevent };
}

/**
 * What a mouse event on the trigger does. A primary-button press toggles the
 * list, like a native menu (other buttons do nothing). A click arrives after
 * that press and is ignored — except a click with `detail` 0, which has no
 * press behind it: assistive tech activating the button. That one only
 * opens, so it can't undo a keyboard Space that already did.
 */
export function mouseAction(
  kind: "press" | "click",
  open: boolean,
  { button = 0, detail = 1 }: { button?: number; detail?: number } = {},
): ListboxAction | null {
  if (kind === "click") return detail === 0 ? { type: "open" } : null;
  if (button !== 0) return null;
  return open ? { type: "close" } : { type: "open" };
}

/** The list's `scrollTop` that brings a row into view with the least
 *  movement, or the current one if it already is. Applied to the list
 *  itself; scrollIntoView would scroll the page as well. */
export function scrollToKeep(
  rowTop: number,
  rowHeight: number,
  scrollTop: number,
  clientHeight: number,
): number {
  if (rowTop < scrollTop) return rowTop;
  if (rowTop + rowHeight > scrollTop + clientHeight) {
    return rowTop + rowHeight - clientHeight;
  }
  return scrollTop;
}

export type PlaceInput = {
  /** The trigger's box, in viewport px (getBoundingClientRect). */
  triggerTop: number;
  triggerLeft: number;
  triggerHeight: number;
  viewportHeight: number;
  /** The list's full, unclamped height. */
  menuHeight: number;
  /** From the list's top edge to the middle of the selected row. */
  selectedCenter: number;
  /** From the list's left edge to where an option's text starts. */
  textInset: number;
  /** Closest the list may come to a viewport edge. */
  margin?: number;
  /** Viewport px covered at the top, e.g. by a fixed nav that would paint
   *  over the list. The list keeps `margin` below it. */
  topInset?: number;
  /** Smallest height a clamped list gets, about one row: when there is
   *  no room at all it overflows the viewport rather than vanishing. */
  minHeight?: number;
  /** Space between trigger and list when the list opens beside it. */
  gap?: number;
};

/** Offsets from the trigger's top-left corner, for an absolutely positioned
 *  list inside the trigger's own positioned wrapper. */
export type Placement = { top: number; left: number; maxHeight?: number };

/**
 * Where the list opens, macOS-style: over the trigger with the selected row
 * centred on it and its text lined up with the trigger's; failing that,
 * directly below the trigger, then directly above; failing both, on the
 * roomier side with a `maxHeight` so it scrolls inside itself. At the moment
 * it opens it keeps `margin` from the viewport's bottom, from `topInset` at
 * the top, and from the left edge when shifted to line up the text. The
 * right edge is not checked: the list is as wide as the trigger unless a
 * label is longer.
 *
 * The result is relative to the trigger, not the viewport: the list is
 * `position: absolute` in the trigger's wrapper, so when the page scrolls
 * it travels with the trigger instead of staying pinned to the screen.
 */
export function placeMenu({
  triggerTop,
  triggerLeft,
  triggerHeight,
  viewportHeight,
  menuHeight,
  selectedCenter,
  textInset,
  margin = 8,
  topInset = 0,
  minHeight = 32,
  gap = 4,
}: PlaceInput): Placement {
  const minTop = topInset + margin;
  const fits = (top: number) =>
    triggerTop + top >= minTop &&
    triggerTop + top + menuHeight <= viewportHeight - margin;

  const over = Math.round(triggerHeight / 2 - selectedCenter);
  if (fits(over)) {
    const shift = Math.min(textInset, triggerLeft - margin);
    return { top: over, left: shift > 0 ? -shift : 0 };
  }

  const below = triggerHeight + gap;
  if (fits(below)) return { top: below, left: 0 };

  const above = -gap - menuHeight;
  if (fits(above)) return { top: above, left: 0 };

  const roomBelow = viewportHeight - margin - (triggerTop + below);
  const roomAbove = triggerTop - gap - minTop;
  if (roomBelow >= roomAbove) {
    return { top: below, left: 0, maxHeight: Math.max(roomBelow, minHeight) };
  }
  const height = Math.max(roomAbove, minHeight);
  return { top: -gap - height, left: 0, maxHeight: height };
}
