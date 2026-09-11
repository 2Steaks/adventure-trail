Status: open
Type: task
Blocked by: 02

# 03 - Mobile-first pixel-art layout + placeholder page

**Description:** Rework `src/app/layout.tsx` and `src/app/page.tsx` to drop the default create-next-app content in favor of a mobile-first, safe-area-aware pixel-art shell, using the restyled `Button` from Task 02 as a visible smoke element.

**Acceptance criteria:**
- [ ] `pnpm dev` at a 375px-wide viewport shows the pixel-art shell, not create-next-app boilerplate
- [ ] Layout accounts for mobile safe-area insets (notch/home-indicator)
- [ ] The restyled `Button` is visible on the placeholder page

**Verification:**
- [ ] `pnpm build` and `pnpm lint` — exit 0
- [ ] Manual check: `pnpm dev`, resize devtools to 375px, confirm visually

**Dependencies:** 02

**Files likely touched:**
- `src/app/layout.tsx`
- `src/app/page.tsx`

**Estimated scope:** Small
