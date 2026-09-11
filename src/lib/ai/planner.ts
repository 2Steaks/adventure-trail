import type { AdventurePlan } from "@/src/lib/schemas/adventure-plan";
import type { Place } from "@/src/lib/places/rank";

export function invalidLocationIds(
  plan: AdventurePlan,
  locations: Place[],
): string[] {
  const validIds = new Set(locations.map((location) => location.id));
  return plan.quests
    .map((quest) => quest.locationId)
    .filter((locationId) => !validIds.has(locationId));
}
