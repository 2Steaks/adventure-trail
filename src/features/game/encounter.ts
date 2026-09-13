import { generateText, Output } from "ai";
import { EncounterError, EncounterInput } from "./encounter.types";
import { EncounterOutput, encounterOutputSchema } from "./encounter.schema";
import { anthropic } from "@ai-sdk/anthropic";
import { validateEncounterActions } from "./encounter-actions";

function buildPrompt(input: EncounterInput, correction?: string): string {
  const completedList =
    input.completedQuestObjectives.length > 0
      ? input.completedQuestObjectives
          .map((objective) => `- ${objective}`)
          .join("\n")
      : "(none yet)";

  const inventoryList =
    input.inventory.length > 0 ? input.inventory.join(", ") : "(empty)";

  const messageLog =
    input.recentMessages.length > 0
      ? input.recentMessages
          .map((message) => `${message.role}: ${message.content}`)
          .join("\n")
      : "(none yet)";

  return `You are a Dungeon Master narrating a short, real-world encounter for a child who just arrived at a landmark.

Theme: ${input.theme}
Player age range: ${input.ageMin}-${input.ageMax}
Landmark: ${input.landmarkName} (${input.landmarkType})
Current quest objective: ${input.currentQuestObjective} (type: ${input.currentQuestType})
Completed quests so far:
${completedList}
Inventory: ${inventoryList}
Recent conversation:
${messageLog}

Write a short, kid-friendly encounter message narrating what happens at this landmark. Offer 0 or more short choices the player could respond with (id + label) — these are flavor only, not mechanically significant. Then propose actions:
- Use "COMPLETE_OBJECTIVE" with questId "${input.currentQuestId}" if the encounter resolves the current objective. You may ONLY use this exact questId.
- Use "ADD_ITEM" with a short itemId if the encounter grants the player an item.
It's fine to propose zero actions if nothing changes yet.
${input.isFinalQuest ? 'This is the FINAL quest of the adventure — if you complete the objective, write a closing, "The End"-style message and return an empty choices array.' : ""}${correction ? `\n\n${correction}` : ""}`;
}

async function requestEncounter(
  input: EncounterInput,
  correction?: string,
): Promise<EncounterOutput> {
  const { output } = await generateText({
    model: anthropic("claude-haiku-4-5"),
    prompt: buildPrompt(input, correction),
    output: Output.object({ schema: encounterOutputSchema }),
  });

  return output;
}

export async function generateEncounter(
  input: EncounterInput,
): Promise<EncounterOutput> {
  const first = await requestEncounter(input);
  const firstInvalid = validateEncounterActions(
    first.actions,
    input.currentQuestId,
  );

  if (firstInvalid.length === 0) {
    return first;
  }

  const retry = await requestEncounter(
    input,
    `Your previous response proposed invalid action(s): ${firstInvalid.join("; ")}. Only propose COMPLETE_OBJECTIVE for questId "${input.currentQuestId}", and always include a non-empty itemId on ADD_ITEM.`,
  );
  const retryInvalid = validateEncounterActions(
    retry.actions,
    input.currentQuestId,
  );

  if (retryInvalid.length === 0) {
    return retry;
  }

  throw new EncounterError(
    `Encounter Generator produced invalid actions twice: ${retryInvalid.join("; ")}`,
  );
}
