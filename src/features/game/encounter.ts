import { generateText, Output } from "ai";
import { EncounterError, EncounterInput } from "./encounter.types";
import { EncounterOutput, encounterOutputSchema } from "./encounter.schema";
import { anthropic } from "@ai-sdk/anthropic";
import { validateEncounterActions } from "./encounter-actions";
import { dedent, formatList } from "@/src/utils/format";

function buildPrompt(input: EncounterInput, correction?: string): string {
  const completedQuests = formatList(
    input.completedQuestObjectives,
    (objective) => `- ${objective}`,
  );

  const inventory = formatList(input.inventory, String, "(empty)");

  const recentMessages = formatList(
    input.recentMessages,
    (message) => `${message.role}: ${message.content}`,
  );

  const finalQuestInstruction = input.isFinalQuest
    ? `This is the FINAL quest of the adventure — if you complete the objective, write a closing, "The End"-style message and return an empty choices array.`
    : "";

  return dedent`
    You are a Dungeon Master narrating a short, real-world encounter
    for a child who just arrived at a landmark.

    Theme: ${input.theme}
    Player age range: ${input.ageMin}-${input.ageMax}
    Landmark: ${input.landmarkName} (${input.landmarkType})
    Current quest objective: ${input.currentQuestObjective}
    Current quest type: ${input.currentQuestType}

    Real-world accuracy is critical.
    Only describe things that are known from the information provided.
    Do not invent, assume, or guess facts about the landmark, its history,
    buildings, facilities, people, animals, events, surroundings, or rules.
    Do not claim that something is present, open, accessible, or happening
    unless it is provided in the input.
    The landmark is only a setting for the fictional encounter; keep fictional
    events clearly separate from real-world facts.
    When in doubt, keep the description fictional and generic rather than
    making up a real-world detail.

    Completed quests so far:
    ${completedQuests}

    Inventory:
    ${inventory}

    Recent conversation:
    ${recentMessages}

    Write a short, kid-friendly encounter message narrating what happens
    at this landmark.

    Keep the encounter message between 50 and 80 words.
    Use short sentences.
    Keep paragraphs short and easy to read.
    Do not add unnecessary descriptions, backstory, or exposition.
    Make the encounter feel fun and exciting without making the text long.

    Offer 0 to 3 short choices the player could respond with
    (id + label). These are flavor only, not mechanically significant.
    Keep each choice label to 5 words or fewer.

    Then propose actions:
    - Use "COMPLETE_OBJECTIVE" with questId "${input.currentQuestId}"
      if the encounter resolves the current objective.
    - Use "ADD_ITEM" with a short itemId if the encounter grants the player an item.

    It's fine to propose zero actions if nothing changes yet.

    ${finalQuestInstruction}

    ${correction ?? ""}
  `;
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
