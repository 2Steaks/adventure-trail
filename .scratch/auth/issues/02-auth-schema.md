Status: open
Type: task
Blocked by: none

# 02 - Auth Zod schema (TDD)

**Description:** Add `authCredentialsSchema` (`{ email, password }`) to `src/lib/schemas/auth.ts`, used by both the register and login Route Handlers to validate request bodies before ever calling Supabase.

**Acceptance criteria:**
- [ ] Valid email + password (>= 6 chars) passes
- [ ] Invalid email format fails
- [ ] Password under 6 chars fails
- [ ] Test written first, observed failing before the schema existed

**Verification:**
- [ ] `pnpm test` passes

**Dependencies:** None

**Files likely touched:**
- `src/lib/schemas/auth.ts`
- `src/lib/schemas/auth.test.ts`

**Estimated scope:** Extra small
