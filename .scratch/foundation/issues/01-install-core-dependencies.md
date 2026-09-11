Status: resolved
Type: task
Blocked by: none

# 01 - Install core dependencies + Vitest harness

**Description:** Install the packages `SPEC-foundation.md`'s Tech Stack calls for but aren't in `package.json` yet: `zod`, `@tanstack/react-query`, and the Vitest test harness (`vitest`, `@vitejs/plugin-react`, `@testing-library/react`, `@testing-library/jest-dom` v6+, `jsdom`). Add `vitest.config.ts`, `vitest.setup.ts`, and `"test"` / `"test:watch"` scripts to `package.json`.

**Acceptance criteria:**
- [x] `zod` and `@tanstack/react-query` are dependencies; the Vitest stack is a devDependency
- [x] `vitest.setup.ts` imports `@testing-library/jest-dom/vitest`, referenced via `test.setupFiles` in `vitest.config.mts`
- [x] `pnpm test` runs Vitest (zero tests is fine at this point) without config errors
- [x] `pnpm build` still succeeds after the dependency bump

**Verification:**
- [x] `pnpm test` — exits 0 (`passWithNoTests: true`, no test files yet)
- [x] `pnpm build` — exits 0 (a stale `.next/dev/types/validator.ts` from a prior `next dev` run caused an unrelated type error; cleared by `rm -rf .next` before rebuilding — not caused by this task)
- [x] Manual check: `tsconfig.json` already includes `**/*.mts`, so the config file type-checks cleanly; used `vitest.config.mts` (not `.ts`) to silence Vite's native-config-loader ESM/CJS warning without changing `package.json`'s module type

**Dependencies:** None

**Files likely touched:**
- `package.json`
- `pnpm-lock.yaml`
- `vitest.config.mts`
- `vitest.setup.ts`

**Estimated scope:** Small (config-only, no app logic)

## Answer

Done. `zod`, `@tanstack/react-query` added as dependencies; `vitest`, `@vitejs/plugin-react`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` as devDependencies. `pnpm test` / `pnpm test:watch` scripts added. One deviation from the original file name (`vitest.config.mts` instead of `.ts`) to avoid a Vite config-loader warning — noted in `tasks/plan.md` isn't required since it's a trivial naming detail, not an architecture decision.
