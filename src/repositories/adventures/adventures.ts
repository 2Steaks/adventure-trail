import { SupabaseClient } from "@supabase/supabase-js";

type AdventureInsert = {
    user_id: string;
    title: string;
    theme: string;
    age_min: number;
    age_max: number;
    duration_minutes: number;
    max_distance_meters: number;
    starting_lat: number;
    starting_lng: number;
};

export const adventuresRepository = {
    createAdventure(db: SupabaseClient, payload: AdventureInsert) {
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