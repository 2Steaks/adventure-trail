Status: resolved
Type: task
Blocked by: 01, 05

# 06 - Logout (route handler + hook + button)

**Description:** `src/app/api/auth/logout/route.ts` calls `supabase.auth.signOut()`. `useLogout()` mutation added to `src/lib/auth/hooks.ts`. A visible logout button on `src/app/page.tsx` (safe to show unconditionally now that `/` requires auth — per task 01's fix, only an authenticated user ever reaches it). On success, redirect to `/login`.

Implemented as a small extracted client component (`src/components/auth/logout-button.tsx`) rather than making the whole page a client component, keeping `src/app/page.tsx` a server component.

**Acceptance criteria:**
- [x] `POST /api/auth/logout` calls `signOut()` regardless of whether a session exists (no-op if not, per Supabase's own behavior)
- [x] Logout button visible on `/`, triggers the mutation, redirects to `/login` on success
- [x] After logout, `/` redirects to `/login` again (proves the session was actually cleared, not just a client-side redirect)

**Verification:**
- [x] `pnpm build`/`lint` pass (26/26 tests)
- [x] Manual, full loop against local dev + the live Supabase project: login (`200`) → `/` while authenticated (`200`) → logout (`200`) → `/` afterward (`307 → /login`, proving real invalidation) → wrong password on a fresh attempt (`401`, `"Invalid login credentials"`) — closes the acceptance criterion deferred from task 05

**Dependencies:** 01, 05 (needs a real logged-in session to test against)

**Files likely touched:**
- `src/app/api/auth/logout/route.ts`
- `src/app/page.tsx`
- `src/lib/auth/hooks.ts`

**Estimated scope:** Small
