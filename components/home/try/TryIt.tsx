"use client";

import { useId, useRef, useState, useSyncExternalStore } from "react";
import { Figure } from "@/components/ui/Figure";
import { SelectMenu } from "@/components/ui/SelectMenu";
import type { ListboxGroup } from "@/components/ui/listbox-state";
import { TRY_NOTES } from "@/lib/copy";
import {
  ITEMS,
  PLATFORMS,
  type Item,
  type Platform,
  detectPlatform,
  formatSize,
  getCommand,
  groupByKind,
  sourceLabel,
} from "@/lib/models";

/** The picker's groups: one per kind that has items, in `KINDS` order. */
export const BUNDLE_GROUPS: ListboxGroup[] = groupByKind(ITEMS).map(
  (group) => ({
    id: group.kind,
    label: group.label,
    options: group.items.map((item) => ({ value: item.id, label: item.name })),
  }),
);

// The fixed nav paints over anything beneath it, so the open list keeps
// clear of its bottom edge.
const navBottom = () =>
  document.querySelector(".chrome-nav")?.getBoundingClientRect().bottom ?? 0;

/** The picked item, falling back to the first for an unknown id. */
export function itemFor(id: string): Item | undefined {
  return ITEMS.find((i) => i.id === id) ?? ITEMS[0];
}

/** The line the terminal shows for item `id` on `platform`. */
export function commandFor(id: string, platform: Platform): string {
  const item = itemFor(id);
  return item
    ? getCommand(item.hash, platform, item.namespace, item.entry)
    : "";
}

// Every line the terminal can show, for the sizing stack in the command block.
const ALL_LINES = PLATFORMS.flatMap((p) =>
  ITEMS.map((i) => ({
    platform: p.id,
    itemId: i.id,
    prompt: p.prompt,
    command: commandFor(i.id, p.id),
  })),
);

const COPIED_MS = 2000;

// The visitor's OS never changes while the page is open, so there is nothing
// to subscribe to.
const subscribeNever = () => () => {};

function clientPlatform(): Platform {
  const nav = navigator as Navigator & {
    userAgentData?: { platform?: string };
  };
  return detectPlatform(nav.userAgentData?.platform || navigator.userAgent);
}

// The static export renders the POSIX line for everyone; a Windows visitor
// gets PowerShell once the page hydrates.
const serverPlatform = (): Platform => "unix";

/**
 * The interactive half of the #try section: pick a seeded item, copy the one
 * line that pulls it. Unlike HeroTerminal, this panel is real and not
 * aria-hidden: the command is the product's actual install-and-download line.
 */
