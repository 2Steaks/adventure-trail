-- messages.quest_id scopes each message to the quest it was sent during.
-- Without it, the encounter prompt's "recent conversation" pulled the last
-- N messages for the whole adventure, so once a player moved on to a new
-- quest the wizard's context was still muddled with the previous quest's
-- conversation.
alter table public.messages
  add column quest_id uuid references public.quests (id) on delete cascade;
