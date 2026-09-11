# Capability Map: Dungeon Master AI

Source: `notes/original_plan.md`. Approved 2026-09-11.

| Module id        | Responsibility                                                                                   | Depends on                  |
|-------------------|---------------------------------------------------------------------------------------------------|------------------------------|
| foundation        | Next.js/Tailwind/shadcn/TanStack Query/Supabase/Zod scaffold, pixel-art visual system, static wizard asset, DB schema + RLS | —                            |
| auth              | Register, login, logout, protected routes, persistent Supabase session                          | foundation                  |
| persistence       | Adventures/Quests/GameState CRUD, TanStack Query hooks, Adventures list screen, Create Adventure screen (hard-coded content) | foundation, auth             |
| places            | Browser geolocation, Overpass OSM query, POI filtering/ranking                                   | foundation                  |
| ai-planner        | Adventure Planner LLM call, Zod validation, locationId constraint, persists generated adventure  | persistence, places          |
| quest-gameplay    | Quest screen, Haversine distance, Google Maps link, backend-determined arrival detection          | persistence                  |
| ai-encounter      | Wizard UI states, Encounter Generator LLM call, choices, validated game actions, inventory, quest completion/advance | quest-gameplay, ai-planner   |
| mobile-polish     | Loading/error states, animations, arrival celebration, safe-area handling, resume verification    | ai-encounter                 |
| testing-deploy    | Unit tests (Haversine, arrival threshold, Zod schemas, action validation, quest progression) + Vercel deploy | mobile-polish                |

Build order: foundation → auth → persistence, places → quest-gameplay → ai-planner → ai-encounter → mobile-polish → testing-deploy

Note: `quest-gameplay` only depends on `persistence` (not `ai-planner`) per the table above, so it's built and proven against a hard-coded adventure before `ai-planner` is layered in — derisking GPS/arrival mechanics independently of LLM output validation. See `ROADMAP.md` Phase 4/5.

Each module gets its own spec at the repo root: `SPEC-<module-id>.md`, produced by running Specify → Plan → Tasks → Implement per module in this order.
