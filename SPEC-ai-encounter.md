# Spec: AI Encounter Module

Module id: `ai-encounter` (see `CAPABILITY_MAP.md`, `ROADMAP.md` Phase 6). Depends on: `quest-gameplay` (complete, merged), `ai-planner` (complete, merged).

## Objective

Once the backend confirms arrival at a quest's landmark (`quest-gameplay`'s existing `POST /api/adventures/:id/arrival`), let the player tap the Wizard to trigger an AI-narrated encounter: a short message, some flavor choices, and — validated server-side, never trusted from the LLM directly — game-state changes (complete the objective, grant an item). Completing a quest's objective advances the adventure to its next quest; completing the last quest completes the adventure.

Who: the same parent/kid who just walked to a real landmark (per `notes/original_plan.md`'s Gameplay section) and now wants the payoff — a bit of AI-generated story, not a wall of chat UI.

Success looks like `ROADMAP.md`'s Phase 6 exit checkpoint: *arriving at a landmark triggers an encounter; player choices produce LLM-proposed actions that the backend validates before applying; invalid/out-of-rule actions are rejected server-side (one bounded retry, then explicit error/"unexpected event" state).*

Out of scope for this module: any map UI or continuous location tracking (already out of scope repo-wide, per `SPEC-quest-gameplay.md`); a full multi-turn chat interface (one encounter call per arrival, not an open-ended conversation); voice/audio; wizard artwork generation (`notes/original_plan.md`: "Don't generate wizard artwork dynamically" — `Wizard.tsx`'s existing static per-state rendering is reused, not replaced); animations/celebration polish (`mobile-polish`, Phase 7).

## Decisions (resolving the three open points from `notes/original_plan.md`'s Encounter Generator section)

- **Choice effect: flavor only.** Tapping a choice has no direct game-state effect. It's persisted as a `role: "user"` row in `messages` (the label text) and included as "recent messages" context on the *next* Encounter Generator call. This avoids a second validated-action round-trip per tap while still giving the LLM conversational continuity, per `messages`' existing append-only design.
- **Trigger: explicit tap, not automatic on arrival.** Arrival confirmation (`quest-gameplay`, unchanged) shows a `quest-available` Wizard state with a "Talk to the Wizard" button. Tapping it calls `POST /api/adventures/:id/encounter`, which runs the LLM call and applies actions. Keeps the arrival endpoint's response time free of LLM latency/retry cost, and matches the existing "no backend/browser action without a user tap" boundary (`SPEC-quest-gameplay.md`).
- **Model: `claude-haiku-4-5`.** Runs on every arrival — latency-visible to a waiting kid, called repeatedly against the API budget (`ROADMAP.md`'s tech decision) — contrasted with the Adventure Planner's `claude-opus-5` (runs once per adventure).

## Tech Stack

No new dependencies — reuses what `ai-planner` already wired in:

- `ai` (Vercel AI SDK) `generateText` + `Output.object()`, same pattern as `src/lib/ai/planner.ts`.
- `@ai-sdk/anthropic` via the existing `src/lib/ai/client.ts` (`anthropic("claude-haiku-4-5")` for this module, vs. the Planner's `anthropic("claude-opus-5")`).
- Zod for the encounter output contract, same `generateObject`-schema-as-contract approach as `adventurePlanSchema`.
- TanStack Query (`useMutation`) + `fetchJson()`, same as `quest-gameplay`/`persistence`.

## Commands

No new commands beyond `SPEC-foundation.md`'s (`pnpm dev`/`build`/`lint`/`test`). No new migration — `quests.status`, `game_states.current_quest_id`, `game_states.inventory`, and `messages` are all existing columns/tables from the Foundation migration, unused by any module until now.

## Project Structure

```text
src/
  lib/
    schemas/
      encounter.ts                  # Zod: encounterOutputSchema { message, choices, actions }
      encounter.test.ts
    game/
      encounter-actions.ts          # validateEncounterActions(actions, currentQuestId) -> string[] reasons
      encounter-actions.test.ts
      hooks.ts                      # EXTENDED: useEncounter(adventureId), useSendChoice(adventureId)
    ai/
      encounter.ts                  # generateEncounter(input) -> EncounterOutput, retry-once on invalid actions
                                     # (no live-call test, same posture as planner.ts)

  app/
    api/
      adventures/
        [id]/
          route.ts                  # EXTENDED: response now also includes game_states
                                     # (currentQuestId, inventory) so the frontend derives
                                     # "current quest" from it instead of quests[0]
          encounter/
            route.ts                # POST — requireUser(), loads current quest + game state +
                                     # last 10 messages, calls generateEncounter(), validates,
                                     # applies, persists an assistant message, returns output
          choice/
            route.ts                # POST — requireUser(), persists a user-role message
                                     # (the tapped choice's label), no LLM call, no validation

  components/
    game/
      wizard/
        Wizard.tsx                  # existing, reused as-is (no new states needed —
                                     # see Wizard State Mapping below)
      encounter/
        EncounterPanel.tsx          # renders the wizard's message + choice buttons + inventory

  app/
    adventures/
      [id]/
        page.tsx                    # EXTENDED: derives currentQuest from game_states, wires
                                     # Wizard + EncounterPanel into the post-arrival flow
```

## Wizard State Mapping

`Wizard.tsx`'s existing six states (`idle`, `thinking`, `quest-available`, `waiting`, `quest-completed`, `unexpected-event`) already cover this module completely — no new states, this is pure wiring:

| Page condition | Wizard state |
|---|---|
| Quest not yet arrived at | `idle` |
| Just arrived, encounter not yet started | `quest-available` |
| `useEncounter` mutation pending | `thinking` |
| Encounter message + choices shown, no further action pending | `waiting` |
| `COMPLETE_OBJECTIVE` applied for the current quest this turn | `quest-completed` |
| Encounter call failed after its one retry | `unexpected-event` |

## Code Style

The encounter route validates every proposed action against the *current* quest before applying anything — mirroring `ai-planner`'s `invalidLocationIds()` retry-once shape, not inventing a new pattern:

```ts
// src/lib/game/encounter-actions.ts
import type { EncounterAction } from "@/src/lib/schemas/encounter";

export function validateEncounterActions(
  actions: EncounterAction[],
  currentQuestId: string,
): string[] {
  return actions
    .map((action) => {
      if (action.type === "COMPLETE_OBJECTIVE" && action.questId !== currentQuestId) {
        return `COMPLETE_OBJECTIVE referenced questId "${action.questId}", but the current quest is "${currentQuestId}"`;
      }
      if (action.type === "ADD_ITEM" && !action.itemId) {
        return "ADD_ITEM action is missing itemId";
      }
      return null;
    })
    .filter((reason): reason is string => reason !== null);
}
```

```ts
// src/lib/ai/encounter.ts — same shape as generateAdventurePlan()
export async function generateEncounter(input: EncounterInput): Promise<EncounterOutput> {
  const first = await requestEncounter(input);
  const firstInvalid = validateEncounterActions(first.actions, input.currentQuestId);
  if (firstInvalid.length === 0) return first;

  const retry = await requestEncounter(
    input,
    `Your previous response proposed invalid action(s): ${firstInvalid.join("; ")}. Only propose COMPLETE_OBJECTIVE for questId "${input.currentQuestId}", and always include itemId on ADD_ITEM.`,
  );
  const retryInvalid = validateEncounterActions(retry.actions, input.currentQuestId);
  if (retryInvalid.length === 0) return retry;

  throw new EncounterError(`Encounter Generator produced invalid actions twice: ${retryInvalid.join("; ")}`);
}
```

The route applies actions only after validation passes, and only the actions that passed (defensive even post-validation, since `COMPLETE_OBJECTIVE`/`ADD_ITEM` are independent writes):

```ts
// src/app/api/adventures/[id]/encounter/route.ts (sketch)
const output = await generateEncounter(input); // throws EncounterError -> 502, no writes

for (const action of output.actions) {
  if (action.type === "COMPLETE_OBJECTIVE") {
    await supabase.from("quests").update({ status: "completed" }).eq("id", action.questId);
    const nextQuest = await getNextPendingQuest(supabase, adventureId, action.questId);
    await supabase
      .from("game_states")
      .update({ current_quest_id: nextQuest?.id ?? null })
      .eq("adventure_id", adventureId);
    if (!nextQuest) {
      await supabase.from("adventures").update({ status: "completed" }).eq("id", adventureId);
    }
  }
  if (action.type === "ADD_ITEM") {
    await supabase.rpc("append_inventory_item", { p_adventure_id: adventureId, p_item_id: action.itemId });
    // or: read-modify-write game_states.inventory in application code if no RPC is added — see Open Questions
  }
}

await supabase.from("messages").insert({ adventure_id: adventureId, role: "assistant", content: output.message });
```

## Testing Strategy

- `validateEncounterActions()` (`encounter-actions.test.ts`): valid `COMPLETE_OBJECTIVE` against the current quest passes; wrong `questId` is rejected; `ADD_ITEM` missing `itemId` is rejected; multiple actions in one call are checked independently. TDD — this is the real game-rule boundary, same bar as `invalidLocationIds()`.
- `encounterOutputSchema` (`encounter.test.ts`): valid shape accepted; missing `message`/empty `choices` array (allowed — choices can be empty on the final quest) vs. malformed `actions` entries rejected.
- **Not unit-tested, verified manually instead** (same posture as `ai-planner`): the actual `generateEncounter()` LLM call, the encounter/choice routes' Supabase calls, and the Wizard/EncounterPanel UI wiring.

## Boundaries

- **Always:** validate every LLM-proposed action against the *current* quest (from `game_states.current_quest_id`, never a client-submitted quest id) before applying it; make quest-completion + advancement + adventure-completion one logically atomic step from the caller's perspective (a repeat call after completion must be idempotent, same as `quest-gameplay`'s arrival route); scope every route to the caller's own adventure (`404` otherwise); require a user tap before the encounter LLM call (never on page mount, never automatically chained off arrival).
- **Ask first:** switching `messages`/choice-tap into anything that changes game state directly (currently flavor-only, by decision above); adding a second validated-action round-trip per choice; changing the Wizard's six states or adding new ones; introducing a real multi-turn open-ended chat box.
- **Never:** ask the LLM to decide game-state truth directly (it proposes actions, the backend decides legality — same posture as arrival's "never ask the LLM whether the player arrived"); apply an action the validator rejected; leave a `messages` row for a failed/retried-out encounter call (only persist the message that shipped a validated response).

## Success Criteria

- [ ] `POST /api/adventures/:id/encounter` rejects unauthenticated requests (`307` via the Proxy) and returns `404` for another user's adventure id
- [ ] Calling it with no `current_quest_id` (adventure already fully completed) returns a clean `400`/`409`-class error, no LLM call made
- [ ] A `COMPLETE_OBJECTIVE` action referencing the current quest sets that quest's `status = completed`, advances `game_states.current_quest_id` to the next pending quest by `position`, and — if it was the last quest — sets `adventures.status = completed`
- [ ] A `COMPLETE_OBJECTIVE`/`ADD_ITEM` action that fails validation (wrong quest id, missing item id) triggers exactly one retry with the specific error fed back; if the retry also fails, the route returns a `502`-class error and **zero** writes happen (no partial quest/game-state/message mutation)
- [ ] `ADD_ITEM` actions append to `game_states.inventory` without clobbering existing items
- [ ] `GET /api/adventures/:id` includes `game_states` (current quest id + inventory) so the frontend never has to guess the current quest from `quests[0]`
- [ ] `POST /api/adventures/:id/choice` persists a `role: "user"` message and is reflected as "recent messages" context on the next encounter call — verified by prompt content, not by any state-changing effect
- [ ] `/adventures/[id]` renders the Wizard through all six mapped states (see Wizard State Mapping) and an `EncounterPanel` showing the AI message + tappable choices once an encounter has run
- [ ] `validateEncounterActions()` and `encounterOutputSchema` tested per the Testing Strategy above, TDD
- [ ] `pnpm build`/`lint`/`test` pass; CI green on the PR

## Resolved Decisions (confirmed before Implement)

- **`ADD_ITEM` writes via application-code read-modify-write.** No Postgres function. Read `game_states.inventory`, push the item, write it back in the encounter route — consistent with this project's other accepted-risk shortcuts (Overpass: "accept the risk", geolocation: "one-shot, no retry loop"). Exactly one player per adventure, no concurrent-tab story anywhere else in the codebase, so the race window is theoretical and not worth a new DB-level concept.
- **`messages` context window: last 10 rows** (5 exchanges: assistant narrative + user choice pairs), ordered `created_at desc`, fed into the Encounter Generator's prompt.
- **Empty `choices` on the final quest is valid output.** `encounterOutputSchema` permits `choices: []`. The prompt tells the LLM when the current quest is the adventure's last one so it can write a closing/"The End"-style message with nothing left to choose.
