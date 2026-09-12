import { NextResponse } from "next/server";
import { requireUser } from "@/src/lib/supabase/require-user";
import { AdventureClient } from "@/src/lib/adventures/client";
import { QuestClient } from "@/src/lib/quests/client";
import { GameStateClient } from "@/src/lib/game/client";
import {
  serializeAdventure,
  serializeGameState,
  serializeQuest,
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
  const adventureClient = new AdventureClient(supabase);
  const questClient = new QuestClient(supabase);
  const gameStateClient = new GameStateClient(supabase);

  const { data: adventure, error: adventureError } =
    await adventureClient.getById(id, user.id);

  if (adventureError) {
    return NextResponse.json(
      { error: adventureError.message },
      { status: 400 },
    );
  }

  if (!adventure) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: quests, error: questsError } =
    await questClient.getByAdventureId(id);

  if (questsError) {
    return NextResponse.json({ error: questsError.message }, { status: 400 });
  }

  const { data: gameState, error: gameStateError } =
    await gameStateClient.getByAdventureId(id);

  if (gameStateError) {
    return NextResponse.json(
      { error: gameStateError.message },
      { status: 400 },
    );
  }

  return NextResponse.json({
    adventure: serializeAdventure(adventure),
    quests: quests.map(serializeQuest),
    gameState: serializeGameState({
      ...gameState,
      inventory: (gameState.inventory as string[] | null) ?? [],
    }),
  });
}
