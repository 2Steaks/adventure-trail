import { NextResponse } from "next/server";
import { requireUser } from "@/src/services/supabase/utils/require-user";
import { arrivalCheckSchema } from "@/src/features/game/arrival.schema";
import { checkArrival } from "@/src/features/game/arrival";
import { AdventureClient } from "@/src/features/adventures/client";
import { QuestClient } from "@/src/features/quests/client";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, supabase } = await requireUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const adventureClient = new AdventureClient(supabase);
  const questClient = new QuestClient(supabase);

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid location." }, { status: 400 });
  }

  const body = arrivalCheckSchema.safeParse(json);
  if (!body.success) {
    return NextResponse.json({ error: "Invalid location." }, { status: 400 });
  }

  const { data: adventure, error: adventureError } =
    await adventureClient.getWithGameState(id, user.id);

  if (adventureError) {
    return NextResponse.json(
      { error: adventureError.message },
      { status: 400 },
    );
  }

  // game_states.adventure_id is that table's primary key, and the
  // generated Database types mark that FK isOneToOne — so this embed is
  // already typed as a single nullable object, no cast needed.
  const currentQuestId = adventure?.game_states?.current_quest_id ?? null;

  if (!adventure || !currentQuestId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Resolved via game_states.current_quest_id, not "the adventure's one
  // quest" — an adventure can have more than one quest once ai-planner
  // ships (adventures.route.ts's questsTotal/questsCompleted already
  // assume this), and current_quest_id is the source of truth for which
  // one is active.
  const { data: quest, error: questError } =
    await questClient.getQuest(currentQuestId);

  if (questError) {
    return NextResponse.json({ error: questError.message }, { status: 400 });
  }

  if (!quest) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const result = checkArrival(body.data, {
    latitude: quest.latitude,
    longitude: quest.longitude,
    radiusMeters: quest.radius_meters,
  });

  // Arrival is a pure proximity check — it only unlocks the "Talk to the
  // Wizard" button. It must never itself complete the quest or adventure:
  // since ai-encounter shipped, generateEncounter()'s COMPLETE_OBJECTIVE
  // action (applied in encounter/route.ts) is the sole authority on
  // whether a quest's objective is actually resolved. Marking completion
  // here too (this route's original, single-quest-era behavior) let an
  // adventure with more quests remaining get flagged "completed" the
  // instant the player reached the first landmark, before the wizard
  // encounter ever ran — found live 2026-09-12, see
  // .scratch/quest-gameplay/issues/03-arrival-vertical-slice.md.
  return NextResponse.json(result);
}
