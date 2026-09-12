# 03: Loading & error states pass

**What to build:** Replace the bare `"Loading..."` text and plain red error lines currently on the adventures list (`src/app/page.tsx`), create-adventure (`src/app/adventures/new/page.tsx`), and adventure-detail (`src/app/adventures/[id]/page.tsx`) pages with a consistent, on-theme loading indicator and a retry-capable error card. Also make sure a genuine backend failure (a `502`/`500`-class response, now returned as clean JSON per the `AdventurePlanError`/`EncounterError`-adjacent fix already shipped) reads as an obvious "something went wrong, try again" state rather than a bare error string.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Loading state on all three pages uses a consistent pixel-art-themed indicator, not bare text
- [ ] Error state on all three pages uses a consistent card/style, distinguishes a retryable failure (network/AI/Overpass) from a hard failure (404/not found), and offers a retry action where retrying makes sense (TanStack Query `refetch`/mutation retry)
- [ ] `useCheckArrival`/`useEncounter`/`useSendChoice`/`useCreateAdventure` error displays on `/adventures/[id]` and `/adventures/new` reuse the same error-card component instead of ad hoc `<p className="text-destructive">` lines
- [ ] `pnpm build`/`lint`/`test` pass
