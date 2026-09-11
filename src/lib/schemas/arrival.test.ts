import { describe, expect, it } from "vitest";
import { arrivalCheckSchema } from "./arrival";

describe("arrivalCheckSchema", () => {
  it("accepts valid latitude/longitude", () => {
    const result = arrivalCheckSchema.safeParse({
      latitude: 51.508,
      longitude: -0.1281,
    });

    expect(result.success).toBe(true);
  });

  it("rejects an out-of-range latitude", () => {
    const result = arrivalCheckSchema.safeParse({
      latitude: 95,
      longitude: -0.1281,
    });

    expect(result.success).toBe(false);
  });

  it("rejects a missing latitude/longitude", () => {
    const result = arrivalCheckSchema.safeParse({});

    expect(result.success).toBe(false);
  });
});
