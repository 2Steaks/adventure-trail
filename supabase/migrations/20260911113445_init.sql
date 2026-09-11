-- Adventures, quests, game state, and messages, per notes/original_plan.md.
-- RLS scopes every table to the owning user's auth.uid(): directly on
-- adventures.user_id, and via an adventure_id join for child tables.

create table public.adventures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  theme text not null,
  age_min integer not null,
  age_max integer not null,
  duration_minutes integer not null,
  max_distance_meters integer not null,
  starting_lat double precision not null,
  starting_lng double precision not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.adventures enable row level security;

create policy "adventures_select_own" on public.adventures
  for select using (auth.uid() = user_id);

create policy "adventures_insert_own" on public.adventures
  for insert with check (auth.uid() = user_id);

create policy "adventures_update_own" on public.adventures
  for update using (auth.uid() = user_id);

create policy "adventures_delete_own" on public.adventures
  for delete using (auth.uid() = user_id);

create table public.quests (
  id uuid primary key default gen_random_uuid(),
  adventure_id uuid not null references public.adventures (id) on delete cascade,
  position integer not null,
  objective text not null,
  type text not null check (type in ('riddle', 'exploration', 'discovery')),
  landmark_name text not null,
  landmark_type text not null,
  latitude double precision not null,
  longitude double precision not null,
  radius_meters integer not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.quests enable row level security;

create policy "quests_select_own" on public.quests
  for select using (
    exists (
      select 1 from public.adventures
      where adventures.id = quests.adventure_id
        and adventures.user_id = auth.uid()
    )
  );

create policy "quests_insert_own" on public.quests
  for insert with check (
    exists (
      select 1 from public.adventures
      where adventures.id = quests.adventure_id
        and adventures.user_id = auth.uid()
    )
  );

create policy "quests_update_own" on public.quests
  for update using (
    exists (
      select 1 from public.adventures
      where adventures.id = quests.adventure_id
        and adventures.user_id = auth.uid()
    )
  );

create policy "quests_delete_own" on public.quests
  for delete using (
    exists (
      select 1 from public.adventures
      where adventures.id = quests.adventure_id
        and adventures.user_id = auth.uid()
    )
  );

create table public.game_states (
  adventure_id uuid primary key references public.adventures (id) on delete cascade,
  current_quest_id uuid references public.quests (id) on delete set null,
  state jsonb not null default '{}'::jsonb,
  inventory jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.game_states enable row level security;

create policy "game_states_select_own" on public.game_states
  for select using (
    exists (
      select 1 from public.adventures
      where adventures.id = game_states.adventure_id
        and adventures.user_id = auth.uid()
    )
  );

create policy "game_states_insert_own" on public.game_states
  for insert with check (
    exists (
      select 1 from public.adventures
      where adventures.id = game_states.adventure_id
        and adventures.user_id = auth.uid()
    )
  );

create policy "game_states_update_own" on public.game_states
  for update using (
    exists (
      select 1 from public.adventures
      where adventures.id = game_states.adventure_id
        and adventures.user_id = auth.uid()
    )
  );

-- No delete policy: game state is removed only via adventures' cascade delete,
-- never directly.

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  adventure_id uuid not null references public.adventures (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "messages_select_own" on public.messages
  for select using (
    exists (
      select 1 from public.adventures
      where adventures.id = messages.adventure_id
        and adventures.user_id = auth.uid()
    )
  );

create policy "messages_insert_own" on public.messages
  for insert with check (
    exists (
      select 1 from public.adventures
      where adventures.id = messages.adventure_id
        and adventures.user_id = auth.uid()
    )
  );

-- No update/delete policies: messages are an append-only log.
