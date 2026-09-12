# 05: Quest transitions

**What to build:** When an encounter's `COMPLETE_OBJECTIVE` action advances `game_states.current_quest_id` (surfaced to the frontend via `useEncounter`'s query invalidation in `src/app/adventures/[id]/page.tsx`), animate the handoff from the completed quest's card to the next quest's card (or to the "Adventure Complete!" state when there is no next quest), instead of today's instant re-render swap.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] The `quest-completed` Wizard state → next-quest-card (or Adventure Complete) transition is animated, not an instant snap
- [ ] The transition doesn't hide or delay the player's ability to dismiss the encounter result (the existing "unread encounter result stays visible until dismissed" behavior, per the comment in `page.tsx`, is preserved)
- [ ] Respects `prefers-reduced-motion`
- [ ] `pnpm build`/`lint`/`test` pass
