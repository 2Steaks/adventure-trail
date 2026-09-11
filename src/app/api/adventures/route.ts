import { NextResponse } from "next/server";
import { requireUser } from "@/src/lib/supabase/require-user";
import { createAdventureSchema } from "@/src/lib/schemas/adventure";
import { HARD_CODED_QUEST } from "@/src/lib/game/hard-coded-quest";
import {
  serializeAdventure,
  type AdventureRow,
} from "@/src/lib/adventures/serialize";

export async function GET() {
  const { user, supabase } = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("adventures")
    .select("*, quests(status)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const adventures = (
    data as (AdventureRow & { quests: { status: string }[] })[]
  ).map((row) => ({
    ...serializeAdventure(row),
    questsTotal: row.quests.length,
    questsCompleted: row.quests.filter((q) => q.status === "completed")
      .length,
  }));

  return NextResponse.json({ adventures });
}

export async function POST(request: Request) {
  const { user, supabase } = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid adventure details." },
      { status: 400 },
    );
  }

  const body = createAdventureSchema.safeParse(json);
  if (!body.success) {
    return NextResponse.json(
      { error: "Invalid adventure details." },
      { status: 400 },
    );
  }

  const { data: adventure, error: adventureError } = await supabase
    .from("adventures")
    .insert({
      user_id: user.id,
      title: body.data.theme,
      theme: body.data.theme,
      age_min: body.data.ageMin,
      age_max: body.data.ageMax,
      duration_minutes: body.data.durationMinutes,
      max_distance_meters: body.data.maxDistanceMeters,
      starting_lat: HARD_CODED_QUEST.latitude,
      starting_lng: HARD_CODED_QUEST.longitude,
    })
    .select()
    .single();

  if (adventureError) {
    return NextResponse.json({ error: adventureError.message }, { status: 400 });
  }

  const { data: quest, error: questError } = await supabase
    .from("quests")
    .insert({
      adventure_id: adventure.id,
      position: 1,
      objective: HARD_CODED_QUEST.objective,
      type: HARD_CODED_QUEST.type,
      landmark_name: HARD_CODED_QUEST.landmarkName,
      landmark_type: HARD_CODED_QUEST.landmarkType,
      latitude: HARD_CODED_QUEST.latitude,
      longitude: HARD_CODED_QUEST.longitude,
      radius_meters: HARD_CODED_QUEST.radiusMeters,
    })
    .select()
    .single();

  if (questError) {
    return NextResponse.json({ error: questError.message }, { status: 400 });
  }

  const { error: gameStateError } = await supabase.from("game_states").insert({
    adventure_id: adventure.id,
    current_quest_id: quest.id,
  });

  if (gameStateError) {
    return NextResponse.json({ error: gameStateError.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    adventure: serializeAdventure(adventure as AdventureRow),
  });
}
