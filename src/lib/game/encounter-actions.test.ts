import { describe, expect, it } from "vitest";
import { validateEncounterActions } from "./encounter-actions";
import type { EncounterAction } from "@/src/lib/schemas/encounter";

const CURRENT_QUEST_ID = "quest-1";

describe("validateEncounterActions", () => {
  it("returns an empty array when every action is valid", () => {
    const actions: EncounterAction[] = [
      { type: "COMPLETE_OBJECTIVE", questId: CURRENT_QUEST_ID },
      { type: "ADD_ITEM", itemId: "shiny-coin" },
    ];

    expect(validateEncounterActions(actions, CURRENT_QUEST_ID)).toEqual([]);
  });

  it("rejects a COMPLETE_OBJECTIVE targeting a different quest", () => {
    const actions: EncounterAction[] = [
      { type: "COMPLETE_OBJECTIVE", questId: "quest-999" },
    ];

    const reasons = validateEncounterActions(actions, CURRENT_QUEST_ID);

    expect(reasons).toHaveLength(1);
    expect(reasons[0]).toMatch(/quest-999/);
  });

  it("rejects an ADD_ITEM missing itemId", () => {
    const actions: EncounterAction[] = [
      { type: "ADD_ITEM", itemId: "" },
    ];

    expect(validateEncounterActions(actions, CURRENT_QUEST_ID)).toHaveLength(1);
  });

  it("reports each invalid action independently, not just the first", () => {
    const actions: EncounterAction[] = [
      { type: "COMPLETE_OBJECTIVE", questId: "quest-999" },
      { type: "ADD_ITEM", itemId: "" },
    ];

    expect(validateEncounterActions(actions, CURRENT_QUEST_ID)).toHaveLength(2);
  });
});
