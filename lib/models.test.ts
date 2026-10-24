import { describe, expect, it } from "vitest";
import {
  HASH_RE,
  ITEMS,
  type Item,
  KINDS,
  bundleUri,
  detectPlatform,
  formatSize,
  getCommand,
  groupByKind,
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

  // The first item is the one selected by default, so a first pull finishes
  // on a laptop (decdn/website#336).
  it("leads with the ~500 MB try-it bundle", () => {
    const hex =
      "d0a3eac609db6f49de12213574a302e42afd45f15b2cd89aa46b8a3e91f74d13";
    const first = ITEMS[0]!;
    expect(first.id).toBe("qwen-qwen2.5-0.5b-instruct-q4_k_m-gguf");
    expect(first.hash).toBe(`b3:${hex}`);
    expect(first.bytes).toBe(491_400_032);
    expect(formatSize(first.bytes)).toBe("0.5 GB");
    expect(getCommand(first.hash, "unix", first.namespace, first.entry)).toBe(
      `curl -fsSL https://up.decdn.org/decdn.sh | sh -s -- get 'decdn:${hex}/?ns=1'`,
    );
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

describe("bundleUri", () => {
  const hex = "ab".repeat(32);

  it("names the bundle by its bare hash with a trailing slash", () => {
    expect(bundleUri(`b3:${hex}`)).toBe(`decdn:${hex}/`);
  });

  it("carries the namespace as ?ns=", () => {
    expect(bundleUri(`b3:${hex}`, 1)).toBe(`decdn:${hex}/?ns=1`);
  });

  it("takes placeholders for prose", () => {
    expect(bundleUri("b3:<hash>", "<namespace>")).toBe(
      "decdn:<hash>/?ns=<namespace>",
    );
  });

  it("names one entry by its manifest path", () => {
    expect(bundleUri(`b3:${hex}`, 1, "sintel-4k-mkv/Sintel.2010.4k.mkv")).toBe(
      `decdn:${hex}/sintel-4k-mkv/Sintel.2010.4k.mkv?ns=1`,
    );
  });

  it("percent-encodes each entry segment, quotes included", () => {
    expect(bundleUri(`b3:${hex}`, undefined, "a dir/it's?#.iso")).toBe(
      `decdn:${hex}/a%20dir/it%27s%3F%23.iso`,
    );
  });
});

describe("getCommand", () => {
  const hex = "ab".repeat(32);
  const hash = `b3:${hex}`;

  it("installs and gets the bundle URI in one line", () => {
    expect(getCommand(hash)).toBe(
      `curl -fsSL https://up.decdn.org/decdn.sh | sh -s -- get 'decdn:${hex}/'`,
    );
  });

  it("passes the namespace in the URI when the item has one", () => {
    expect(getCommand(hash, "unix", 1)).toBe(
      `curl -fsSL https://up.decdn.org/decdn.sh | sh -s -- get 'decdn:${hex}/?ns=1'`,
    );
    expect(getCommand(hash, "windows", 1)).toBe(
      `& ([scriptblock]::Create((irm https://up.decdn.org/decdn.ps1))) get 'decdn:${hex}/?ns=1'`,
    );
  });

  it("gets a single-file bundle's entry by its path", () => {
    expect(getCommand(hash, "unix", 1, "dir/file.iso")).toBe(
      `curl -fsSL https://up.decdn.org/decdn.sh | sh -s -- get 'decdn:${hex}/dir/file.iso?ns=1'`,
    );
  });

  it("installs and gets from PowerShell on Windows", () => {
    expect(getCommand(hash, "windows")).toBe(
      `& ([scriptblock]::Create((irm https://up.decdn.org/decdn.ps1))) get 'decdn:${hex}/'`,
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
