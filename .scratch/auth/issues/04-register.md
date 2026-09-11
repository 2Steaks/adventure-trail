Status: resolved
Type: task
Blocked by: 01, 02

# 04 - Register (route handler + page + hook)

**Description:** `src/app/api/auth/register/route.ts` validates with `authCredentialsSchema`, calls `supabase.auth.signUp()`. `src/app/register/page.tsx` is an email+password form. `src/lib/auth/hooks.ts` gets a `useRegister()` TanStack Query mutation wrapping the fetch call. On success, redirect to `/`.

**Two more bugs found by testing manually, not by any written test:**
1. `POST /api/auth/register` was itself being redirected to `/login` by the Proxy — `/api/auth/**` wasn't in `isPublicPath`'s allowlist (only `/login`/`/register`/`/auth` were). Added `/api/auth` as a prefix, TDD (3 new cases added to `public-paths.test.ts`, confirmed failing, then fixed).
2. This Supabase project has email confirmation enabled by default (`mailer_autoconfirm: false`), which would block a newly registered user from logging in immediately — contradicting `ROADMAP.md`'s "bare minimum, no email verification" decision. Fixed via a scoped Management API call (`PATCH .../config/auth {"mailer_autoconfirm": true}`), not `supabase config push` (which would have pushed 12 unrelated local-vs-remote diffs — MFA toggles, Twilio SMS, DB pooler sizes, `site_url` — the CLI's own help text warns about exactly this). Verified only the intended field changed via `supabase config diff` before/after (13 diffs → 12). Confirmed with you before touching this live project setting.

**Acceptance criteria:**
- [x] Invalid body (bad email / short password) returns `400` with a message, before Supabase is ever called
- [x] Valid body calls `signUp`; success returns `200` (page-level redirect verified manually with a browser-equivalent curl flow, not yet a real browser session — see task 05 for the full cookie-based login verification)
- [x] `/register` reachable while logged out — confirmed after fixing bug 1 above
- [ ] Supabase error (e.g. duplicate email) shown inline on the form — not yet manually verified with a real duplicate; will confirm alongside task 05/06's end-to-end pass

**Verification:**
- [x] `pnpm build`/`lint` pass
- [x] Manual: registered a real test account (`dm-ai-test-user@gmail.com`) against the local dev server hitting the live Supabase project — flagging this test account exists; delete it from the Supabase dashboard if you don't want it lingering

**Dependencies:** 01, 02

**Files likely touched:**
- `src/app/api/auth/register/route.ts`
- `src/app/register/page.tsx`
- `src/lib/auth/hooks.ts`

**Estimated scope:** Medium (new route + page + hook, first vertical slice)
