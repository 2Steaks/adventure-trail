Status: resolved (pending live confirmation once pushed)
Type: task
Blocked by: 01, 02, 03, 04, 05, 06

# 08 - CI workflow (lint/test/build on PRs)

**Description:** Add `.github/workflows/ci.yml` running `pnpm install`, `pnpm lint`, `pnpm test`, `pnpm build` on every pull request. This is what makes every later module's PR (per `ROADMAP.md`'s Delivery workflow) actually "testable" rather than a promise.

**Acceptance criteria:**
- [x] Workflow triggers on `pull_request` and `push` to `main`
- [x] Runs lint, test, and build steps using the pinned pnpm version (`11.24.0`) and Node 26 (matching local dev)
- [x] Fails the check if any step fails (no `continue-on-error`, default `pnpm` non-zero exit propagates)

**Verification:**
- [ ] Push this branch / open its PR and confirm the Actions run appears and passes — **not yet verified live**, no way to check from this sandbox before pushing; will confirm once the PR is open

**Note:** `pnpm build`'s step passes `SUPABASE_URL`/`SUPABASE_PUBLISHABLE_KEY` from GitHub secrets — not needed yet (no page calls Supabase during build), but forward-compatible for when `auth`/`persistence` add server components that do. If those secrets aren't configured in the repo yet, they just resolve to empty strings — harmless until a page actually needs them.

**Dependencies:** 01–06 (needs lint/test/build to actually be green first, otherwise the first CI run is a false failure)

**Files likely touched:**
- `.github/workflows/ci.yml`

**Estimated scope:** Extra small
