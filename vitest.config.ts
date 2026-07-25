import { defineConfig } from "vitest/config";

export default defineConfig({
  // Resolve the `@/*` alias from tsconfig.json so tests (and the modules they
  // import) can use `@/lib/...` instead of relative paths. Two suites depend on
  // it: `lib/legal.test.ts` (whose subject imports `@/lib/metadata`) and
  // `app/blog/jsonld.test.ts`, which renders route components that import
  // `@/lib/...` — that is what makes anything under app/ unit-testable.
  //
  // Native to the vite bundled with vitest, so no `vite-tsconfig-paths` plugin
  // is needed. Marked `@experimental` in vite 8's types, so re-check it on the
  // next major upgrade rather than assuming the plugin is still redundant.
  resolve: { tsconfigPaths: true },
  test: {
    include: ["**/*.test.ts"],
    // `.claude/worktrees/**` holds full checkouts (with their own
    // node_modules) — without it, dependency test suites run as ours.
    exclude: ["node_modules/**", ".next/**", "out/**", ".claude/worktrees/**"],
  },
});
