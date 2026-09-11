Status: resolved
Type: task
Blocked by: none

# 01 - Fix the inert Proxy (move + matcher + regression test)

**Description:** Delete the repo-root `proxy.ts` and keep only `src/proxy.ts` (Next 16 requires it alongside `app/`, which lives at `src/app/` — the root copy has been completely inert since Foundation). Add `/register` to `src/lib/supabase/proxy.ts`'s public-path allowlist (currently only `/login`/`/auth`). Write a regression test first against the *current* broken state to confirm it fails, then apply the fix, confirm it passes.

**Deviation from the SPEC's stated approach:** `unstable_doesProxyMatch`/`unstable_doesMiddlewareMatch` (the actual export name in this installed Next version — the bundled docs call it `doesProxyMatch`, the shipped code still says `doesMiddlewareMatch`, more drift) throws `AsyncLocalStorage accessed in runtime where it is not available` when imported outside a full Next server context — confirmed by trying it directly. Not worth fighting an `unstable_`-prefixed experimental API for this. Instead: extracted the path-exclusion check into a plain `isPublicPath()` function (trivially unit-testable, no Next runtime needed), and added a second test that directly checks file existence (`src/proxy.ts` present, root `proxy.ts` absent) — which is what actually catches *this specific* bug, since a matcher-content test alone can't detect "file is in the wrong directory and never loads."

**Acceptance criteria:**
- [x] Exactly one `proxy.ts` exists, at `src/proxy.ts`
- [x] `/`, and any other non-auth path, redirects unauthenticated requests to `/login`
- [x] `/login` and `/register` do not redirect
- [x] Both regression tests (`isPublicPath` unit tests, file-location test) written first, observed failing, passing after the fix

**Verification:**
- [x] `pnpm test` passes (17/17)
- [x] Manual, live dev server: `/` → `307` → `/login`; `/login` and `/register` → `404` (pages don't exist yet, but critically *not* redirected — no loop)
- [x] `pnpm build` output now shows `ƒ Proxy (Middleware)` as a compiled artifact — absent from every prior build, concrete proof it was never even recognized before

**Dependencies:** None

**Files likely touched:**
- `proxy.ts` (deleted)
- `src/proxy.ts` (new, moved)
- `src/lib/supabase/proxy.ts` (add `/register` to allowlist)
- `src/proxy.test.ts` or similar (regression test)

**Estimated scope:** Small (few files), High risk (affects routing for the whole app)

## Answer

Done. **Second bug found while verifying live, not caught by any local test:** the fix made the Proxy actually call `createServerClient(process.env.SUPABASE_URL!, ...)` in production for the first time — and Vercel had **zero environment variables configured at all** (`vercel env ls` returned none). Foundation's deployment looked fine (`200`) purely because the inert Proxy never reached that code. The live preview for this PR returned `500` until `SUPABASE_URL`/`SUPABASE_PUBLISHABLE_KEY` were added to Vercel (Production + Preview + Development, with your explicit confirmation first since it touches production config). Re-verified after redeploy: `307 → /login`, and existing production (not yet carrying this fix) still `200`.

