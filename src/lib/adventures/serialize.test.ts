import { describe, expect, it } from "vitest";
import { serializeGameState, type GameStateRow } from "./serialize";

describe("serializeGameState", () => {
  it("maps a game state row to camelCase", () => {
    const row: GameStateRow = {
      adventure_id: "adventure-1",
      current_quest_id: "quest-1",
      inventory: ["shiny-coin"],
      updated_at: "2026-09-11T00:00:00.000Z",
    };

    expect(serializeGameState(row)).toEqual({
      adventureId: "adventure-1",
      currentQuestId: "quest-1",
      inventory: ["shiny-coin"],
      updatedAt: "2026-09-11T00:00:00.000Z",
    });
  });

  it("preserves a null current_quest_id (adventure fully completed)", () => {
    const row: GameStateRow = {
      adventure_id: "adventure-1",
      current_quest_id: null,
      inventory: [],
      updated_at: "2026-09-11T00:00:00.000Z",
    };

    expect(serializeGameState(row).currentQuestId).toBeNull();
  });
});
