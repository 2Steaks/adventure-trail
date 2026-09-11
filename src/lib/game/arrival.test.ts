import { describe, expect, it } from "vitest";
import { checkArrival } from "./arrival";

const questLocation = { latitude: 51.508, longitude: -0.1281 };

describe("checkArrival", () => {
  it("returns arrived: true when within the quest's radius", () => {
    // Same longitude, ~111m of latitude away (0.001 degrees).
    const nearby = { latitude: 51.509, longitude: -0.1281 };

    const result = checkArrival(nearby, { ...questLocation, radiusMeters: 200 });

    expect(result.arrived).toBe(true);
    expect(result.distanceMeters).toBeGreaterThan(0);
  });

  it("returns arrived: false when outside the quest's radius", () => {
    const farAway = { latitude: 51.6, longitude: -0.1281 };

    const result = checkArrival(farAway, { ...questLocation, radiusMeters: 200 });

    expect(result.arrived).toBe(false);
  });

  it("counts the exact boundary (distance === radiusMeters) as arrived", () => {
    const result = checkArrival(questLocation, {
      ...questLocation,
      radiusMeters: 0,
    });

    expect(result.distanceMeters).toBeCloseTo(0, 3);
    expect(result.arrived).toBe(true);
  });
});
