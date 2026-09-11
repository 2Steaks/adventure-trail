# AI Adventure Game — Technical Challenge

Build a **mobile-first, pixel-art AI adventure game** for parents and children.

> **An AI game master that turns the real world around you into an adventure.**

The player uses their phone to explore real locations. The app finds nearby landmarks, generates an adventure around them, guides the player to each location, and runs an AI encounter when they arrive.

**Core principle:** the backend owns truth and rules; AI supplies creativity.

## Stack

* Next.js + React + TypeScript
* Tailwind CSS
* shadcn/ui
* **TanStack Query**
* Supabase Auth
* Supabase Postgres
* Zod
* OpenStreetMap / Overpass
* LLM API
* Vercel

### State

* **Supabase:** source of truth
* **TanStack Query:** server state/cache
* **React state:** transient UI state
* No Zustand
* No localStorage

## Visual design

Mobile-first. The app should feel like a **small pixel-art adventure game**, not a SaaS dashboard.

Use shadcn/ui underneath, heavily customised visually.

* Pixel-art panels/borders
* Chunky game-like buttons
* Strong typography
* High contrast for outdoor use
* Large touch targets
* Minimal information density
* Sticky primary actions where useful

### Wizard

A reusable pixel-art wizard lives above the quest/encounter dialog.

The wizard is the game's AI companion.

States can include:

* Idle
* Thinking
* Quest available
* Waiting
* Quest completed
* Unexpected event

Don't generate wizard artwork dynamically.

## User journey

### Auth

`/register` and `/login` using Supabase Auth.

### Adventures

Show:

* Name
* Theme
* Age range
* Duration
* Progress
* Status
* Last played
* Resume
* Create adventure

### Create adventure

Inputs:

* Theme
* Age range: `4–12`
* Duration: `30 / 60 / 90 / 120 min`
* Maximum walking distance: `500m / 1km / 2km / 5km`
* Browser location

Flow:

```text
Location
→ OSM nearby POIs
→ Filter/rank
→ LLM adventure plan
→ Zod validation
→ Supabase
→ Adventure
```

## Gameplay

Current quest displays:

* Narrative
* Target landmark
* Large distance
* Objective
* Google Maps button
* Arrival state
* Progress

No map UI.

Use browser geolocation + Haversine distance.

```text
640m
↓
320m
↓
85m
↓
YOU'VE ARRIVED!
```

Arrival is determined by the backend:

```ts
distance <= quest.radiusMeters
```

Never ask the LLM whether the player has arrived.

Google Maps handles navigation.

## AI architecture

### Adventure Planner

Called once during adventure creation.

Input:

```ts
{
  theme: string
  ageMin: number
  ageMax: number
  durationMinutes: number
  maxDistanceMeters: number
  start: { lat: number; lng: number }
  locations: {
    id: string
    name: string
    type: string
    latitude: number
    longitude: number
    distanceMeters: number
  }[]
}
```

Output:

```ts
{
  title: string
  quests: {
    locationId: string
    objective: string
    type: "riddle" | "exploration" | "discovery"
  }[]
}
```

Zod validates it.

The LLM can only select supplied `locationId`s.

### Encounter Generator

Called after backend confirms arrival.

Context:

* Theme
* Age range
* Current quest
* Completed quests
* Inventory
* Game state
* Recent messages
* Landmark information

Output:

```ts
{
  message: string
  choices: { id: string; label: string }[]
  actions: {
    type: "COMPLETE_OBJECTIVE" | "ADD_ITEM"
    questId?: string
    itemId?: string
  }[]
}
```

Flow:

```text
LLM
→ Zod
→ Game-rule validation
→ Supabase
```

The LLM proposes actions; the backend decides whether they are valid.

## OSM

Use Overpass for nearby POIs.

Prefer:

* Parks
* Beaches
* Playgrounds
* Monuments
* Bridges
* Viewpoints
* Castles
* Museums
* Harbours

Reject dangerous, industrial, private or inaccessible locations.

