import { NextResponse } from "next/server";
import { requireUser } from "@/src/lib/supabase/require-user";
import {
  generateEncounter,
  EncounterError,
  type EncounterMessage,
} from "@/src/lib/ai/encounter";
import type { QuestRow } from "@/src/lib/adventures/serialize";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, supabase } = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { data: adventure, error: adventureError } = await supabase
    .from("adventures")
    .select(
      "id, theme, age_min, age_max, game_states(current_quest_id, inventory)",
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (adventureError) {
    return NextResponse.json(
      { error: adventureError.message },
      { status: 400 },
    );
  }

  if (!adventure) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // game_states.adventure_id is that table's primary key, so this embed is
  // a to-one relationship — see the same note in arrival/route.ts.
  const gameState = adventure.game_states as unknown as {
    current_quest_id: string | null;
    inventory: string[];
  } | null;
  // Read fresh on every call, never cached across requests — a repeat call
  // after a completion has already advanced current_quest_id, so it starts
  // a new encounter for the new current quest rather than re-completing
  // the one that just finished.
  const currentQuestId = gameState?.current_quest_id ?? null;

  if (!currentQuestId) {
    return NextResponse.json(
      { error: "This adventure has no active quest." },
      { status: 409 },
    );
  }

  // Neither query depends on the other's result — both only need `id` —
  // so they run concurrently rather than as two sequential round trips.
  const [questsResult, messagesResult] = await Promise.all([
    supabase
      .from("quests")
      .select("*")
      .eq("adventure_id", id)
      .order("position", { ascending: true }),
    supabase
      .from("messages")
      .select("role, content")
      .eq("adventure_id", id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  if (questsResult.error) {
    return NextResponse.json(
      { error: questsResult.error.message },
      { status: 400 },
    );
  }
  if (messagesResult.error) {
    return NextResponse.json(
      { error: messagesResult.error.message },
      { status: 400 },
    );
  }

  const allQuests = questsResult.data as QuestRow[];
  const currentIndex = allQuests.findIndex((quest) => quest.id === currentQuestId);
  const currentQuest = allQuests[currentIndex];

  if (!currentQuest) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const nextQuest = allQuests[currentIndex + 1] ?? null;
  const recentMessages = messagesResult.data;

  let output;
  try {
    output = await generateEncounter({
      theme: adventure.theme,
      ageMin: adventure.age_min,
      ageMax: adventure.age_max,
      currentQuestId,
      currentQuestObjective: currentQuest.objective,
      currentQuestType: currentQuest.type,
      landmarkName: currentQuest.landmark_name,
      landmarkType: currentQuest.landmark_type,
      completedQuestObjectives: allQuests
        .filter((quest) => quest.status === "completed")
        .map((quest) => quest.objective),
      inventory: gameState?.inventory ?? [],
      recentMessages: (recentMessages as EncounterMessage[])
        .slice()
        .reverse(),
      isFinalQuest: nextQuest === null,
    });
  } catch (error) {
    // Same posture as the Adventure Planner route: any encounter-call
    // failure (invalid actions after retry, or a raw AI SDK error) must
    // surface as JSON, never an unhandled crash that fetchJson()
    // misreports as an expired session.
    console.error("Encounter Generator call failed", error);
    if (error instanceof EncounterError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    return NextResponse.json(
      { error: "The wizard is unavailable right now. Try again." },
      { status: 502 },
    );
  }

  // Accumulated locally and written once per ADD_ITEM action, starting
  // from the inventory already loaded above — no need to re-read
  // game_states between actions since nothing else in this loop touches
  // the inventory column.
  let inventory = gameState?.inventory ?? [];

  for (const action of output.actions) {
    if (action.type === "COMPLETE_OBJECTIVE") {
      const { error: questUpdateError } = await supabase
        .from("quests")
        .update({ status: "completed" })
        .eq("id", action.questId);
      if (questUpdateError) {
        return NextResponse.json(
          { error: questUpdateError.message },
          { status: 400 },
        );
      }

      const { error: gameStateUpdateError } = await supabase
        .from("game_states")
        .update({ current_quest_id: nextQuest?.id ?? null })
        .eq("adventure_id", id);
      if (gameStateUpdateError) {
        return NextResponse.json(
          { error: gameStateUpdateError.message },
          { status: 400 },
        );
      }

      if (!nextQuest) {
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

    if (action.type === "ADD_ITEM") {
      inventory = [...inventory, action.itemId];

      const { error: inventoryUpdateError } = await supabase
        .from("game_states")
        .update({ inventory })
        .eq("adventure_id", id);
      if (inventoryUpdateError) {
        return NextResponse.json(
          { error: inventoryUpdateError.message },
          { status: 400 },
        );
      }
    }
  }

  const { error: messageInsertError } = await supabase.from("messages").insert({
    adventure_id: id,
    role: "assistant",
    content: output.message,
  });
  if (messageInsertError) {
    return NextResponse.json(
      { error: messageInsertError.message },
      { status: 400 },
    );
  }

  return NextResponse.json(output);
}
