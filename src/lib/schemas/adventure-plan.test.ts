import { describe, expect, it } from "vitest";
import { adventurePlanSchema } from "./adventure-plan";

const validPlan = {
  title: "The Lost Hat of Trafalgar Square",
  quests: [
    {
      locationId: "node/346364721",
      objective: "Find the wizard's lost hat.",
      type: "exploration",
    },
  ],
};

describe("adventurePlanSchema", () => {
  it("accepts a valid plan", () => {
    const result = adventurePlanSchema.safeParse(validPlan);

    expect(result.success).toBe(true);
  });

  it("rejects an empty quests array", () => {
    const result = adventurePlanSchema.safeParse({
      ...validPlan,
      quests: [],
    });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid quest type", () => {
    const result = adventurePlanSchema.safeParse({
      ...validPlan,
      quests: [{ ...validPlan.quests[0], type: "combat" }],
    });

    expect(result.success).toBe(false);
  });
});
