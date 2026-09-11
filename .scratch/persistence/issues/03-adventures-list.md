Status: resolved
Type: task
Blocked by: 01, 02

# 03 - Adventures list (route handler + hook + page)

**Description:** `GET /api/adventures` (`src/app/api/adventures/route.ts`, same file as task 02's `POST`) calls `requireUser()`, returns only the caller's own adventures (RLS-backed, `requireUser()` as the real boundary per `auth`'s established pattern) with a computed progress (quests complete / total — trivially `0/1` or `1/1` for now, one quest per adventure). `useAdventures()` query hook added to `src/lib/adventures/hooks.ts`. `src/app/page.tsx` is replaced: renders the Adventures list (name, theme, age range, duration, status, progress, "Resume" → `/adventures/[id]`, "Create adventure" → `/adventures/new`). The logout button (from `auth` task 06) relocates from the old placeholder onto this page.

Added a shared `serializeAdventure()` (`src/lib/adventures/serialize.ts`) mapping snake_case DB columns to the camelCase response shape `SPEC-persistence.md`'s Code Style calls for — used by both this route's `GET` and task 02's `POST` response (retroactively fixed to use it too, for consistency).

**Acceptance criteria:**
- [x] `GET /api/adventures` rejects unauthenticated (`307` via the Proxy, same nuance as task 02's `POST` note — `/api/adventures` isn't a public path)
- [x] Authenticated, returns only the caller's own adventures — verified against a second test account
- [x] `/` renders the list with all the fields above, sourced via `useAdventures()`
- [x] Logout button still works from its new location on `/`
- [x] Empty state (no adventures yet) still shows "Create adventure", doesn't error

**Verification:**
- [x] `pnpm build`/`lint`/`test` pass (31/31)
- [x] Manual: registered two fresh test accounts (A, B). Created an adventure as A; `GET /api/adventures` as A returned it with `questsTotal: 1, questsCompleted: 0`. `GET /api/adventures` as B returned `{"adventures":[]}` — confirms RLS + `requireUser()` scoping. Test adventure deleted afterward; both throwaway auth accounts left lingering (same as prior tasks).

**Dependencies:** 01, 02 (needs a real adventure to display against)

**Files likely touched:**
- `src/app/api/adventures/route.ts`
- `src/app/page.tsx`
- `src/lib/adventures/hooks.ts`

**Estimated scope:** Medium
