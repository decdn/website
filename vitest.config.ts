import { defineConfig } from "vitest/config";

export default defineConfig({
  // Resolve the `@/*` alias from tsconfig.json so tests (and the modules
  // they import) can use `@/lib/...` instead of relative paths — this is
  // also what makes anything under app/ unit-testable. Native to the vite
  // bundled with vitest, so no `vite-tsconfig-paths` plugin is needed.
  resolve: { tsconfigPaths: true },
  test: {
    include: ["**/*.test.ts"],
    // `.claude/worktrees/**` holds full checkouts (with their own
    // node_modules) — without it, dependency test suites run as ours.
    exclude: ["node_modules/**", ".next/**", "out/**", ".claude/worktrees/**"],
  },
});
