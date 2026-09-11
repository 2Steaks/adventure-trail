Status: open
Type: task
Blocked by: 01, 02

# 05 - Login (route handler + page + hook)

**Description:** `src/app/api/auth/login/route.ts` validates with `authCredentialsSchema`, calls `supabase.auth.signInWithPassword()`. `src/app/login/page.tsx` is an email+password form. `useLogin()` mutation added to `src/lib/auth/hooks.ts`. On success, redirect to `/`.

**Acceptance criteria:**
- [ ] Invalid body returns `400` before Supabase is called
- [ ] Valid credentials call `signInWithPassword`; success redirects to `/`
- [ ] Invalid credentials show Supabase's returned error message inline (e.g. "Invalid login credentials")
- [ ] `/login` reachable while logged out (depends on task 01's fix)

**Verification:**
- [ ] `pnpm build`/`lint` pass
- [ ] Manual: log in with the account from task 04 against the live preview, land on `/`; then close browser, reopen, confirm still logged in (session persistence)

**Dependencies:** 01, 02

**Files likely touched:**
- `src/app/api/auth/login/route.ts`
- `src/app/login/page.tsx`
- `src/lib/auth/hooks.ts`

**Estimated scope:** Medium
