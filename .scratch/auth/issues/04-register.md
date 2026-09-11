Status: open
Type: task
Blocked by: 01, 02

# 04 - Register (route handler + page + hook)

**Description:** `src/app/api/auth/register/route.ts` validates with `authCredentialsSchema`, calls `supabase.auth.signUp()`. `src/app/register/page.tsx` is an email+password form. `src/lib/auth/hooks.ts` gets a `useRegister()` TanStack Query mutation wrapping the fetch call. On success, redirect to `/`.

**Acceptance criteria:**
- [ ] Invalid body (bad email / short password) returns `400` with a message, before Supabase is ever called
- [ ] Valid body calls `signUp`; success redirects to `/`
- [ ] Supabase error (e.g. duplicate email) shown inline on the form
- [ ] `/register` reachable while logged out (depends on task 01's fix)

**Verification:**
- [ ] `pnpm build`/`lint` pass
- [ ] Manual: register a real (test) account against the live preview, land on `/`

**Dependencies:** 01, 02

**Files likely touched:**
- `src/app/api/auth/register/route.ts`
- `src/app/register/page.tsx`
- `src/lib/auth/hooks.ts`

**Estimated scope:** Medium (new route + page + hook, first vertical slice)
