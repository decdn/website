"use client";

import { type ComponentProps, useRef, useState } from "react";

const COPIED_MS = 2000;

/**
 * A fenced code block in an MDX post, with a copy button. Stands in for the
 * `pre` element MDX renders, so the block keeps its `.prose pre` styling.
 */
export function CodeBlock(props: ComponentProps<"pre">) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  function flashCopied() {
    setCopied(true);
    window.setTimeout(() => setCopied(false), COPIED_MS);
  }

  // Selects the block, then tries the legacy copy path. Where even that is
  // blocked, the block is left selected for the reader to copy by hand.
  function selectAndCopy(pre: HTMLPreElement) {
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    range.selectNodeContents(pre);
    selection.removeAllRanges();
    selection.addRange(range);
    if (document.execCommand("copy")) flashCopied();
  }

  async function copy() {
    const pre = preRef.current;
    if (!pre) return;
    try {
      await navigator.clipboard.writeText(pre.textContent.replace(/\n$/, ""));
      flashCopied();
    } catch {
      selectAndCopy(pre);
    }
  }

  return (
    <div className="code-block">
      <pre ref={preRef} {...props} />
      <button
        type="button"
        onClick={copy}
        className="code-copy meta"
        aria-live="polite"
      >
        {copied ? "copied ✓" : "copy"}
      </button>
    </div>
  );
}
