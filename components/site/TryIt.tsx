"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { TryPicker } from "@/components/site/TryPicker";
import { TRY_NOTES } from "@/lib/copy";
import {
  ITEMS,
  PLATFORMS,
  type Platform,
  detectPlatform,
  formatSize,
  pullCommand,
  sourceLabel,
} from "@/lib/models";

const COPIED_MS = 2000;

/** How long a picked item's command takes to type itself out. */
const TYPE_MS = 350;

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

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The interactive half of the #try section: pick a seeded item from the boxes,
 * copy the one line that pulls it. Unlike HeroTerminal, this panel is real and
 * not aria-hidden: the command is the product's actual install-and-download
 * line.
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
  // Picking a box types its command out; null means the full line shows.
  // Only a pick animates: first paint, the hydration swap to PowerShell and
  // the OS toggle all render the whole line at once.
  const [typingFrom, setTypingFrom] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typingFrom === null) return;
    let frame = requestAnimationFrame(function tick(t) {
      if (t - typingFrom >= TYPE_MS) {
        setTypingFrom(null);
        return;
      }
      setNow(t);
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [typingFrom]);

  const item = ITEMS.find((i) => i.id === id) ?? ITEMS[0];
  const shell = PLATFORMS.find((p) => p.id === platform) ?? PLATFORMS[0];
  if (!item || !shell) return null;
  const command = pullCommand(item.hash, platform, item.namespace);
  const typed =
    typingFrom === null
      ? command
      : command.slice(
          0,
          Math.ceil((command.length * Math.max(0, now - typingFrom)) / TYPE_MS),
        );

  function select(next: string) {
    setId(next);
    setCopied(false);
    if (prefersReducedMotion()) {
      setTypingFrom(null);
      return;
    }
    const start = performance.now();
    setNow(start);
    setTypingFrom(start);
  }

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
    // Finish any typing first, so a fallback selection takes the whole line.
    flushSync(() => setTypingFrom(null));
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
      className="grid gap-10 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] @4xl:items-start @4xl:gap-12"
    >
      <TryPicker selectedId={item.id} onSelect={select} />

      <div className="terminal flex flex-col @4xl:sticky @4xl:top-28">
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
                  setTypingFrom(null);
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

        <pre className="m-0 flex flex-col gap-1 px-[18px] pt-[18px] pb-4 font-[inherit] break-all whitespace-pre-wrap">
          <span className="dim">
            # {item.name}, {formatSize(item.bytes)}, {item.license}
          </span>
          <span className="dim">
            # source:{" "}
            <a
              className="underline decoration-1 underline-offset-4 hover:decoration-whisper"
              href={item.source}
              target="_blank"
              rel="noopener noreferrer"
            >
              {sourceLabel(item.source)}
            </a>
          </span>
          <span className="mt-2">
            <span className="prompt select-none">{shell.prompt} </span>
            <code ref={codeRef}>{typed}</code>
            <span className="cursor" aria-hidden />
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
