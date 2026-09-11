Status: open
Type: task
Blocked by: 01, 02

# 03 - Adventures list (route handler + hook + page)

**Description:** `GET /api/adventures` (`src/app/api/adventures/route.ts`, same file as task 02's `POST`) calls `requireUser()`, returns only the caller's own adventures (RLS-backed, `requireUser()` as the real boundary per `auth`'s established pattern) with a computed progress (quests complete / total — trivially `0/1` or `1/1` for now, one quest per adventure). `useAdventures()` query hook added to `src/lib/adventures/hooks.ts`. `src/app/page.tsx` is replaced: renders the Adventures list (name, theme, age range, duration, status, progress, "Resume" → `/adventures/[id]`, "Create adventure" → `/adventures/new`). The logout button (from `auth` task 06) relocates from the old placeholder onto this page.

**Acceptance criteria:**
- [ ] `GET /api/adventures` returns `401` unauthenticated
- [ ] Authenticated, returns only the caller's own adventures — verified against a second test account
- [ ] `/` renders the list with all the fields above, sourced via `useAdventures()`
- [ ] Logout button still works from its new location on `/`
- [ ] Empty state (no adventures yet) still shows "Create adventure", doesn't error

**Verification:**
- [ ] `pnpm build`/`lint` pass
- [ ] Manual: as user A (with an adventure from task 02), confirm it appears on `/`; log in as a second test user B, confirm `/` is empty for B and `GET /api/adventures` doesn't return A's row

**Dependencies:** 01, 02 (needs a real adventure to display against)

**Files likely touched:**
- `src/app/api/adventures/route.ts`
- `src/app/page.tsx`
- `src/lib/adventures/hooks.ts`

**Estimated scope:** Medium
