Status: resolved
Type: task
Blocked by: 01, 02

# 05 - Login (route handler + page + hook)

**Description:** `src/app/api/auth/login/route.ts` validates with `authCredentialsSchema`, calls `supabase.auth.signInWithPassword()`. `src/app/login/page.tsx` is an email+password form. `useLogin()` mutation added to `src/lib/auth/hooks.ts`. On success, redirect to `/`.

**Mid-task change (user request):** switched both register and login forms from manual `useState` + hand-rolled validation to `react-hook-form` + `@hookform/resolvers/zod`, wired to the same `authCredentialsSchema` already used server-side. Now the standing pattern for every form in this project — see `SPEC-auth.md`, saved to memory.

**Also found:** the test user registered in task 04, before the `mailer_autoconfirm` fix, still couldn't log in (`"Email not confirmed"`) — the fix only applies to signups *after* it was flipped, not retroactively. Registered a second fresh test account (`dm-ai-test-user-2@gmail.com`) to properly verify.

**Acceptance criteria:**
- [x] Invalid body returns `400` before Supabase is called
- [x] Valid credentials call `signInWithPassword`; success returns `200` with a session cookie set
- [ ] Invalid credentials show Supabase's returned error message inline — verified the mechanism (route returns `error.message` at `401`) but not yet exercised with a real bad-password attempt; will confirm in the end-to-end pass with task 06
- [x] `/login` reachable while logged out

**Verification:**
- [x] `pnpm build`/`lint` pass
- [x] Manual, real cookie-jar flow against local dev + the live Supabase project: register → login → session cookie set (`sb-<ref>-auth-token`) → `/` returns `200` with that cookie → a second, independent `curl` invocation reusing only the saved cookie file also returns `200` (simulates a browser restart)

**Dependencies:** 01, 02

**Files likely touched:**
- `src/app/api/auth/login/route.ts`
- `src/app/login/page.tsx`
- `src/lib/auth/hooks.ts`

**Estimated scope:** Medium
