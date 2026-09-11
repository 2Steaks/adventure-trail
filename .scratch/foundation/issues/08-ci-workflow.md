Status: open
Type: task
Blocked by: 01, 02, 03, 04, 05, 06

# 08 - CI workflow (lint/test/build on PRs)

**Description:** Add `.github/workflows/ci.yml` running `pnpm install`, `pnpm lint`, `pnpm test`, `pnpm build` on every pull request. This is what makes every later module's PR (per `ROADMAP.md`'s Delivery workflow) actually "testable" rather than a promise.

**Acceptance criteria:**
- [ ] Workflow triggers on `pull_request` (and reasonably on `push` to `main`)
- [ ] Runs lint, test, and build steps using the pinned pnpm version
- [ ] Fails the check if any step fails

**Verification:**
- [ ] Push this branch / open its PR and confirm the Actions run appears and passes

**Dependencies:** 01–06 (needs lint/test/build to actually be green first, otherwise the first CI run is a false failure)

**Files likely touched:**
- `.github/workflows/ci.yml`

**Estimated scope:** Extra small
