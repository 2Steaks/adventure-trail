Status: open
Type: task
Blocked by: none

# 02 - shadcn/ui init + pixel-art theme tokens + Button restyle

**Description:** Run `pnpm dlx shadcn@latest init` (style `new-york`, base color `neutral`, CSS variables enabled — per `ROADMAP.md`'s decision log). Then layer pixel-art `@theme` tokens into `globals.css` (hard borders, no radius, chunky spacing) on top of shadcn's generated variables, and restyle the generated `Button` primitive to match.

**Acceptance criteria:**
- [ ] `components.json` present with the agreed style/base color
- [ ] `globals.css` has pixel-art tokens under `@theme` (Tailwind v4 convention, no `tailwind.config.js`)
- [ ] `src/components/ui/button.tsx` renders with a hard border, no border-radius, and chunky padding

**Verification:**
- [ ] `pnpm build` — exits 0
- [ ] Manual check: render `Button` somewhere visible and confirm the pixel-art look at a 375px viewport

**Dependencies:** None (doesn't need Task 01's installs — shadcn brings its own deps)

**Files likely touched:**
- `components.json`
- `src/app/globals.css`
- `src/components/ui/button.tsx`
- `package.json` (shadcn's own dependencies, e.g. `class-variance-authority`, `clsx`)

**Estimated scope:** Small–Medium
