### Key trade-offs

- Next.js vs separate React + Node API — Next.js reduces setup/deployment overhead, but couples frontend and backend more tightly. Good trade-off for a 6–8h challenge.
- Supabase vs custom backend/database — Much faster to implement auth, Postgres and RLS, but creates vendor coupling.
- TanStack Query vs server components only — Adds client-side complexity, but gives consistent caching/mutations and is better suited to an interactive game.
- No localStorage — Slightly more network/database dependency, but avoids stale/duplicated game state and makes Supabase the clear source of truth.
- OSM/Overpass vs Google Places — Free/open and demonstrates data integration, but coverage/quality and API reliability are less predictable.
- LLM chooses from POIs vs inventing locations — Less creative freedom, but prevents hallucinated landmarks and keeps the AI grounded in real-world data.
- Backend game rules vs LLM-controlled game state — Less AI autonomy, but makes the game deterministic, testable and secure.
- Structured AI output + Zod vs free-form responses — More constrained narrative, but dramatically improves reliability.
- Google Maps vs building navigation — Less control over UX, but removes a huge amount of unnecessary complexity.
- Browser GPS vs continuous location tracking — Less sophisticated tracking, but enough for arrival detection while avoiding battery/privacy complexity.
- Single-player vs multiplayer — Much less technically impressive in realtime terms, but allows the core game loop to be substantially more polished.
- Pixel-art UI vs generic shadcn — More implementation effort, but makes the product memorable and demonstrates product/UX thinking.
- Pre-made wizard asset vs AI-generated imagery — Less dynamic, but faster, cheaper and visually consistent.
- Simple relational game state vs event sourcing — Less auditability/history, but vastly simpler and appropriate for the scope.
- Vercel + Supabase vs self-hosting — Less infrastructure control, but near-zero operational overhead for the challenge.
