Status: resolved
Type: task
Blocked by: none

# 02 - Extend createAdventureSchema with startingLat/startingLng (TDD)

**Description:** `createAdventureSchema` (`src/lib/schemas/adventure.ts`) gains required `startingLat`/`startingLng` fields (same bounds as `nearbyPlacesQuerySchema`'s `lat`/`lng`) — the real browser-obtained coordinates that replace `HARD_CODED_QUEST`'s hard-coded starting point. Zero API cost.

**Acceptance criteria:**
- [x] Valid body (existing fields + `startingLat`/`startingLng` in range) passes
- [x] Out-of-range or missing `startingLat`/`startingLng` fails
- [x] Existing `createAdventureSchema` tests (age range, duration/distance enums) still pass unmodified

**Verification:**
- [x] `pnpm test` passes (57/57, existing `adventure.test.ts` cases plus new ones)

**Dependencies:** None

**Files likely touched:**
- `src/lib/schemas/adventure.ts`
- `src/lib/schemas/adventure.test.ts`

**Estimated scope:** Extra small
