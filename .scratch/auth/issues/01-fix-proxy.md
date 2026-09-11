Status: open
Type: task
Blocked by: none

# 01 - Fix the inert Proxy (move + matcher + regression test)

**Description:** Delete the repo-root `proxy.ts` and keep only `src/proxy.ts` (Next 16 requires it alongside `app/`, which lives at `src/app/` — the root copy has been completely inert since Foundation). Add `/register` to `src/lib/supabase/proxy.ts`'s public-path allowlist (currently only `/login`/`/auth`). Write a regression test first using `unstable_doesProxyMatch` against the *current* broken state to confirm it fails, then apply the fix, confirm it passes.

**Acceptance criteria:**
- [ ] Exactly one `proxy.ts` exists, at `src/proxy.ts`
- [ ] `/`, and any other non-auth path, redirects unauthenticated requests to `/login`
- [ ] `/login` and `/register` do not redirect
- [ ] Regression test written first, observed failing against the pre-fix state, passing after

**Verification:**
- [ ] `pnpm test` passes
- [ ] Manual: `curl -D - http://localhost:3000/` while logged out shows `307` → `/login`; same for `/login` and `/register` shows `200`

**Dependencies:** None

**Files likely touched:**
- `proxy.ts` (deleted)
- `src/proxy.ts` (new, moved)
- `src/lib/supabase/proxy.ts` (add `/register` to allowlist)
- `src/proxy.test.ts` or similar (regression test)

**Estimated scope:** Small (few files), High risk (affects routing for the whole app)
