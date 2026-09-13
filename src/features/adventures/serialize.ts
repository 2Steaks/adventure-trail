import type { Database } from "@/src/services/supabase/supabase.database";

export type AdventureRow = Database["public"]["Tables"]["adventures"]["Row"];

export type SerializedAdventure = ReturnType<typeof serializeAdventure>;

export type AdventureSummary = SerializedAdventure & {
  questsTotal: number;
  questsCompleted: number;
};

export type QuestRow = Database["public"]["Tables"]["quests"]["Row"];

export function serializeAdventure(row: AdventureRow) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    theme: row.theme,
    ageMin: row.age_min,
    ageMax: row.age_max,
    durationMinutes: row.duration_minutes,
    maxDistanceMeters: row.max_distance_meters,
    startingLat: row.starting_lat,
    startingLng: row.starting_lng,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export type SerializedQuest = ReturnType<typeof serializeQuest>;

// game_states also has a `state` column (unused by this app so far) and
// `inventory` is a Json column in the DB — narrowed to string[] here since
// that's the only shape this app ever writes into it.
export type GameStateRow = Pick<
  Database["public"]["Tables"]["game_states"]["Row"],
  "adventure_id" | "current_quest_id" | "updated_at"
> & {
  inventory: string[];
};

export type SerializedGameState = ReturnType<typeof serializeGameState>;

export function serializeGameState(row: GameStateRow) {
  return {
    adventureId: row.adventure_id,
    currentQuestId: row.current_quest_id,
    inventory: row.inventory,
    updatedAt: row.updated_at,
  };
}

export function serializeQuest(row: QuestRow) {
  return {
    id: row.id,
    adventureId: row.adventure_id,
    position: row.position,
    objective: row.objective,
    type: row.type,
    landmarkName: row.landmark_name,
    landmarkType: row.landmark_type,
    latitude: row.latitude,
    longitude: row.longitude,
    radiusMeters: row.radius_meters,
    status: row.status,
    createdAt: row.created_at,
  };
}
