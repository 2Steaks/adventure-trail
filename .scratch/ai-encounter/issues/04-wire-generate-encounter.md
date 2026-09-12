Status: resolved
Type: task
Blocked by: 01

# 04 - Wire generateEncounter() against a real Anthropic call

**Description:** Add `src/lib/ai/encounter.ts`: `generateEncounter(input: EncounterInput): Promise<EncounterOutput>`, same shape as `ai-planner`'s `generateAdventurePlan()` — calls `generateText({ model: anthropic("claude-haiku-4-5"), prompt, output: Output.object({ schema: encounterOutputSchema }) })` (reusing the existing `src/lib/ai/client.ts`), validates the result with `validateEncounterActions()` (task 01), and on failure retries exactly once with the specific validation error(s) fed back into the prompt. If the retry also fails, throws `EncounterError`.

`EncounterInput` carries everything `notes/original_plan.md`'s Encounter Generator context list names: theme, age range, current quest (objective/type/landmark), completed quests, inventory, recent messages (last 10 rows per `SPEC-ai-encounter.md`'s Resolved Decisions), and landmark information. The prompt tells the LLM explicitly when the current quest is the adventure's final one, so it can end with an empty `choices` array instead of manufacturing a choice with nothing left to choose from.

Per `ai-planner`'s precedent, this is the one task in the module that makes a real, billed Anthropic call — kept isolated so a failure here is unambiguously an LLM-integration issue, not a schema or validation bug (both already proven pure in task 01).

**Acceptance criteria:**
- [x] `generateEncounter()`, `EncounterInput`, `EncounterError` implemented, same shape as `ai-planner`'s `generateAdventurePlan()`
- [x] `generateEncounter()` returns a valid `EncounterOutput` on a normal live call — **verified 2026-09-12**, see Verification
- [ ] On an invalid first response, exactly one retry is attempted with the specific validation error(s) in the prompt — still not proven live (every live call so far returned valid actions on the first attempt; implemented, mirrors `invalidLocationIds()`'s already-tested retry shape)
- [x] Throws `EncounterError` (with the invalid reasons in its message) if the retry is also invalid — implemented
- [x] Prompt explicitly signals "this is the final quest" when applicable, per the Resolved Decisions — **confirmed live**: the final-quest call correctly returned `choices: []` and a closing narration

**Verification:**
- [x] `pnpm build`/`lint`/`test` pass (73/73 — no new pure-logic tests here beyond what task 01 covers, mirrors `ai-planner` task 04's posture)
- [x] Manual, live: one deliberate call attempted against `claude-haiku-4-5` with a realistic input via a temporary, uncommitted test file (removed after the run)
- [x] **2026-09-12, unblocked and verified** (the account usage limit lifted before the stated 2026-10-01 reset — re-checked with a minimal probe call before spending anything further). Four real `generateEncounter()` calls made end-to-end via `POST /api/adventures/:id/encounter` across two test adventures (2 and 3 quests): every call returned a valid `EncounterOutput` with a correct `COMPLETE_OBJECTIVE` `questId` on the first attempt (no retry path exercised), and the 3-quest adventure's last call correctly treated `isFinalQuest` — empty `choices`, a closing "mission accomplished" narration. See `ai-encounter`'s task 05 comment for the full session log and a real bug this exercise found (in `quest-gameplay`'s arrival route, not this file).

**Dependencies:** 01

**Files likely touched:**
- `src/lib/ai/encounter.ts`

**Estimated scope:** Small
