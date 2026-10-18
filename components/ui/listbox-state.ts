// The select-only combobox's behaviour, as pure functions: which key does
// what (WAI-ARIA APG "Select-Only Combobox"), where the highlight goes, and
// where the open list sits. SelectMenu.tsx only wires these to the DOM, so
// vitest — which runs without one — can cover the whole interaction here.

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
  | { type: "open"; to?: "selected" | "first" | "last" }
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
  // Every action but close/hover works from an open list, so a key that
  // arrives while closed opens on the selected option first (APG).
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
      return { ...base, active: clamp(base.active + action.by, last) };
    case "home":
      return { ...base, active: 0 };
    case "end":
      return { ...base, active: last };
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

/**
 * What a keydown on the trigger does: an `action` for `reduce`, `commit` to
 * pick the highlighted option and close, and whether to `preventDefault`.
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
): { action?: ListboxAction; commit?: boolean; prevent: boolean } | null {
  const printable = key.length === 1 && !altKey && !ctrlKey && !metaKey;
  const type = (): { action: ListboxAction; prevent: boolean } => ({
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
 * roomier side with a `maxHeight` so it scrolls inside itself. Never past
 * `margin` from the viewport's edges at the moment it opens.
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
  gap = 4,
}: PlaceInput): Placement {
  const fits = (top: number) =>
    triggerTop + top >= margin &&
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
  const roomAbove = triggerTop - gap - margin;
  if (roomBelow >= roomAbove) {
    return { top: below, left: 0, maxHeight: Math.max(roomBelow, 0) };
  }
  return { top: -gap - roomAbove, left: 0, maxHeight: roomAbove };
}
