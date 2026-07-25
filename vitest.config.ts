import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Mirrors the `@/*` → project-root mapping in tsconfig.json. Without it a
  // test can only reach modules that import relatively, which rules out the
  // route handlers and section components — every one of them imports
  // `@/lib/...`. Resolving to the same absolute path the relative specifiers
  // produce also keeps a module a single instance, so `lib/jsonld`'s `JsonLd`
  // compares by identity across a route and its test.
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    include: ["**/*.test.ts"],
    // `.claude/worktrees/**` holds full checkouts (with their own
    // node_modules) — without it, dependency test suites run as ours.
    exclude: ["node_modules/**", ".next/**", "out/**", ".claude/worktrees/**"],
  },
});
