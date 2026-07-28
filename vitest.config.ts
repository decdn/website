import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  // Mirrors the `@/*` → project-root mapping in tsconfig.json. Without it a
  // test can only reach modules that import relatively, which rules out the
  // route handlers and section components — every one of them imports
  // `@/lib/...`.
  //
  // Anchored on `@/` rather than bare `@`: a bare prefix also matches scoped
  // package names, so a future `@scope/pkg` import would be rewritten to
  // `<root>scope/pkg`. Resolving to the same absolute path the relative
  // specifiers produce keeps each module a single instance, so a module reached
  // both ways yields one set of exports rather than two.
  resolve: {
    alias: [{ find: /^@\//, replacement: root }],
  },
  test: {
    include: ["**/*.test.ts"],
    // `.claude/worktrees/**` holds full checkouts (with their own
    // node_modules) — without it, dependency test suites run as ours.
    exclude: ["node_modules/**", ".next/**", "out/**", ".claude/worktrees/**"],
  },
});
