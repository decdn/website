"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { highlightBrand } from "@/components/ui/brand";
import { Figure } from "@/components/ui/Figure";
import { TRY_HEADLINE, TRY_LEAD, TRY_NOTES } from "@/lib/copy";
import {
  MODELS,
  PLATFORMS,
  type Platform,
  detectPlatform,
  formatSize,
  pullCommand,
} from "@/lib/models";

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
 * The hero's closing block: pick a seeded model, copy the one line that pulls
 * it. Unlike HeroTerminal above it, this panel is real and not aria-hidden:
 * the command is the product's actual install-and-download line.
 */
export function TryIt() {
  const [id, setId] = useState(MODELS[0]?.id ?? "");
  const detected = useSyncExternalStore(
    subscribeNever,
    clientPlatform,
    serverPlatform,
  );
  const [chosen, setPlatform] = useState<Platform | null>(null);
  const platform = chosen ?? detected;
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  const model = MODELS.find((m) => m.id === id) ?? MODELS[0];
  const shell = PLATFORMS.find((p) => p.id === platform) ?? PLATFORMS[0];
  if (!model || !shell) return null;
  const command = pullCommand(model.hash, platform);

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
      id="try"
      data-reveal
      className="mt-16 flex scroll-mt-[var(--nav-h)] flex-col gap-8 @4xl:mt-24"
    >
      <span aria-hidden className="rule opacity-50" />

      <div className="flex flex-col gap-6">
        <h2
          id="try-h"
          className="hug text-h3 leading-[0.95] font-semibold tracking-[-0.03em]"
        >
          {TRY_HEADLINE}
        </h2>
        <p className="max-w-[64ch] text-body leading-[1.65]">
          {highlightBrand(TRY_LEAD)}
        </p>
      </div>

      <div className="grid gap-10 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] @4xl:items-start @4xl:gap-12">
        <div className="flex flex-col gap-8">
          <label className="flex flex-col gap-3">
            <span className="meta opacity-60">model</span>
            <span className="relative">
              <select
                value={model.id}
                onChange={(e) => {
                  setId(e.target.value);
                  setCopied(false);
                }}
                className="w-full cursor-pointer appearance-none truncate border-b border-current bg-transparent pr-8 pb-2 text-[clamp(1.25rem,2.2vw,1.75rem)] font-semibold tracking-[-0.02em] focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                {MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <span
                aria-hidden
                className="pointer-events-none absolute right-1 bottom-3 text-body opacity-60"
              >
                ▾
              </span>
            </span>
          </label>

          <div className="grid grid-cols-2 gap-y-4">
            <Figure label="size" value={formatSize(model.bytes)} />
            <Figure label="license" value={model.license} />
            <div className="col-span-2 flex flex-col gap-1">
              <span className="meta opacity-60">source</span>
              <a
                className="self-start text-body font-medium tracking-[-0.01em] break-all underline decoration-1 underline-offset-4 hover:decoration-whisper"
                href={`https://huggingface.co/${model.repo}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {model.repo}
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
    </div>
  );
}
