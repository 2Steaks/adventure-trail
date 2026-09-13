import { type WizardState } from "@/src/components/game/wizard/Wizard";
import { useAdventure } from "@/src/features/adventures/hooks";
import { useEncounter } from "@/src/features/game/hooks";

export const getCurrentQuest = (
  data: ReturnType<typeof useAdventure>["data"],
) => {
  const currentQuestId = data?.gameState.currentQuestId;
  return data?.quests.find((quest) => quest.id === currentQuestId);
};

export const getWizardState = (
  encounter: ReturnType<typeof useEncounter>,
  arrived: boolean,
): WizardState => {
  if (encounter.isPending) {
    return "thinking";
  } else if (encounter.isError) {
    return "unexpected-event";
  } else if (encounter.data) {
    return encounter.data.actions.some(
      (action) => action.type === "COMPLETE_OBJECTIVE",
    )
      ? "quest-completed"
      : "waiting";
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
