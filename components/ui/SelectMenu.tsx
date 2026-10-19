"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from "react";
import {
  CLOSED,
  flatOptions,
  mouseAction,
  placeMenu,
  reduce,
  scrollToKeep,
  step,
  type ListboxAction,
  type ListboxGroup,
  type ListboxOption,
} from "@/components/ui/listbox-state";

const COARSE = "(pointer: coarse)";

function subscribePointer(onChange: () => void) {
  const query = window.matchMedia(COARSE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const coarsePointer = () => window.matchMedia(COARSE).matches;

// The static export can't know the pointer, so it ships the native select,
// which works for everyone. A fine pointer swaps in the custom list after
// hydration; the caller's face is the same in both, so nothing moves.
const serverCoarse = () => true;

type SelectMenuProps = {
  groups: readonly ListboxGroup[];
  value: string;
  onChange: (value: string) => void;
  /** Id of the element that names the control. */
  labelledBy: string;
  /** What the trigger shows — the current value, styled by the caller.
   *  Positioned children anchor to the control's own box. */
  children: ReactNode;
  /** Viewport px covered at the top (a fixed nav), read each time the list
   *  is placed, so it never opens underneath. */
  topInset?: () => number;
};

/**
 * A select with a macOS-style menu on fine pointers and the platform's own
 * picker on touch. The custom list follows the WAI-ARIA select-only combobox
 * pattern; its behaviour lives in listbox-state.ts, this file wires it up.
 */
export function SelectMenu(props: SelectMenuProps) {
  const coarse = useSyncExternalStore(
    subscribePointer,
    coarsePointer,
    serverCoarse,
  );
  return coarse ? <NativeSelect {...props} /> : <ListboxSelect {...props} />;
}

function nativeOptions(options: readonly ListboxOption[]) {
  return options.map((option) => (
    <option key={option.value} value={option.value}>
      {option.label}
    </option>
  ));
}

/** The touch fallback and the static HTML. Exported for its test. */
export function NativeSelect({
  groups,
  value,
  onChange,
  labelledBy,
  children,
}: SelectMenuProps) {
  return (
    // The native menu takes the select's font-size, so the select stays at
    // body size and sits invisibly over the caller's face. The ring moves to
    // the wrapper for the same reason.
    <span className="relative block has-[select:focus-visible]:outline-2 has-[select:focus-visible]:outline-offset-4">
      <span aria-hidden className="block">
        {children}
      </span>
      <select
        aria-labelledby={labelledBy}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 w-full cursor-pointer appearance-none text-body opacity-0"
      >
        {/* One group needs no heading; several get one each. */}
        {groups.length > 1
          ? groups.map((group) => (
              <optgroup key={group.id} label={group.label}>
                {nativeOptions(group.options)}
              </optgroup>
            ))
          : nativeOptions(flatOptions(groups))}
      </select>
    </span>
  );
}

function ListboxSelect({
  groups,
  value,
  onChange,
  labelledBy,
  children,
  topInset,
}: SelectMenuProps) {
  const listId = useId();
  const options = flatOptions(groups);
  const ctx = {
    labels: options.map((option) => option.label),
    selected: options.findIndex((option) => option.value === value),
  };
  const [state, setState] = useState(CLOSED);
  const apply = (action: ListboxAction) =>
    setState((s) => reduce(s, action, ctx));

  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  function pick(index: number) {
    const option = options[index];
    if (option && option.value !== value) onChange(option.value);
    setState(CLOSED);
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    const result = step(state, e, ctx, e.timeStamp);
    if (!result) return;
    if (result.prevent) e.preventDefault();
    if (result.commit === undefined) setState(result.state);
    else pick(result.commit);
  }

  // Placed once per opening (and on resize), before the first paint, from
  // measurements of the rendered list. Not on scroll: the list is absolute
  // in the wrapper, so it scrolls with the page and stays on its trigger.
  useLayoutEffect(() => {
    if (!state.open) return;
    function place() {
      const panel = panelRef.current;
      const trigger = triggerRef.current;
      if (!panel || !trigger) return;
      panel.style.maxHeight = "";
      const rect = trigger.getBoundingClientRect();
      const row = panel.querySelector<HTMLElement>("[data-current]");
      const text = panel.querySelector<HTMLElement>("[data-option-text]");
      const p = placeMenu({
        triggerTop: rect.top,
        triggerLeft: rect.left,
        triggerHeight: rect.height,
        viewportHeight: document.documentElement.clientHeight,
        menuHeight: panel.offsetHeight,
        selectedCenter: row ? row.offsetTop + row.offsetHeight / 2 : 0,
        textInset: text?.offsetLeft ?? 0,
        topInset: topInset?.() ?? 0,
      });
      panel.style.top = `${p.top}px`;
      panel.style.left = `${p.left}px`;
      panel.style.minWidth = `calc(100% + ${-p.left}px)`;
      panel.style.maxHeight =
        p.maxHeight === undefined ? "" : `${p.maxHeight}px`;
    }
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [state.open, topInset]);

  // A height-clamped list scrolls itself to keep the highlight in view.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!state.open || !panel || panel.scrollHeight <= panel.clientHeight) {
      return;
    }
    const row = panel.querySelector<HTMLElement>(
      `[data-index="${state.active}"]`,
    );
    if (!row) return;
    panel.scrollTop = scrollToKeep(
      row.offsetTop,
      row.offsetHeight,
      panel.scrollTop,
      panel.clientHeight,
    );
  }, [state.open, state.active]);

  useEffect(() => {
    if (!state.open) return;
    function onPointerDown(e: PointerEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setState(CLOSED);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [state.open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={state.open}
        aria-controls={listId}
        aria-labelledby={labelledBy}
        aria-activedescendant={
          state.open ? optionId(listId, state.active) : undefined
        }
        onKeyDown={onKeyDown}
        // Space activates a button on keyup; the list already handled it on
        // keydown, so the click would toggle it straight back.
        onKeyUp={(e) => {
          if (e.key === " ") e.preventDefault();
        }}
        // Opens on press, like a native menu. Focus is set by hand because
        // preventDefault, which keeps a drag from selecting text, also
        // skips the button's own focusing.
        onMouseDown={(e) => {
          const action = mouseAction("press", state.open, e);
          if (!action) return;
          e.preventDefault();
          triggerRef.current?.focus();
          apply(action);
        }}
        onClick={(e) => {
          const action = mouseAction("click", state.open, e);
          if (action) apply(action);
        }}
        onBlur={() => setState(CLOSED)}
        className="block w-full cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        {children}
      </button>
      <SelectMenuPanel
        id={listId}
        labelledBy={labelledBy}
        groups={groups}
        value={value}
        open={state.open}
        active={state.active}
        panelRef={panelRef}
        onHover={(index) => {
          if (index !== state.active) apply({ type: "hover", index });
        }}
        onPick={pick}
      />
    </div>
  );
}

export const optionId = (listId: string, index: number) => `${listId}-${index}`;

type SelectMenuPanelProps = {
  id: string;
  labelledBy: string;
  groups: readonly ListboxGroup[];
  value: string;
  open: boolean;
  /** Index of the highlighted option in `flatOptions(groups)`. */
  active: number;
  panelRef?: Ref<HTMLDivElement>;
  onHover?: (index: number) => void;
  onPick?: (index: number) => void;
};

/**
 * The list's markup, without state, so its structure can be tested without
 * a DOM. Stays mounted while closed (`hidden`) so the trigger's
 * aria-controls always points at it. Positioned `absolute` against the
 * trigger's wrapper; ListboxSelect sets its offsets when it opens and on
 * resize.
 *
 * `aria-selected` follows the highlight, as in the APG select-only
 * combobox; the check mark and `data-current` mark the current value.
 */
export function SelectMenuPanel({
  id,
  labelledBy,
  groups,
  value,
  open,
  active,
  panelRef,
  onHover,
  onPick,
}: SelectMenuPanelProps) {
  const row = (option: ListboxOption, index: number) => {
    const current = option.value === value;
    return (
      <div
        key={option.value}
        id={optionId(id, index)}
        role="option"
        aria-selected={index === active}
        data-current={current || undefined}
        data-index={index}
        onMouseMove={() => onHover?.(index)}
        onClick={() => onPick?.(index)}
        className={`flex cursor-default items-center gap-1.5 rounded-[calc(var(--menu-radius)-7px)] py-[3px] pr-6 pl-1.5 ${
          index === active ? "bg-whisper-text text-paper" : ""
        }`}
      >
        <span className="flex w-4 shrink-0 justify-center">
          {current && (
            <svg
              aria-hidden
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-3.5"
            >
              <path d="M3 8.5l3.5 3.5L13 4.5" />
            </svg>
          )}
        </span>
        <span data-option-text className="truncate">
          {option.label}
        </span>
      </div>
    );
  };

  const starts = groups.map((_, g) =>
    groups.slice(0, g).reduce((n, group) => n + group.options.length, 0),
  );

  return (
    <div
      ref={panelRef}
      id={id}
      role="listbox"
      aria-labelledby={labelledBy}
      hidden={!open}
      // Keeps focus on the trigger, which owns the keyboard.
      onMouseDown={(e) => e.preventDefault()}
      className="absolute top-0 left-0 z-30 min-w-full overflow-y-auto rounded-[var(--menu-radius)] border border-ink/10 bg-paper/97 p-[6px] text-body leading-[1.35] text-ink shadow-[0_16px_40px_-14px_color-mix(in_srgb,var(--ink)_40%,transparent)] backdrop-blur-2xl backdrop-saturate-150 select-none"
    >
      {groups.length > 1
        ? groups.map((group, g) => {
            const headingId = `${id}-${group.id}`;
            return (
              <div key={group.id} role="group" aria-labelledby={headingId}>
                <div
                  id={headingId}
                  role="presentation"
                  className="px-2 pt-1.5 pb-0.5 text-[11px] font-semibold text-ink/45"
                >
                  {group.label}
                </div>
                {group.options.map((option, i) => row(option, starts[g] + i))}
              </div>
            );
          })
        : flatOptions(groups).map(row)}
    </div>
  );
}
