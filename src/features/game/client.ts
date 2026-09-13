import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/src/services/supabase/supabase.database";

interface CreateParams {
  adventureId: string;
  questId: string;
}

export class GameStateClient {
  constructor(private db: SupabaseClient<Database>) {}

  async create({ adventureId, questId }: CreateParams) {
    return this.db.from("game_states").insert({
      adventure_id: adventureId,
      current_quest_id: questId,
    });
  }

  async getByAdventureId(adventureId: string) {
    return this.db
      .from("game_states")
      .select("*")
      .eq("adventure_id", adventureId)
      .single();
  }

  async updateCurrentQuest(adventureId: string, questId: string | null) {
    return this.db
      .from("game_states")
      .update({ current_quest_id: questId })
      .eq("adventure_id", adventureId);
  }

  async updateInventory(adventureId: string, inventory: string[]) {
    return this.db
      .from("game_states")
      .update({ inventory })
      .eq("adventure_id", adventureId);
  }
}
