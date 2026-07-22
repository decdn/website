import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/*.test.ts"],
    // `.claude/worktrees/**` holds full checkouts (with their own
    // node_modules) — without it, dependency test suites run as ours.
    exclude: ["node_modules/**", ".next/**", "out/**", ".claude/worktrees/**"],
  },
});
