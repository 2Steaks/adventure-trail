Status: open
Type: task
Blocked by: none

# 01 - encounterOutputSchema + validateEncounterActions() (TDD)

**Description:** Add `encounterOutputSchema` (`src/lib/schemas/encounter.ts`) matching `notes/original_plan.md`'s Encounter Generator output shape: `{ message: string, choices: { id: string; label: string }[], actions: ({ type: "COMPLETE_OBJECTIVE"; questId: string } | { type: "ADD_ITEM"; itemId: string })[] }`. `choices` and `actions` may both be empty arrays (empty `choices` is valid on the adventure's final quest, per `SPEC-ai-encounter.md`'s Resolved Decisions).

Add `validateEncounterActions(actions, currentQuestId): string[]` (`src/lib/game/encounter-actions.ts`) — the game-rule check mirroring `ai-planner`'s `invalidLocationIds()`: a `COMPLETE_OBJECTIVE` action is invalid unless its `questId` matches `currentQuestId`; an `ADD_ITEM` action is invalid if `itemId` is missing/empty. Returns one human-readable reason string per invalid action (empty array = all valid), used both to decide whether to retry the LLM call (task 04) and to feed the specific correction back into the retry prompt.

**Acceptance criteria:**
- [ ] `encounterOutputSchema` accepts a well-formed object with non-empty `choices`/`actions`, and separately with both empty
- [ ] `encounterOutputSchema` rejects a missing `message`, a choice missing `id`/`label`, and an action with an unrecognized `type`
- [ ] `validateEncounterActions()` returns `[]` when every `COMPLETE_OBJECTIVE` targets `currentQuestId` and every `ADD_ITEM` has an `itemId`
- [ ] `validateEncounterActions()` returns a reason naming the offending action when a `COMPLETE_OBJECTIVE` targets a different quest id
- [ ] `validateEncounterActions()` returns a reason when an `ADD_ITEM` is missing `itemId`
- [ ] Multiple invalid actions in one call each produce their own reason (not just the first)

**Verification:**
- [ ] `pnpm test` passes (new `encounter.test.ts` + `encounter-actions.test.ts`)
- [ ] `pnpm build`/`lint` pass

**Dependencies:** None

**Files likely touched:**
- `src/lib/schemas/encounter.ts`
- `src/lib/schemas/encounter.test.ts`
- `src/lib/game/encounter-actions.ts`
- `src/lib/game/encounter-actions.test.ts`

**Estimated scope:** Small
