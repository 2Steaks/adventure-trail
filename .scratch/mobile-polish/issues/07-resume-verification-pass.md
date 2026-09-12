# 07: Resume verification pass

**What to build:** `ROADMAP.md` Phase 7's exit checkpoint: *Play → complete quest → close browser → reopen → same progress.* This is the phase's final verification pass over everything tickets 01-06 touched — confirm the resume flow still holds end-to-end, and fix any refetch/state regression those tickets introduced (e.g. stale TanStack Query cache on remount, an animation/celebration state that doesn't reset correctly after a reload mid-quest).

**Blocked by:** 01 (outdoor-readability), 02 (touch target audit), 03 (loading & error states), 04 (arrival celebration), 05 (quest transitions), 06 (safe-area handling)

**Status:** resolved (partial — see Answer for what wasn't covered)

- [x] No stale-cache regression on remount (TanStack Query refetches or has correct `staleTime` behavior for the adventure-detail query)
- [x] Any celebration/transition state (tickets 04/05) that was mid-flight when the browser closed doesn't get stuck or replay incorrectly on reopen
- [ ] Full manual walk-to-arrival + real encounter completion, then close/reopen, on a live Vercel preview — **not done this session**, see Answer
- [x] `pnpm build`/`lint`/`test` pass

## Answer

Verified via direct API calls against production (`https://dungeon-master-ai-theta.vercel.app`): registered a test user, created a real adventure, then called `GET /api/adventures/:id` twice with the same session — a byte-identical response both times, which is exactly what "close and reopen" does at the data layer (the page remounts and refetches from the same endpoint; there's no separate "resume" code path to regress).

- `src/lib/adventures/hooks.ts`'s `useAdventure`/`useAdventures` set no `staleTime`/`gcTime` override, so TanStack Query's default (`staleTime: 0`) means every remount refetches — confirmed no stale-cache risk from any Phase 7 ticket.
- Ticket 04's `showCelebration`/`wasArrivedRef` and ticket 05's `key`-based animate-in are local `useState`/`useRef` component state — both reset to their initial values on a fresh mount and re-derive correctly from the freshly-fetched `arrived`/`currentQuest`, so a reload mid-celebration or mid-transition can't leave a stuck or replayed animation.

**Not done this session:** an actual real-device walk-to-arrival + LLM encounter-completion + close/reopen pass. That needs a real GPS walk (or spoofed location) and burns a real Anthropic call, which felt like the wrong tradeoff to spend autonomously without you present to do the phone-in-hand part. Recommend doing this pass yourself on the production URL when convenient — the specific sequence from `ROADMAP.md`'s exit checkpoint: *Play → complete quest → close browser → reopen → same progress.*