Return roughly 5–10 candidates to the LLM.

## Database

Use Supabase Postgres directly. **No Prisma.**

```text
adventures
- id
- user_id
- title
- theme
- age_min
- age_max
- duration_minutes
- max_distance_meters
- starting_lat
- starting_lng
- status
- created_at
- updated_at

quests
- id
- adventure_id
- position
- objective
- type
- landmark_name
- landmark_type
- latitude
- longitude
- radius_meters
- status
- created_at

game_states
- adventure_id
- current_quest_id
- state / inventory
- updated_at

messages
- id
- adventure_id
- role
- content
- created_at
```

`game_events` optional.

Don't store continuous GPS history.

Use RLS so users only access their own adventures.

## TanStack Query

Use it for all server state:

```text
useAdventures()
useAdventure(id)
useCreateAdventure()
useCompleteQuest()
useGameState()
```

Use query invalidation after mutations.

Don't duplicate server state into React state.

## Project structure

```text
src/
  app/
    login/
    register/
    adventures/
    adventures/new/
    adventures/[id]/
    api/

  components/
    ui/              # shadcn
    game/
      wizard/
      quest/
      adventure/

  lib/
    supabase/
    ai/
    places/
    game/
    schemas/
```

## Implementation order

### 1. Foundation

* Next.js
* Tailwind
* shadcn/ui
* TanStack Query
* Supabase
* Zod
* Mobile-first styles
* Pixel-art visual system
* Wizard asset
* DB schema + RLS

**Goal:** app boots and already looks like the game.

### 2. Auth

* Register
* Login
* Logout
* Protected routes
* Persistent Supabase session

### 3. Persistence

* Adventures
* Quests
* Game state
* TanStack Query hooks
* Adventures screen
* Create Adventure screen

**Goal:** hard-coded adventure can be created, fetched and resumed.

### 4. Real-world locations

* Browser geolocation
* Overpass
* Filtering/ranking

**Goal:** get useful nearby landmarks.

### 5. AI adventure generation

* Adventure Planner
* Structured output
* Zod
* Location ID validation
* Persist generated adventure

### 6. First playable quest

* Mobile quest screen
* Distance calculation
* Google Maps link
* Arrival detection

**Milestone:**

> Create → landmark → Maps → walk → distance changes → arrive

### 7. AI encounter

* Wizard
* Encounter Generator
* Choices
* Validated actions
* Inventory
* Quest completion
* Next quest

### 8. Resume

Verify:

> Play → complete quest → close browser → reopen → same progress

### 9. Mobile polish

* Loading/error states
* Outdoor readability
* Touch targets
* Wizard animation
* Arrival celebration
* Quest transitions
* Safe-area handling

### 10. Tests + deploy

High-value tests:

* Haversine
* Arrival threshold
* Zod AI output
* Invalid landmark rejection
* Game action validation
* Quest progression

Deploy to Vercel and test on an actual phone.

## Don't build

* Custom auth
* Map UI
* Turn-by-turn navigation
* Complex routing
* Multiplayer
* WebSockets
* Payments
* Admin UI
* Image generation
* Continuous GPS tracking
* Event sourcing
* Complex recommendations
* Prisma
* localStorage

## If time runs short

### Must have

```text
Mobile UI
→ Auth
→ Supabase persistence
→ Geolocation
→ OSM
→ AI adventure
→ Quest screen
→ Distance tracking
→ Arrival
→ Wizard
→ AI encounter
→ Quest completion
→ Resume
```

Cut features rather than compromising this loop.

### Final demo

> **Register → Create adventure → Discover real landmark → Open Maps → Walk → Arrive → Wizard encounter → Complete quest → Close/reopen → Resume**

The application should feel like a **polished pixel-art mobile game**, with the technical story:

> **Real-world data + deterministic game rules + constrained AI + validated actions + persistent authenticated state.**

And the key architectural insight:

> **Put an LLM inside the application without allowing the LLM to become the application.**
