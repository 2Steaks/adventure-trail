Status: resolved
Type: task
Blocked by: 01

# 04 - Wire generateEncounter() against a real Anthropic call

**Description:** Add `src/lib/ai/encounter.ts`: `generateEncounter(input: EncounterInput): Promise<EncounterOutput>`, same shape as `ai-planner`'s `generateAdventurePlan()` — calls `generateText({ model: anthropic("claude-haiku-4-5"), prompt, output: Output.object({ schema: encounterOutputSchema }) })` (reusing the existing `src/lib/ai/client.ts`), validates the result with `validateEncounterActions()` (task 01), and on failure retries exactly once with the specific validation error(s) fed back into the prompt. If the retry also fails, throws `EncounterError`.

`EncounterInput` carries everything `notes/original_plan.md`'s Encounter Generator context list names: theme, age range, current quest (objective/type/landmark), completed quests, inventory, recent messages (last 10 rows per `SPEC-ai-encounter.md`'s Resolved Decisions), and landmark information. The prompt tells the LLM explicitly when the current quest is the adventure's final one, so it can end with an empty `choices` array instead of manufacturing a choice with nothing left to choose from.

Per `ai-planner`'s precedent, this is the one task in the module that makes a real, billed Anthropic call — kept isolated so a failure here is unambiguously an LLM-integration issue, not a schema or validation bug (both already proven pure in task 01).

**Acceptance criteria:**
- [x] `generateEncounter()`, `EncounterInput`, `EncounterError` implemented, same shape as `ai-planner`'s `generateAdventurePlan()`
- [ ] `generateEncounter()` returns a valid `EncounterOutput` on a normal live call — **not yet proven, see Verification**
- [ ] On an invalid first response, exactly one retry is attempted with the specific validation error(s) in the prompt — **not yet proven live** (implemented, mirrors `invalidLocationIds()`'s already-tested retry shape)
- [x] Throws `EncounterError` (with the invalid reasons in its message) if the retry is also invalid — implemented
- [x] Prompt explicitly signals "this is the final quest" when applicable, per the Resolved Decisions

**Verification:**
- [x] `pnpm build`/`lint`/`test` pass (73/73 — no new pure-logic tests here beyond what task 01 covers, mirrors `ai-planner` task 04's posture)
- [x] Manual, live: one deliberate call attempted against `claude-haiku-4-5` with a realistic input via a temporary, uncommitted test file (removed after the run)
- [ ] **Blocked by the same Anthropic account usage limit `ai-planner` hit:** the live call reached the API correctly (real request, real auth) and failed with `AI_APICallError: You have reached your specified API usage limits. You will regain access on 2026-10-01 at 00:00 UTC.` — a billing/account block, not a code bug. Per the plan, no retry-looping was attempted to work around it. **Live verification of this task and task 05's end-to-end flow is deferred to after 2026-10-01** — tracked here and in `tasks/plan-ai-encounter.md`'s Checkpoint B, not silently accepted.

**Dependencies:** 01

**Files likely touched:**
- `src/lib/ai/encounter.ts`

**Estimated scope:** Small
