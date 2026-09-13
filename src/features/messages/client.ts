import { DatabaseClient } from "@/src/services/supabase/supabase.types";

interface InsertParams {
  adventureId: string;
  questId: string;
  role: string;
  content: string;
}

export class MessageClient {
  constructor(private db: DatabaseClient) {}

  async insert({ adventureId, questId, role, content }: InsertParams) {
    return this.db.from("messages").insert({
      adventure_id: adventureId,
      quest_id: questId,
      role,
      content,
    });
  }

  // Scoped to quest_id, not just adventure_id — otherwise a new quest's
  // encounter prompt pulls conversation from whichever quest came before it.
  async getRecent(adventureId: string, questId: string, limit: number) {
    return this.db
      .from("messages")
      .select("role, content")
      .eq("adventure_id", adventureId)
      .eq("quest_id", questId)
      .order("created_at", { ascending: false })
      .limit(limit);
  }
}
