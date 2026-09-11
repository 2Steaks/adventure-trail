import { describe, expect, it } from "vitest";
import { createAdventureSchema } from "./adventure";

const validBody = {
  theme: "Pirates",
  ageMin: 6,
  ageMax: 10,
  durationMinutes: 60,
  maxDistanceMeters: 1000,
  startingLat: 51.508,
  startingLng: -0.1281,
};

describe("createAdventureSchema", () => {
  it("accepts a valid body", () => {
    const result = createAdventureSchema.safeParse(validBody);

    expect(result.success).toBe(true);
  });

  it("rejects an empty theme", () => {
    const result = createAdventureSchema.safeParse({
      ...validBody,
      theme: "",
    });

    expect(result.success).toBe(false);
  });

  it("rejects ageMax less than ageMin", () => {
    const result = createAdventureSchema.safeParse({
      ...validBody,
      ageMin: 10,
      ageMax: 6,
    });

    expect(result.success).toBe(false);
  });

  it("rejects a durationMinutes value outside the allowed set", () => {
    const result = createAdventureSchema.safeParse({
      ...validBody,
      durationMinutes: 45,
    });

    expect(result.success).toBe(false);
  });

  it("rejects a maxDistanceMeters value outside the allowed set", () => {
    const result = createAdventureSchema.safeParse({
      ...validBody,
      maxDistanceMeters: 750,
    });

    expect(result.success).toBe(false);
  });

  it("rejects an out-of-range startingLat", () => {
    const result = createAdventureSchema.safeParse({
      ...validBody,
      startingLat: 95,
    });

    expect(result.success).toBe(false);
  });

  it("rejects a missing startingLng", () => {
    const result = createAdventureSchema.safeParse({
      theme: validBody.theme,
      ageMin: validBody.ageMin,
      ageMax: validBody.ageMax,
      durationMinutes: validBody.durationMinutes,
      maxDistanceMeters: validBody.maxDistanceMeters,
      startingLat: validBody.startingLat,
    });

    expect(result.success).toBe(false);
  });
});
