import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { describe, expect, it } from "vitest";

// `canonical-host.js` ships as a plain browser script — Mintlify injects any
// `.js` in the content directory into every page as-is, so it must not carry
// ESM exports and therefore cannot be imported. Running the file in a `vm`
// sandbox whose only global is a stub `window` exercises the exact bytes that
// get served, with no test-only seam in the shipped file.
const SOURCE = fs.readFileSync(
  path.join(process.cwd(), "docs", "canonical-host.js"),
  "utf8",
);

/** Returns the URL the script redirected to, or null if it stayed put. */
function redirectFrom(
  hostname: string,
  pathname = "/overview/introduction",
  search = "",
  hash = "",
): string | null {
  let replaced: string | null = null;
  const window = {
    location: {
      hostname,
      pathname,
      search,
      hash,
      replace: (url: string) => {
        replaced = url;
      },
    },
  };
  vm.runInNewContext(SOURCE, { window });
  return replaced;
}

describe("canonical-host redirect", () => {
  it("redirects Mintlify's default hosts to the custom domain", () => {
    expect(redirectFrom("decdn.mintlify.app")).toBe(
      "https://docs.decdn.org/overview/introduction",
    );
    expect(redirectFrom("decdn.mintlify.site")).toBe(
      "https://docs.decdn.org/overview/introduction",
    );
  });

  it("preserves path, query and hash so deep links survive the hop", () => {
    expect(
      redirectFrom(
        "decdn.mintlify.app",
        "/protocol/payments",
        "?a=1",
        "#close",
      ),
    ).toBe("https://docs.decdn.org/protocol/payments?a=1#close");
  });

  it("leaves the canonical host alone", () => {
    expect(redirectFrom("docs.decdn.org")).toBeNull();
  });

  // The guard is an allowlist of the two duplicate hosts rather than
  // `!== "docs.decdn.org"` precisely so these keep working. Inverting it would
  // bounce every preview deployment and `mintlify dev` session to production,
  // making unpublished changes impossible to review — the regression this case
  // exists to catch.
  it("leaves preview deployments and local development alone", () => {
    expect(redirectFrom("decdn-abc123.mintlify.dev")).toBeNull();
    expect(redirectFrom("localhost")).toBeNull();
    expect(redirectFrom("127.0.0.1")).toBeNull();
  });
});
