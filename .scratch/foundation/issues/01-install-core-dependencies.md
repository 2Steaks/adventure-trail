Status: open
Type: task
Blocked by: none

# 01 - Install core dependencies + Vitest harness

**Description:** Install the packages `SPEC-foundation.md`'s Tech Stack calls for but aren't in `package.json` yet: `zod`, `@tanstack/react-query`, and the Vitest test harness (`vitest`, `@vitejs/plugin-react`, `@testing-library/react`, `@testing-library/jest-dom` v6+, `jsdom`). Add `vitest.config.ts`, `vitest.setup.ts`, and `"test"` / `"test:watch"` scripts to `package.json`.

**Acceptance criteria:**
- [ ] `zod` and `@tanstack/react-query` are dependencies; the Vitest stack is a devDependency
- [ ] `vitest.setup.ts` imports `@testing-library/jest-dom/vitest`, referenced via `test.setupFiles` in `vitest.config.ts`
- [ ] `pnpm test` runs Vitest (zero tests is fine at this point) without config errors
- [ ] `pnpm build` still succeeds after the dependency bump

**Verification:**
- [ ] `pnpm test` — exits 0
- [ ] `pnpm build` — exits 0
- [ ] Manual check: `vitest.config.ts` excludes itself from the Next.js TypeScript build (`tsconfig.json`'s `include` shouldn't choke on it)

**Dependencies:** None

**Files likely touched:**
- `package.json`
- `pnpm-lock.yaml`
- `vitest.config.ts`
- `vitest.setup.ts`

**Estimated scope:** Small (config-only, no app logic)
