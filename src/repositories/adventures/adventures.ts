import { SupabaseClient } from "@supabase/supabase-js";

export const adventuresRepository = {
    createAdventure(db: SupabaseClient, payload: any) {
          return db
            .from("adventures")
            .insert(payload)
            .select()
            .single();
    },

    getAdventuresByUserId(db: SupabaseClient, userId: string) {
       return db
            .from("adventures")
            .select("*, quests(status)")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

    }
}