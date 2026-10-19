"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { Figure } from "@/components/ui/Figure";
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

const GROUPS = groupByKind(ITEMS);

// Every line the terminal can show. Stacked invisibly under the visible one,
// they hold the command block at the tallest line's height, so switching
// bundle or shell never resizes the panel and shifts the page below it.
const ALL_LINES = PLATFORMS.flatMap((p) =>
  ITEMS.map((i) => ({
    key: `${p.id}:${i.id}`,
    prompt: p.prompt,
    command: getCommand(i.hash, p.id, i.namespace, i.entry),
  })),
);

function itemOptions(items: readonly Item[]) {
  return items.map((item) => (
    <option key={item.id} value={item.id}>
      {item.name}
    </option>
  ));
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

  const item = ITEMS.find((i) => i.id === id) ?? ITEMS[0];
  const shell = PLATFORMS.find((p) => p.id === platform) ?? PLATFORMS[0];
  if (!item || !shell) return null;
  const command = getCommand(item.hash, platform, item.namespace, item.entry);

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
        <label className="flex flex-col gap-3">
          <span className="meta opacity-60">
            select a bundle · {ITEMS.length} seeded
          </span>
          {/* The native menu takes the select's font-size, so the select
              stays at body size and sits invisibly over a headline-sized
              face. The ring moves to the wrapper for the same reason. */}
          <span className="relative has-[select:focus-visible]:outline-2 has-[select:focus-visible]:outline-offset-4">
            <span
              aria-hidden
              className="block truncate border-b border-current pr-8 pb-2 text-[clamp(1.25rem,2.2vw,1.75rem)] font-semibold tracking-[-0.02em]"
            >
              {item.name}
            </span>
            <select
              value={item.id}
              onChange={(e) => {
                setId(e.target.value);
                setCopied(false);
              }}
              className="absolute inset-0 w-full cursor-pointer appearance-none text-body opacity-0"
            >
              {/* One kind needs no group headings; several get one each. */}
              {GROUPS.length > 1
                ? GROUPS.map((group) => (
                    <optgroup key={group.kind} label={group.label}>
                      {itemOptions(group.items)}
                    </optgroup>
                  ))
                : itemOptions(ITEMS)}
            </select>
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
          </span>
        </label>

        {/* Every bundle's facts share one cell, all but the chosen one
            invisible, so a long license or source that wraps on a narrow
            screen doesn't resize the column. Beside the terminal, the source
            row sinks to its bottom edge. */}
        <div className="grid flex-1">
          {ITEMS.map((i) => {
            const chosen = i.id === item.id;
            return (
              <div
                key={i.id}
                aria-hidden={!chosen || undefined}
                className={`grid grid-cols-2 content-between gap-y-4 [grid-area:1/1] ${chosen ? "" : "invisible"}`}
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

        <pre className="m-0 grid px-[18px] pt-[18px] pb-4 font-[inherit] break-all whitespace-pre-wrap">
          {ALL_LINES.map((line) => (
            <span
              key={line.key}
              aria-hidden
              className="invisible [grid-area:1/1]"
            >
              {line.prompt} {line.command}
            </span>
          ))}
          <span className="[grid-area:1/1]">
            <span className="prompt select-none">{shell.prompt} </span>
            <code ref={codeRef}>{command}</code>
          </span>
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
