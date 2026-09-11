import { describe, expect, it } from "vitest";
import { choiceSchema } from "./choice";

describe("choiceSchema", () => {
  it("accepts a non-empty label", () => {
    const result = choiceSchema.safeParse({ label: "Look closer" });

    expect(result.success).toBe(true);
  });

  it("rejects an empty label", () => {
    const result = choiceSchema.safeParse({ label: "" });

    expect(result.success).toBe(false);
  });

  it("rejects a missing label", () => {
    const result = choiceSchema.safeParse({});

    expect(result.success).toBe(false);
  });
});
