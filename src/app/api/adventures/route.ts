import { NextResponse } from "next/server";
import { requireUser } from "@/src/lib/supabase/require-user";
import { createAdventureSchema } from "@/src/lib/schemas/adventure";
import {
  fetchNearbyPlaces,
  NearbyPlacesFetchError,
} from "@/src/lib/places/fetch-nearby-places";
import { generateAdventurePlan, AdventurePlanError } from "@/src/lib/ai/planner";
import {
  serializeAdventure,
  type AdventureRow,
} from "@/src/lib/adventures/serialize";

// Arrival radius isn't LLM-controlled — a fixed, reliable value the same way
// every quest so far has used, independent of which landmark gets picked.
const QUEST_RADIUS_METERS = 40;

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

  const {
    theme,
    ageMin,
    ageMax,
    durationMinutes,
    maxDistanceMeters,
    startingLat,
    startingLng,
  } = body.data;

  // Nothing is written to the database until a valid plan exists — a
  // failure here (no candidates, or the planner never producing a valid
  // result) leaves zero rows behind, no rollback needed.
  let candidates;
  try {
    candidates = await fetchNearbyPlaces({
      lat: startingLat,
      lng: startingLng,
      radiusMeters: maxDistanceMeters,
    });
  } catch (error) {
    if (error instanceof NearbyPlacesFetchError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    throw error;
  }

  if (candidates.length === 0) {
    return NextResponse.json(
      { error: "Couldn't find any landmarks near that location. Try again." },
      { status: 502 },
    );
  }

  let plan;
  try {
    plan = await generateAdventurePlan({
      theme,
      ageMin,
      ageMax,
      durationMinutes,
      locations: candidates,
    });
  } catch (error) {
    if (error instanceof AdventurePlanError) {
      return NextResponse.json(
        { error: "Couldn't plan an adventure for that location. Try again." },
        { status: 502 },
      );
    }
    throw error;
  }

  const { data: adventure, error: adventureError } = await supabase
    .from("adventures")
    .insert({
      user_id: user.id,
      title: plan.title,
      theme,
      age_min: ageMin,
      age_max: ageMax,
      duration_minutes: durationMinutes,
      max_distance_meters: maxDistanceMeters,
      starting_lat: startingLat,
      starting_lng: startingLng,
    })
    .select()
    .single();

  if (adventureError) {
    return NextResponse.json(
      { error: adventureError.message },
      { status: 400 },
    );
  }

  const candidatesById = new Map(candidates.map((c) => [c.id, c]));

  const { data: quests, error: questsError } = await supabase
    .from("quests")
    .insert(
      plan.quests.map((quest, index) => {
        const location = candidatesById.get(quest.locationId)!;
        return {
          adventure_id: adventure.id,
          position: index + 1,
          objective: quest.objective,
          type: quest.type,
          landmark_name: location.name,
          landmark_type: location.type,
          latitude: location.latitude,
          longitude: location.longitude,
          radius_meters: QUEST_RADIUS_METERS,
        };
      }),
    )
    .select()
    .order("position", { ascending: true });

  if (questsError) {
    return NextResponse.json({ error: questsError.message }, { status: 400 });
  }

  const { error: gameStateError } = await supabase.from("game_states").insert({
    adventure_id: adventure.id,
    current_quest_id: quests[0].id,
  });

  if (gameStateError) {
    return NextResponse.json(
      { error: gameStateError.message },
      { status: 400 },
    );
  }

  return NextResponse.json({
    success: true,
    adventure: serializeAdventure(adventure as AdventureRow),
  });
}
