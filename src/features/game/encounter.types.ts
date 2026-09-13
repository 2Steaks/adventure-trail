export class EncounterError extends Error {}

export type EncounterMessage = {
  role: "user" | "assistant";
  content: string;
};

export type EncounterInput = {
  theme: string;
  ageMin: number;
  ageMax: number;
  currentQuestId: string;
  currentQuestObjective: string;
  currentQuestType: string;
  landmarkName: string;
  landmarkType: string;
  completedQuestObjectives: string[];
  inventory: string[];
  recentMessages: EncounterMessage[];
  isFinalQuest: boolean;
};
