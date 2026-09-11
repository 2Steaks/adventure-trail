import { NextResponse } from "next/server";
import { requireUser } from "@/src/lib/supabase/require-user";
import {
  serializeAdventure,
  serializeGameState,
  serializeQuest,
  type AdventureRow,
  type GameStateRow,
  type QuestRow,
} from "@/src/lib/adventures/serialize";

export async function GET(
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
    .select("*")
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

  const { data: quests, error: questsError } = await supabase
    .from("quests")
    .select("*")
    .eq("adventure_id", id)
    .order("position", { ascending: true });

  if (questsError) {
    return NextResponse.json({ error: questsError.message }, { status: 400 });
  }

  const { data: gameState, error: gameStateError } = await supabase
    .from("game_states")
    .select("*")
    .eq("adventure_id", id)
    .single();

  if (gameStateError) {
    return NextResponse.json(
      { error: gameStateError.message },
      { status: 400 },
    );
  }

  return NextResponse.json({
    adventure: serializeAdventure(adventure as AdventureRow),
    quests: (quests as QuestRow[]).map(serializeQuest),
    gameState: serializeGameState(gameState as GameStateRow),
  });
}
