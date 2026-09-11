export type AdventureRow = {
  id: string;
  user_id: string;
  title: string;
  theme: string;
  age_min: number;
  age_max: number;
  duration_minutes: number;
  max_distance_meters: number;
  starting_lat: number;
  starting_lng: number;
  status: string;
  created_at: string;
  updated_at: string;
};

export type SerializedAdventure = ReturnType<typeof serializeAdventure>;

export type AdventureSummary = SerializedAdventure & {
  questsTotal: number;
  questsCompleted: number;
};

export type QuestRow = {
  id: string;
  adventure_id: string;
  position: number;
  objective: string;
  type: string;
  landmark_name: string;
  landmark_type: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  status: string;
  created_at: string;
};

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
