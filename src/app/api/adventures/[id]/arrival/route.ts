import { NextResponse } from "next/server";
import { requireUser } from "@/src/lib/supabase/require-user";
import { arrivalCheckSchema } from "@/src/lib/schemas/arrival";
import { checkArrival } from "@/src/lib/game/arrival";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, supabase } = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

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

  const { data: adventure, error: adventureError } = await supabase
    .from("adventures")
    .select("id, game_states(current_quest_id)")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (adventureError) {
    return NextResponse.json(
      { error: adventureError.message },
      { status: 400 },
    );
  }

  // game_states.adventure_id is that table's primary key, so this embed is
  // a to-one relationship and returns a single object at runtime — even
  // though supabase-js's untyped-client inference (no generated DB types
  // in this project) mistypes it as an array. Confirmed live.
  const currentQuestId = (
    adventure?.game_states as unknown as { current_quest_id: string | null } | null
  )?.current_quest_id;

  if (!adventure || !currentQuestId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Resolved via game_states.current_quest_id, not "the adventure's one
  // quest" — an adventure can have more than one quest once ai-planner
  // ships (adventures.route.ts's questsTotal/questsCompleted already
  // assume this), and current_quest_id is the source of truth for which
  // one is active.
  const { data: quest, error: questError } = await supabase
    .from("quests")
    .select("*")
    .eq("id", currentQuestId)
    .maybeSingle();

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
