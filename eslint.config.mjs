import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Mintlify docs source: not part of the website build.
    "docs/**",
    // Claude Code worktrees are duplicate checkouts of this repo — without
    // this, every finding gets reported once per worktree plus once here.
    ".claude/worktrees/**",
    // Vendored by `npx impeccable install`; refreshed with `npx impeccable update`.
    ".claude/skills/impeccable/**",
  ]),
  prettier,
]);

export default eslintConfig;
