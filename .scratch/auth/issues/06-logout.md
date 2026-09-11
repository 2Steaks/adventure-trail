Status: open
Type: task
Blocked by: 01, 05

# 06 - Logout (route handler + hook + button)

**Description:** `src/app/api/auth/logout/route.ts` calls `supabase.auth.signOut()`. `useLogout()` mutation added to `src/lib/auth/hooks.ts`. A visible logout button on `src/app/page.tsx` (safe to show unconditionally now that `/` requires auth — per task 01's fix, only an authenticated user ever reaches it). On success, redirect to `/login`.

**Acceptance criteria:**
- [ ] `POST /api/auth/logout` calls `signOut()` regardless of whether a session exists (no-op if not, per Supabase's own behavior)
- [ ] Logout button visible on `/`, triggers the mutation, redirects to `/login` on success
- [ ] After logout, `/` redirects to `/login` again (proves the session was actually cleared, not just a client-side redirect)

**Verification:**
- [ ] `pnpm build`/`lint` pass
- [ ] Manual: full loop on the live preview — register → land on `/` → log out → redirected to `/login` → confirm `/` now redirects again

**Dependencies:** 01, 05 (needs a real logged-in session to test against)

**Files likely touched:**
- `src/app/api/auth/logout/route.ts`
- `src/app/page.tsx`
- `src/lib/auth/hooks.ts`

**Estimated scope:** Small
