import type { Database } from "@/src/services/supabase/supabase.database";
import { DatabaseClient } from "@/src/services/supabase/supabase.types";

type QuestInsert = Database["public"]["Tables"]["quests"]["Insert"];

export class QuestClient {
  constructor(private db: DatabaseClient) {}

  async getQuest(questId: string) {
    return this.db.from("quests").select("*").eq("id", questId).maybeSingle();
  }

  async getByAdventureId(adventureId: string) {
    return this.db
      .from("quests")
      .select("*")
      .eq("adventure_id", adventureId)
      .order("position", { ascending: true });
  }

  async createQuests(payload: QuestInsert[]) {
    return this.db
      .from("quests")
      .insert(payload)
      .select()
      .order("position", { ascending: true });
  }

  async updateStatus(questId: string, status: string) {
    return this.db.from("quests").update({ status }).eq("id", questId);
  }
}
