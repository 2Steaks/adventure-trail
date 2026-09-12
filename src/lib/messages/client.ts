import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/src/types/database";

interface InsertParams {
	adventureId: string;
	role: string;
	content: string;
}

export class MessageClient {
	constructor(private db: SupabaseClient<Database>) {}

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
