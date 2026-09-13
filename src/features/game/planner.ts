import { generateText, Output } from "ai";
import { anthropic } from "@/src/services/ai";
import { Place } from "@/src/services/overpass/overpass.types";
import {
  AdventurePlan,
  adventurePlanSchema,
} from "../adventures/adventure-plan.schema";
import { dedent } from "@/src/utils/format";

export class AdventurePlanError extends Error {}

export type PlannerInput = {
  theme: string;
  ageMin: number;
  ageMax: number;
  durationMinutes: number;
  locations: Place[];
};

function buildPrompt(input: PlannerInput, correction?: string): string {
  const locationList = input.locations
    .map(
      (location) =>
        `- id: "${location.id}", name: "${location.name}", type: ${location.type}, ${Math.round(location.distanceMeters)}m away`,
    )
    .join("\n");

  return dedent`
    You are a Dungeon Master planning a short, real-world walking adventure for a child.

    Theme: ${input.theme}
    Player age range: ${input.ageMin}-${input.ageMax}
    Adventure duration: about ${input.durationMinutes} minutes

    Here are the only real-world landmarks the player can visit. You may ONLY reference these by their exact "id" value — never invent a location or use an id not in this list:
    ${locationList}

    Write a short adventure title and a sequence of quests (roughly one quest every 20-30 minutes of the total duration, at least one). Each quest must reference exactly one of the supplied landmark ids as its locationId, have a short kid-friendly objective, and a type of "riddle", "exploration", or "discovery".
    ${correction ? `\n\n${correction}` : ""}
  `;
}

async function requestPlan(
  input: PlannerInput,
  correction?: string,
): Promise<AdventurePlan> {
  const { output } = await generateText({
    model: anthropic("claude-opus-5"),
    prompt: buildPrompt(input, correction),
    output: Output.object({ schema: adventurePlanSchema }),
  });

  return output;
}

export function invalidLocationIds(
  plan: AdventurePlan,
  locations: Place[],
): string[] {
  const validIds = new Set(locations.map((location) => location.id));
  return plan.quests
    .map((quest) => quest.locationId)
    .filter((locationId) => !validIds.has(locationId));
}

export async function generateAdventurePlan(
  input: PlannerInput,
): Promise<AdventurePlan> {
  const first = await requestPlan(input);
  const firstInvalid = invalidLocationIds(first, input.locations);

  if (firstInvalid.length === 0) {
    return first;
  }

  const retry = await requestPlan(
    input,
    `Your previous response used locationId(s) not in the supplied list: ${firstInvalid.join(", ")}. You may only use the ids given above.`,
  );

  const retryInvalid = invalidLocationIds(retry, input.locations);

  if (retryInvalid.length === 0) {
    return retry;
  }

  throw new AdventurePlanError(
    `Adventure Planner produced invalid locationIds twice: ${retryInvalid.join(", ")}`,
  );
}
