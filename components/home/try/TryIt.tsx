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

/** The line the terminal shows for the picked item on `platform`. */
export function commandFor(id: string, platform: Platform): string {
  const item = itemFor(id);
  return item
    ? getCommand(item.hash, platform, item.namespace, item.entry)
    : "";
}

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
      className="grid gap-10 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] @4xl:items-start @4xl:gap-12"
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

        {/* Beside the terminal, the source row sinks to its bottom edge. */}
        <div className="grid flex-1 grid-cols-2 content-between gap-y-4">
          <Figure label="size" value={formatSize(item.bytes)} />
          <Figure label="license" value={item.license} />
          <div className="col-span-2 flex flex-col gap-1">
            <span className="meta opacity-60">source</span>
            <a
              className="self-start text-body font-medium tracking-[-0.01em] break-all underline decoration-1 underline-offset-4 hover:decoration-whisper"
              href={item.source}
              target="_blank"
              rel="noopener noreferrer"
            >
              {sourceLabel(item.source)}
            </a>
          </div>
        </div>
      </div>

      <div className="terminal flex flex-col">
        <div className="terminal-head">
          <span className="terminal-dot" />
          <span className="terminal-dot" />
          <span className="terminal-dot" />
          <span className="terminal-label">{shell.shell}</span>
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

        <pre className="m-0 px-[18px] pt-[18px] pb-4 font-[inherit] break-all whitespace-pre-wrap">
          <span className="prompt select-none">{shell.prompt} </span>
          <code ref={codeRef}>{command}</code>
        </pre>

        <div className="flex items-center justify-between gap-6 px-[18px] pb-[18px]">
          <span className="dim text-[11px] tracking-[0.08em]">
            testnet · sponsored · no wallet
          </span>
          <button
            type="button"
            onClick={copy}
            className="meta cursor-pointer border-b border-current pb-[2px] hover:border-whisper"
            aria-live="polite"
          >
            {copied ? "copied ✓" : "copy"}
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
