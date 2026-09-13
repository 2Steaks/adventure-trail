import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/src/services/supabase/supabase.database";

type AdventureInsert = Database["public"]["Tables"]["adventures"]["Insert"];

export class AdventureClient {
  constructor(private db: SupabaseClient<Database>) {}

  async createAdventure(payload: AdventureInsert) {
    return this.db.from("adventures").insert(payload).select().single();
  }

  async getUserAdventures(userId: string) {
    return this.db
      .from("adventures")
      .select("*, quests(status)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
  }

  async getWithGameState(adventureId: string, userId: string) {
    return this.db
      .from("adventures")
      .select("id, game_states(current_quest_id)")
      .eq("id", adventureId)
      .eq("user_id", userId)
      .maybeSingle();
  }

  async getById(adventureId: string, userId: string) {
    return this.db
      .from("adventures")
      .select("*")
      .eq("id", adventureId)
      .eq("user_id", userId)
      .maybeSingle();
  }

  async getForEncounter(adventureId: string, userId: string) {
    return this.db
      .from("adventures")
      .select(
        "id, theme, age_min, age_max, game_states(current_quest_id, inventory)",
      )
      .eq("id", adventureId)
      .eq("user_id", userId)
      .maybeSingle();
  }

  async updateStatus(adventureId: string, status: string) {
    return this.db.from("adventures").update({ status }).eq("id", adventureId);
  }

  async remove(adventureId: string) {
    return this.db.from("adventures").delete().eq("id", adventureId);
  }
}
