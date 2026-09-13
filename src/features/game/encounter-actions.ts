import type { EncounterAction } from "@/src/features/game/encounter.schema";

export function validateEncounterActions(
  actions: EncounterAction[],
  currentQuestId: string,
): string[] {
  return actions
    .map((action) => {
      if (
        action.type === "COMPLETE_OBJECTIVE" &&
        action.questId !== currentQuestId
      ) {
        return `COMPLETE_OBJECTIVE referenced questId "${action.questId}", but the current quest is "${currentQuestId}"`;
      }
      if (action.type === "ADD_ITEM" && !action.itemId) {
        return "ADD_ITEM action is missing itemId";
      }
      return null;
    })
    .filter((reason): reason is string => reason !== null);
}
