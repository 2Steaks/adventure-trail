# 07: Resume verification pass

**What to build:** `ROADMAP.md` Phase 7's exit checkpoint: *Play → complete quest → close browser → reopen → same progress.* This is the phase's final verification pass over everything tickets 01-06 touched — confirm the resume flow still holds end-to-end, and fix any refetch/state regression those tickets introduced (e.g. stale TanStack Query cache on remount, an animation/celebration state that doesn't reset correctly after a reload mid-quest).

**Blocked by:** 01 (outdoor-readability), 02 (touch target audit), 03 (loading & error states), 04 (arrival celebration), 05 (quest transitions), 06 (safe-area handling)

**Status:** ready-for-agent

- [ ] Manually verified on a live Vercel preview: create an adventure, walk to (or otherwise reach) arrival, complete a quest via an encounter, close the browser tab entirely, reopen `/adventures/[id]`, and confirm the same quest/inventory/adventure-status state is shown
- [ ] No stale-cache regression on remount (TanStack Query refetches or has correct `staleTime` behavior for the adventure-detail query)
- [ ] Any celebration/transition state (tickets 04/05) that was mid-flight when the browser closed doesn't get stuck or replay incorrectly on reopen
- [ ] `pnpm build`/`lint`/`test` pass; this ticket is the final sign-off for Phase 7's exit checkpoint
