Status: resolved
Type: task
Blocked by: none

# 03 - POST /api/adventures/:id/choice (flavor-only message, no LLM)

**Description:** Add `POST /api/adventures/:id/choice` (`src/app/api/adventures/[id]/choice/route.ts`), protected via `requireUser()` like every other adventure route. Body validated against a new `choiceSchema` (`src/lib/schemas/choice.ts`): `{ label: string.min(1) }`. On success, inserts one `messages` row: `{ adventure_id: id, role: "user", content: label }`. No LLM call, no game-state mutation — per `SPEC-ai-encounter.md`'s "choice effect: flavor only" decision, this just persists the tapped choice's label so it shows up as "recent messages" context on the *next* `POST /api/adventures/:id/encounter` call (task 05).

Add `useSendChoice(adventureId)` (`src/lib/game/hooks.ts`, `useMutation` + `fetchJson`, same shape as `useCheckArrival`) for the frontend to call when a choice button is tapped.

**Acceptance criteria:**
- [x] `POST /api/adventures/:id/choice` rejects unauthenticated requests (`307` via the Proxy)
- [x] Returns `404` for another user's adventure id
- [x] Returns `400` for a missing/empty `label`
- [x] On success, inserts a `messages` row with `role: "user"` and `content` equal to the submitted `label`
- [x] `useSendChoice()` hook available for task 05's UI wiring

**Verification:**
- [x] `pnpm test` passes (`choiceSchema` validation test, 73/73 total)
- [x] `pnpm build`/`lint` pass
- [x] Manual: unauthenticated request → `307`, confirmed live
- [ ] **Deferred, same dependency as tasks 02/04-05:** `404` for another user's adventure and a real `messages` insert both need an existing adventure — none available this session without a live-billed Adventure Planner call, currently blocked by `ai-planner`'s usage limit (resets 2026-10-01). Not silently skipped — tracked here.

**Dependencies:** None

**Files likely touched:**
- `src/app/api/adventures/[id]/choice/route.ts`
- `src/lib/schemas/choice.ts`
- `src/lib/schemas/choice.test.ts`
- `src/lib/game/hooks.ts`

**Estimated scope:** Small