export function TryIt() {
  const [id, setId] = useState(ITEMS[0]?.id ?? "");
  const detected = useSyncExternalStore(
    subscribeNever,
    clientPlatform,
    serverPlatform,
  );
  const [chosen, setPlatform] = useState<Platform | null>(null);
  const platform = chosen ?? detected;
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);
  const captionId = useId();

  const item = itemFor(id);
  const shell = PLATFORMS.find((p) => p.id === platform) ?? PLATFORMS[0];
  if (!item || !shell) return null;
  const command = commandFor(item.id, platform);

  function flashCopied() {
    setCopied(true);
    window.setTimeout(() => setCopied(false), COPIED_MS);
  }

  // Selects the command, then tries the legacy copy path. Where even that is
  // blocked, the command is left selected for the visitor to copy by hand.
  function selectAndCopy() {
    const code = codeRef.current;
    const selection = window.getSelection();
    if (!code || !selection) return;
    const range = document.createRange();
    range.selectNodeContents(code);
    selection.removeAllRanges();
    selection.addRange(range);
    if (document.execCommand("copy")) flashCopied();
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      flashCopied();
    } catch {
      selectAndCopy();
    }
  }

  return (
    <div
      data-reveal
      style={{ "--reveal-delay": "120ms" }}
      className="grid grid-cols-[minmax(0,1fr)] gap-10 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] @4xl:items-start @4xl:gap-12"
    >
      <div className="flex flex-col gap-8 @4xl:self-stretch">
        <div className="flex flex-col gap-3">
          <span id={captionId} className="meta opacity-60">
            select a bundle · {ITEMS.length} seeded
          </span>
          <SelectMenu
            groups={BUNDLE_GROUPS}
            value={item.id}
            onChange={(value) => {
              setId(value);
              setCopied(false);
            }}
            labelledBy={captionId}
            topInset={navBottom}
          >
            <span className="block truncate border-b border-current pr-8 pb-2 text-[clamp(1.25rem,2.2vw,1.75rem)] font-semibold tracking-[-0.02em]">
              {item.name}
            </span>
            <svg
              aria-hidden
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="pointer-events-none absolute right-0 bottom-3.5 size-5"
            >
              <path d="M3 6l5 5 5-5" />
            </svg>
          </SelectMenu>
        </div>

        {/* Every bundle's facts share one cell, all but the chosen one
            invisible, so a license or source that wraps on a narrow screen
            doesn't push the terminal down. The copies hold real links, so
            they stay `invisible` (out of tab order), never `opacity-0`. Each
            copy spreads its rows to the cell's height, so the source row sits
            on the bottom edge — beside the terminal, the terminal's. */}
        <div className="grid flex-1">
          {ITEMS.map((i) => {
            const shown = i.id === item.id;
            return (
              <div
                key={i.id}
                aria-hidden={!shown || undefined}
                className={`grid grid-cols-2 content-between gap-y-4 [grid-area:1/1] ${shown ? "" : "invisible"}`}
              >
                <Figure label="size" value={formatSize(i.bytes)} />
                <Figure label="license" value={i.license} />
                <div className="col-span-2 flex flex-col gap-1">
                  <span className="meta opacity-60">source</span>
                  <a
                    className="self-start text-body font-medium tracking-[-0.01em] break-all underline decoration-1 underline-offset-4 hover:decoration-whisper"
                    href={i.source}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {sourceLabel(i.source)}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="terminal flex flex-col">
        <div className="terminal-head">
          <span className="terminal-dot" />
          <span className="terminal-dot" />
          <span className="terminal-dot" />
          {/* Every shell name shares one cell, so the label keeps the longest
              one's width. Otherwise a longer name squeezes the OS toggle's
              labels onto two lines and the head changes height with the
              shell. */}
          <span className="terminal-label grid">
            {PLATFORMS.map((p) => {
              const shown = p.id === shell.id;
              return (
                <span
                  key={p.id}
                  aria-hidden={!shown || undefined}
                  className={`[grid-area:1/1] ${shown ? "" : "invisible"}`}
                >
                  {p.shell}
                </span>
              );
            })}
          </span>
          <span
            role="group"
            aria-label="operating system"
            className="ml-auto flex gap-4"
          >
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={p.id === platform}
                onClick={() => {
                  setPlatform(p.id);
                  setCopied(false);
                }}
                className={`cursor-pointer border-b pb-[1px] text-[10px] font-medium tracking-[0.14em] uppercase ${
                  p.id === platform
                    ? "border-current opacity-100"
                    : "border-transparent opacity-45 hover:opacity-80"
                }`}
              >
                {p.label}
              </button>
            ))}
          </span>
        </div>

        {/* Every line shares one cell, all but the chosen one invisible, so
            the block holds the tallest line's height and switching bundle or
            shell doesn't push the page below it. Each copy carries the
            visible line's markup, prompt margin included, so it wraps the
            same way. */}
        <pre className="m-0 grid px-[18px] pt-[18px] pb-4 font-[inherit] break-all whitespace-pre-wrap">
          {ALL_LINES.map((line) => {
            const shown = line.platform === shell.id && line.itemId === item.id;
            return (
              <span
                key={`${line.platform}:${line.itemId}`}
                aria-hidden={!shown || undefined}
                className={`[grid-area:1/1] ${shown ? "" : "invisible"}`}
              >
                <span className="prompt select-none">{line.prompt} </span>
                <code ref={shown ? codeRef : undefined}>{line.command}</code>
              </span>
            );
          })}
        </pre>

        <div className="flex items-center justify-between gap-6 px-[18px] pb-[18px]">
          <span className="dim text-[11px] tracking-[0.08em]">
            testnet · sponsored · no wallet
          </span>
          {/* The longer label sits invisibly in the live one's cell, so the
              button keeps its width and "copied ✓" can't wrap the row. */}
          <button
            type="button"
            onClick={copy}
            className="group meta grid cursor-pointer justify-items-end"
            aria-live="polite"
          >
            <span
              aria-hidden
              className="invisible border-b pb-[2px] [grid-area:1/1]"
            >
              copied ✓
            </span>
            <span className="border-b border-current pb-[2px] [grid-area:1/1] group-hover:border-whisper">
              {copied ? "copied ✓" : "copy"}
            </span>
          </button>
        </div>

        <ul className="flex flex-col gap-1 border-t border-dashed border-current/30 px-[18px] py-4 text-[12px] opacity-70">
          {TRY_NOTES.map((note) => (
            <li key={note}>
              <span className="dim">#</span> {note}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
