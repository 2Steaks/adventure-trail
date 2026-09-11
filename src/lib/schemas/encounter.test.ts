import { describe, expect, it } from "vitest";
import { encounterOutputSchema } from "./encounter";

const validOutput = {
  message: "The wizard peers at the fountain and smiles.",
  choices: [
    { id: "look-closer", label: "Look closer" },
    { id: "walk-away", label: "Walk away" },
  ],
  actions: [
    { type: "COMPLETE_OBJECTIVE", questId: "quest-1" },
    { type: "ADD_ITEM", itemId: "shiny-coin" },
  ],
};

describe("encounterOutputSchema", () => {
  it("accepts a valid output with choices and actions", () => {
    const result = encounterOutputSchema.safeParse(validOutput);

    expect(result.success).toBe(true);
  });

  it("accepts empty choices and actions arrays", () => {
    const result = encounterOutputSchema.safeParse({
      ...validOutput,
      choices: [],
      actions: [],
    });

    expect(result.success).toBe(true);
  });

  it("rejects a missing message", () => {
    const result = encounterOutputSchema.safeParse({
      choices: validOutput.choices,
      actions: validOutput.actions,
    });

    expect(result.success).toBe(false);
  });

  it("rejects a choice missing a label", () => {
    const result = encounterOutputSchema.safeParse({
      ...validOutput,
      choices: [{ id: "look-closer" }],
    });

    expect(result.success).toBe(false);
  });

  it("rejects an action with an unrecognized type", () => {
    const result = encounterOutputSchema.safeParse({
      ...validOutput,
      actions: [{ type: "GRANT_GOLD", questId: "quest-1" }],
    });

    expect(result.success).toBe(false);
  });

  it("rejects a COMPLETE_OBJECTIVE action missing questId", () => {
    const result = encounterOutputSchema.safeParse({
      ...validOutput,
      actions: [{ type: "COMPLETE_OBJECTIVE" }],
    });

    expect(result.success).toBe(false);
  });

  it("rejects an ADD_ITEM action missing itemId", () => {
    const result = encounterOutputSchema.safeParse({
      ...validOutput,
      actions: [{ type: "ADD_ITEM" }],
    });

    expect(result.success).toBe(false);
  });
});
