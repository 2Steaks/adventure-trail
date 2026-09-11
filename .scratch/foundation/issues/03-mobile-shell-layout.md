Status: resolved
Type: task
Blocked by: 02

# 03 - Mobile-first pixel-art layout + placeholder page

**Description:** Rework `src/app/layout.tsx` and `src/app/page.tsx` to drop the default create-next-app content in favor of a mobile-first, safe-area-aware pixel-art shell, using the restyled `Button` from Task 02 as a visible smoke element.

**Acceptance criteria:**
- [x] `pnpm dev` at a 375px-wide viewport shows the pixel-art shell, not create-next-app boilerplate (verified via rendered HTML, not a visual screenshot — no browser tool available this session)
- [x] Layout accounts for mobile safe-area insets (notch/home-indicator) — `env(safe-area-inset-*)` padding added to `body` in `globals.css`, plus `viewport-fit: cover` in `layout.tsx`'s `viewport` export
- [x] The restyled `Button` is visible on the placeholder page

**Verification:**
- [x] `pnpm build` and `pnpm lint` — exit 0
- [x] Manual check: rendered HTML confirms "Dungeon Master AI" heading, "Start Adventure" button, and the panel's `border-4 border-foreground` — a real visual check is still recommended once a browser is available

**Also fixed:** `--font-sans` in `globals.css`'s `@theme` was self-referential (`var(--font-sans)`) because `layout.tsx` set the Geist Sans variable to `--font-geist-sans`. Renamed the layout's variable to `--font-sans` to match shadcn's Nova preset convention.

**Dependencies:** 02

**Files likely touched:**
- `src/app/layout.tsx`
- `src/app/page.tsx`

**Estimated scope:** Small
