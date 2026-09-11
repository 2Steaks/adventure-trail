Status: resolved
Type: task
Blocked by: none

# 02 - shadcn/ui init + pixel-art theme tokens + Button restyle

**Description:** Run `pnpm dlx shadcn@latest init` (style `new-york`, base color `neutral`, CSS variables enabled — per `ROADMAP.md`'s decision log). Then layer pixel-art `@theme` tokens into `globals.css` (hard borders, no radius, chunky spacing) on top of shadcn's generated variables, and restyle the generated `Button` primitive to match.

**Deviation found during implementation:** the installed shadcn CLI (`shadcn@4.21.0`) has replaced the old style+base-color system with named presets (Nova, Vega, Maia, Lyra, Mira, Luma, Sera, Rhea, Custom) and switched from Radix + a generated `lib/utils.ts` to Base UI (`@base-ui/react`) + the standalone `cn` npm package. `new-york`/`neutral` no longer exist. Used the CLI's own default (`base-nova`, base color `neutral`) since this choice was already agreed to be inert — Foundation overrides it immediately regardless of preset name. Also: the CLI generated `components/ui/button.tsx` and `lib/utils.ts` at the repo **root** (following the `@/*` → `./*` tsconfig alias literally), not under `src/`, inconsistent with the rest of the codebase. Fixed by pointing `components.json`'s aliases at `@/src/...` and regenerating into `src/components/ui/button.tsx`.

**Acceptance criteria:**
- [x] `components.json` present with the agreed preset/base color (`base-nova` / `neutral`, not `new-york` — see deviation note)
- [x] `globals.css` has pixel-art tokens under `@theme` (Tailwind v4 convention, no `tailwind.config.js`) — `--radius: 0rem` set in `:root`, cascading to all radius-derived tokens
- [x] `src/components/ui/button.tsx` renders with a hard border, no border-radius, and chunky padding — border/radius/typography changes applied to the shared base classes (safe for every variant), but the *visible* border color is scoped to the `default` variant only, so `ghost`/`link`'s intentionally borderless look isn't broken

**Verification:**
- [x] `pnpm build` — exits 0
- [x] Manual check: no browser tool available this session; verified via rendered HTML (`curl localhost:3000` during `pnpm dev`) showing the Button's class list includes `rounded-none border-2 ... border-foreground ... h-11 ... px-4` — confirms the pixel-art styles are applied, though not a visual screenshot confirmation

## Answer

Done, with the two deviations noted above (preset naming, file location). Recommend an actual visual check in a browser when one's available, since HTML/class inspection isn't a substitute for seeing it.

**Dependencies:** None (doesn't need Task 01's installs — shadcn brings its own deps)

**Files likely touched:**
- `components.json`
- `src/app/globals.css`
- `src/components/ui/button.tsx`
- `package.json` (shadcn's own dependencies, e.g. `class-variance-authority`, `clsx`)

**Estimated scope:** Small–Medium
