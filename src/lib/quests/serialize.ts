import type { Place } from "@/src/lib/places/rank";
import type { PlanQuest } from "@/src/types/adventure";
import type { QuestInsert } from "@/src/types/quest";

// Arrival radius isn't LLM-controlled — a fixed, reliable value the same way
// every quest so far has used, independent of which landmark gets picked.
const QUEST_RADIUS_METERS = 40;

export function serializeQuests(
	planQuests: PlanQuest[],
	locations: Place[],
	adventureId: string,
): QuestInsert[] {
	const candidatesById = new Map(locations.map((c) => [c.id, c]));

	return planQuests.map((quest, index) => {
		const location = candidatesById.get(quest.locationId);

		if (!location) {
			throw new Error(`Candidate not found: ${quest.locationId}`);
		}

		return {
			adventure_id: adventureId,
			position: index + 1,
			objective: quest.objective,
			type: quest.type,
			landmark_name: location.name,
			landmark_type: location.type,
			latitude: location.latitude,
			longitude: location.longitude,
			radius_meters: QUEST_RADIUS_METERS,
		};
	});
}
