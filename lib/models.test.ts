import { describe, expect, it } from "vitest";
import {
  HASH_RE,
  ITEMS,
  type Item,
  KINDS,
  detectPlatform,
  formatSize,
  groupByKind,
  pullCommand,
  sourceLabel,
} from "@/lib/models";

describe("launch catalogue", () => {
  it("offers at least one item", () => {
    expect(ITEMS.length).toBeGreaterThan(0);
  });

  it("carries a well-formed b3 hash for every item", () => {
    for (const item of ITEMS) {
      expect(item.hash, item.id).toMatch(HASH_RE);
    }
  });

  it("publishes every item under a namespace >= 1", () => {
    for (const item of ITEMS) {
      expect(Number.isInteger(item.namespace), item.id).toBe(true);
      expect(item.namespace, item.id).toBeGreaterThanOrEqual(1);
    }
  });

  it("gives every item a known kind and an https source", () => {
    const kinds: readonly string[] = KINDS.map((k) => k.id);
    for (const item of ITEMS) {
      expect(kinds, item.id).toContain(item.kind);
      expect(new URL(item.source).protocol, item.id).toBe("https:");
    }
  });

  it("has unique ids and hashes", () => {
    expect(new Set(ITEMS.map((i) => i.id)).size).toBe(ITEMS.length);
    expect(new Set(ITEMS.map((i) => i.hash)).size).toBe(ITEMS.length);
  });
});

describe("groupByKind", () => {
  const item = (id: string, kind: Item["kind"]): Item => ({
    id,
    kind,
    name: id,
    license: "CC-BY-4.0",
    source: "https://example.org/",
    hash: `b3:${"ab".repeat(32)}`,
    namespace: 1,
    bytes: 1,
  });

  it("orders groups by KINDS and drops empty kinds", () => {
    const groups = groupByKind([
      item("film", "video"),
      item("llm", "model"),
      item("distro", "iso"),
      item("llm-2", "model"),
    ]);
    expect(groups.map((g) => g.kind)).toEqual(["model", "iso", "video"]);
    expect(groups[0]?.items.map((i) => i.id)).toEqual(["llm", "llm-2"]);
  });
});

describe("sourceLabel", () => {
  it("shows the repo path for Hugging Face", () => {
    expect(
      sourceLabel("https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3"),
    ).toBe("mistralai/Mistral-7B-Instruct-v0.3");
  });

  it("shows host and path elsewhere, without a trailing slash", () => {
    expect(sourceLabel("https://www.openslr.org/resources/12/")).toBe(
      "www.openslr.org/resources/12",
    );
    expect(sourceLabel("https://releases.ubuntu.com/")).toBe(
      "releases.ubuntu.com",
    );
  });
});

describe("pullCommand", () => {
  it("installs and pulls by hash in one line", () => {
    const hash = `b3:${"ab".repeat(32)}`;
    expect(pullCommand(hash)).toBe(
      `curl -fsSL https://up.decdn.org/decdn.sh | sh -s -- pull ${hash}`,
    );
  });

  it("passes the namespace through when the model has one", () => {
    const hash = `b3:${"ab".repeat(32)}`;
    expect(pullCommand(hash, "unix", 1)).toBe(
      `curl -fsSL https://up.decdn.org/decdn.sh | sh -s -- pull ${hash} --namespace 1`,
    );
    expect(pullCommand(hash, "windows", 1)).toBe(
      `irm https://up.decdn.org/decdn.ps1 | iex; decdn-sponsored pull ${hash} --namespace 1`,
    );
  });

  it("installs and pulls from PowerShell on Windows", () => {
    const hash = `b3:${"ab".repeat(32)}`;
    expect(pullCommand(hash, "windows")).toBe(
      `irm https://up.decdn.org/decdn.ps1 | iex; decdn-sponsored pull ${hash}`,
    );
  });
});

describe("detectPlatform", () => {
  it("picks PowerShell only for Windows", () => {
    expect(detectPlatform("Windows")).toBe("windows");
    expect(detectPlatform("Win32")).toBe("windows");
    expect(
      detectPlatform("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130"),
    ).toBe("windows");
    expect(detectPlatform("macOS")).toBe("unix");
    expect(detectPlatform("MacIntel")).toBe("unix");
    expect(detectPlatform("Linux x86_64")).toBe("unix");
    expect(detectPlatform("Darwin")).toBe("unix");
  });
});

describe("formatSize", () => {
  it("renders decimal gigabytes to one place", () => {
    expect(formatSize(28_995_469_846)).toBe("29.0 GB");
    expect(formatSize(550_000_000)).toBe("0.6 GB");
  });
});
