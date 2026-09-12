# 03: Loading & error states pass

**What to build:** Replace the bare `"Loading..."` text and plain red error lines currently on the adventures list (`src/app/page.tsx`), create-adventure (`src/app/adventures/new/page.tsx`), and adventure-detail (`src/app/adventures/[id]/page.tsx`) pages with a consistent, on-theme loading indicator and a retry-capable error card. Also make sure a genuine backend failure (a `502`/`500`-class response, now returned as clean JSON per the `AdventurePlanError`/`EncounterError`-adjacent fix already shipped) reads as an obvious "something went wrong, try again" state rather than a bare error string.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] Loading state on all three pages uses a consistent pixel-art-themed indicator, not bare text
- [x] Error state on all three pages uses a consistent card/style, distinguishes a retryable failure (network/AI/Overpass) from a hard failure (404/not found), and offers a retry action where retrying makes sense (TanStack Query `refetch`/mutation retry)
- [x] `useCheckArrival`/`useEncounter`/`useSendChoice`/`useCreateAdventure` error displays on `/adventures/[id]` and `/adventures/new` reuse the same error-card component instead of ad hoc `<p className="text-destructive">` lines
- [x] `pnpm build`/`lint`/`test` pass

## Answer

New `src/components/ui/status.tsx` (`LoadingState`/`ErrorState`) reused across all three pages and all four mutation error sites.

Code review caught two real gaps in the first pass, both fixed:
- The 404/retryable distinction wasn't actually implemented — `fetchJson` discards HTTP status, so a genuinely-missing adventure (`GET /api/adventures/:id` → `404 {"error":"Not found"}`) was getting the same "Try again" retry button as a transient failure. Fixed by checking `error.message === "Not found"` (the route's literal message) and suppressing `onRetry` for that case in `src/app/adventures/[id]/page.tsx`.
- `createAdventure.error`'s "Try again" button didn't retry anything, just cleared the error banner (`reset()`). Removed `onRetry` from that one call site — the form's own "Create Adventure" button below is the real retry action.
