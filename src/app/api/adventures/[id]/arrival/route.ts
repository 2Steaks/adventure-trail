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
    .select("id, status, game_states(current_quest_id)")
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

  if (result.arrived) {
    // Each write is gated on its own current status, not on the other
    // table's — so a partial failure (e.g. the quest update succeeds but
    // the adventure update doesn't) is recoverable on retry, rather than
    // permanently skipped because "the quest already looks completed."
    if (quest.status !== "completed") {
      const { error: questUpdateError } = await supabase
        .from("quests")
        .update({ status: "completed" })
        .eq("id", quest.id);
      if (questUpdateError) {
        return NextResponse.json(
          { error: questUpdateError.message },
          { status: 400 },
        );
      }
    }

    if (adventure.status !== "completed") {
      const { error: adventureUpdateError } = await supabase
        .from("adventures")
        .update({ status: "completed" })
        .eq("id", id);
      if (adventureUpdateError) {
        return NextResponse.json(
          { error: adventureUpdateError.message },
          { status: 400 },
        );
      }
    }
  }

  return NextResponse.json(result);
}
