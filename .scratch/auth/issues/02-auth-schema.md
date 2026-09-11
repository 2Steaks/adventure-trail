Status: resolved
Type: task
Blocked by: none

# 02 - Auth Zod schema (TDD)

**Description:** Add `authCredentialsSchema` (`{ email, password }`) to `src/lib/schemas/auth.ts`, used by both the register and login Route Handlers to validate request bodies before ever calling Supabase.

**Acceptance criteria:**
- [x] Valid email + password (>= 6 chars) passes
- [x] Invalid email format fails
- [x] Password under 6 chars fails
- [x] Test written first, observed failing before the schema existed

**Verification:**
- [x] `pnpm test` passes (20/20 at the time)

**Dependencies:** None

**Files likely touched:**
- `src/lib/schemas/auth.ts`
- `src/lib/schemas/auth.test.ts`

**Estimated scope:** Extra small
