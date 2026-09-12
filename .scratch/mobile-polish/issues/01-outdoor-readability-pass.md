# 01: Outdoor-readability pass

**What to build:** Bump contrast, base font size, and border weight across the app's pixel-art theme (`src/app/globals.css`) so text and controls stay legible on a phone screen in direct sunlight — the actual outdoor use case for this app. Today's `--muted-foreground`/`--border` tokens are low-contrast grayscale (`oklch(0.556 0 0)` on white), tuned for an indoor screen, not glare.

**Blocked by:** None (can start immediately)

**Status:** resolved (partial — see Answer)

- [x] `--muted-foreground` (light mode) contrast against `--background` meets WCAG AA (4.5:1) for normal text
- [x] Base body font size increased from the Tailwind default enough to read at arm's length outdoors
- [x] `border-foreground`/`border-border` weights reviewed so card/button edges stay visible against bright backgrounds
- [ ] Every screen (`/`, `/adventures/new`, `/adventures/[id]`, `/login`, `/register`) visually reviewed at a 375px viewport after the change — **not done**, see Answer
- [x] `pnpm build`/`lint`/`test` pass

## Answer

`--muted-foreground` darkened `oklch(0.556 0 0)` → `oklch(0.42 0 0)` (well past 4.5:1 against white); `--border`/`--input` darkened `oklch(0.922 0 0)` → `oklch(0.65 0 0)` (the "outline" Button variant and card edges were nearly invisible before). Root font-size bumped 16px → 18px (`html { font-size: 112.5% }`) so every Tailwind rem-based utility scales up uniformly.

No live browser/screenshot review was done — no Chrome DevTools MCP server is configured in this repo, and the user opted to skip setting one up rather than have it configured this session. Verified via computed OKLCH contrast values and `pnpm build`/`lint`/`test` only. Recommend an eyeball pass on the production URL when convenient.
