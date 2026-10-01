import { describe, expect, it } from "vitest";
import {
  HASH_RE,
  MODELS,
  detectPlatform,
  formatSize,
  pullCommand,
} from "@/lib/models";

describe("launch catalogue", () => {
  it("offers at least one model", () => {
    expect(MODELS.length).toBeGreaterThan(0);
  });

  it("carries a well-formed b3 hash for every model", () => {
    for (const model of MODELS) {
      expect(model.hash, model.id).toMatch(HASH_RE);
    }
  });

  it("publishes every model under a namespace >= 1", () => {
    for (const model of MODELS) {
      expect(Number.isInteger(model.namespace), model.id).toBe(true);
      expect(model.namespace, model.id).toBeGreaterThanOrEqual(1);
    }
  });

  it("has unique ids and hashes", () => {
    expect(new Set(MODELS.map((m) => m.id)).size).toBe(MODELS.length);
    expect(new Set(MODELS.map((m) => m.hash)).size).toBe(MODELS.length);
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
