Status: open
Type: task
Blocked by: 01

# 04 - Wire generateEncounter() against a real Anthropic call

**Description:** Add `src/lib/ai/encounter.ts`: `generateEncounter(input: EncounterInput): Promise<EncounterOutput>`, same shape as `ai-planner`'s `generateAdventurePlan()` — calls `generateText({ model: anthropic("claude-haiku-4-5"), prompt, output: Output.object({ schema: encounterOutputSchema }) })` (reusing the existing `src/lib/ai/client.ts`), validates the result with `validateEncounterActions()` (task 01), and on failure retries exactly once with the specific validation error(s) fed back into the prompt. If the retry also fails, throws `EncounterError`.

`EncounterInput` carries everything `notes/original_plan.md`'s Encounter Generator context list names: theme, age range, current quest (objective/type/landmark), completed quests, inventory, recent messages (last 10 rows per `SPEC-ai-encounter.md`'s Resolved Decisions), and landmark information. The prompt tells the LLM explicitly when the current quest is the adventure's final one, so it can end with an empty `choices` array instead of manufacturing a choice with nothing left to choose from.

Per `ai-planner`'s precedent, this is the one task in the module that makes a real, billed Anthropic call — kept isolated so a failure here is unambiguously an LLM-integration issue, not a schema or validation bug (both already proven pure in task 01).

**Acceptance criteria:**
- [ ] `generateEncounter()` returns a valid `EncounterOutput` on a normal live call
- [ ] On an invalid first response (forced/observed, not necessarily reproduced on demand), exactly one retry is attempted with the specific validation error(s) in the prompt
- [ ] Throws `EncounterError` (with the invalid reasons in its message) if the retry is also invalid
- [ ] Prompt explicitly signals "this is the final quest" when applicable, per the Resolved Decisions

**Verification:**
- [ ] `pnpm build`/`lint`/`test` pass (no new pure-logic tests here beyond what task 01 covers — mirrors `ai-planner` task 04's posture)
- [ ] Manual, live: at least one real call against `claude-haiku-4-5` with a realistic input, confirmed to return a sensible message/choices/actions shape
- [ ] **If blocked by the same Anthropic account usage limit `ai-planner` hit (resets 2026-10-01):** defer live verification explicitly, same as that module — record it here and in `tasks/plan-ai-encounter.md`'s Checkpoint B as a tracked, not silently accepted, gap. Do not loop retries to work around a billing/account block.

**Dependencies:** 01

**Files likely touched:**
- `src/lib/ai/encounter.ts`

**Estimated scope:** Small
