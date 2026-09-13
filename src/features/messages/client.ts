import { DatabaseClient } from "@/src/services/supabase/supabase.types";

interface InsertParams {
  adventureId: string;
  role: string;
  content: string;
}

export class MessageClient {
  constructor(private db: DatabaseClient) {}

  async insert({ adventureId, role, content }: InsertParams) {
    return this.db.from("messages").insert({
      adventure_id: adventureId,
      role,
      content,
    });
  }

  async getRecent(adventureId: string, limit: number) {
    return this.db
      .from("messages")
      .select("role, content")
      .eq("adventure_id", adventureId)
      .order("created_at", { ascending: false })
      .limit(limit);
  }
}
