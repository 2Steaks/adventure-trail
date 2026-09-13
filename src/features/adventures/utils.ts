import { type WizardState } from "@/src/components/game/wizard/Wizard";
import { useAdventure } from "@/src/features/adventures/hooks";
import { useEncounter } from "@/src/features/game/hooks";
import { type EncounterOutput } from "@/src/features/game/encounter.schema";

export const getCurrentQuest = (
  data: ReturnType<typeof useAdventure>["data"],
) => {
  const currentQuestId = data?.gameState.currentQuestId;
  return data?.quests.find((quest) => quest.id === currentQuestId);
};

// The quest is still ongoing (same landmark, same conversation) unless this
// encounter's own actions resolved it — used to decide whether picking a
// choice should keep talking to the wizard or hand control back to the
// arrival flow for the next quest.
export const didCompleteObjective = (encounterData?: EncounterOutput) =>
  encounterData?.actions.some(
    (action) => action.type === "COMPLETE_OBJECTIVE",
  ) ?? false;

export const getWizardState = (
  encounter: ReturnType<typeof useEncounter>,
  arrived: boolean,
): WizardState => {
  if (encounter.isPending) {
    return "thinking";
  } else if (encounter.isError) {
    return "unexpected-event";
  } else if (encounter.data) {
    return didCompleteObjective(encounter.data) ? "quest-completed" : "waiting";
  } else if (arrived) {
    return "quest-available";
  }

  return "idle";
};

export const getMapUrl = (quest: ReturnType<typeof getCurrentQuest>) => {
  if (!quest) return undefined;

  const destination = `${quest.latitude},${quest.longitude}`;

  if (
    typeof navigator !== "undefined" &&
    /iPhone|iPad|iPod/.test(navigator.userAgent)
  ) {
    return `https://maps.apple.com/?daddr=${destination}`;
  }

  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
};
