import { describe, expect, it } from "vitest";
import { nearbyPlacesQuerySchema } from "./places.schema";

describe("nearbyPlacesQuerySchema", () => {
  it("accepts valid lat/lng", () => {
    const result = nearbyPlacesQuerySchema.safeParse({
      lat: "51.508",
      lng: "-0.1281",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an out-of-range lat", () => {
    const result = nearbyPlacesQuerySchema.safeParse({
      lat: "95",
      lng: "-0.1281",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a missing lat/lng", () => {
    const result = nearbyPlacesQuerySchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it("rejects a null lat/lng (URLSearchParams.get()'s actual return for a missing param), not silently coercing to 0,0", () => {
    const result = nearbyPlacesQuerySchema.safeParse({
      lat: null,
      lng: null,
      radiusMeters: undefined,
    });

    expect(result.success).toBe(false);
  });

  it("rejects an empty or whitespace-only lat/lng, not silently coercing to 0,0", () => {
    const result = nearbyPlacesQuerySchema.safeParse({
      lat: "",
      lng: "  ",
    });

    expect(result.success).toBe(false);
  });

  it("defaults radiusMeters to 1000 when omitted", () => {
    const result = nearbyPlacesQuerySchema.safeParse({
      lat: "51.508",
      lng: "-0.1281",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.radiusMeters).toBe(1000);
    }
  });
});
