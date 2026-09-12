import { NextResponse } from "next/server";
import { AdventureClient } from "@/src/lib/adventures/client";
import { serializeAdventure } from "@/src/lib/adventures/serialize";
import {
  AdventurePlanError,
  generateAdventurePlan,
} from "@/src/lib/ai/planner";
import { GameStateClient } from "@/src/lib/game/client";
import { QuestClient } from "@/src/lib/quests/client";
import { serializeQuests } from "@/src/lib/quests/serialize";
import {
  createAdventureSchema,
  deleteAdventureSchema,
} from "@/src/lib/schemas/adventure";
import { requireUser } from "@/src/lib/supabase/require-user";
import {
  NearbyPlacesFetchError,
  overpassClient,
} from "@/src/lib/places/client";

export async function GET() {
  const { user, supabase } = await requireUser();
  const adventureClient = new AdventureClient(supabase);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await adventureClient.getUserAdventures(user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const adventures = data.map((row) => ({
    ...serializeAdventure(row),
    questsTotal: row.quests.length,
    questsCompleted: row.quests.filter((q) => q.status === "completed").length,
  }));

  return NextResponse.json({ adventures });
}

export async function POST(request: Request) {
  const { user, supabase } = await requireUser();
  const adventureClient = new AdventureClient(supabase);
  const gameClient = new GameStateClient(supabase);
  const questClient = new QuestClient(supabase);

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
  // failure here (no locations, or the planner never producing a valid
  // result) leaves zero rows behind, no rollback needed.
  let locations;
  try {
    locations = await overpassClient.findNearbyPlaces({
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

  if (locations.length === 0) {
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
      locations,
    });
  } catch (error) {
    // Any planner failure (invalid output after retry, or a raw AI SDK
    // error like a bad API key/network/rate-limit) must surface as a
    // JSON error, never an unhandled crash — an uncaught throw here
    // reaches the client as a bodyless, non-JSON 500 that fetchJson()
    // then misreports as an expired session.
    console.error("Adventure Planner call failed", error);

    if (error instanceof AdventurePlanError) {
      return NextResponse.json(
        { error: "Couldn't plan an adventure for that location. Try again." },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { error: "The AI adventure planner is unavailable. Try again." },
      { status: 502 },
    );
  }

  const { data: adventure, error: adventureError } =
    await adventureClient.createAdventure({
      user_id: user.id,
      title: plan.title,
      theme,
      age_min: ageMin,
      age_max: ageMax,
      duration_minutes: durationMinutes,
      max_distance_meters: maxDistanceMeters,
      starting_lat: startingLat,
      starting_lng: startingLng,
    });

  if (adventureError) {
    return NextResponse.json(
      { error: adventureError.message },
      { status: 400 },
    );
  }

  const { data: quests, error: questsError } = await questClient.createQuests(
    serializeQuests(plan.quests, locations, adventure.id),
  );

  if (questsError) {
    return NextResponse.json({ error: questsError.message }, { status: 400 });
  }

  const { error: gameStateError } = await gameClient.create({
    adventureId: adventure.id,
    questId: quests[0].id,
  });

  if (gameStateError) {
    return NextResponse.json(
      { error: gameStateError.message },
      { status: 400 },
    );
  }

  return NextResponse.json({
    success: true,
    adventure: serializeAdventure(adventure),
  });
}

export async function DELETE(request: Request) {
  const { user, supabase } = await requireUser();
  const adventureClient = new AdventureClient(supabase);

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

  const body = deleteAdventureSchema.safeParse(json);
  if (!body.success) {
    return NextResponse.json(
      { error: "Invalid adventure details." },
      { status: 400 },
    );
  }

  const { error } = await adventureClient.remove(body.data.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
