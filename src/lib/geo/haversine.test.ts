import { describe, expect, it } from "vitest";
import { haversine } from "./haversine";

describe("haversine", () => {
  it("returns ~0 for identical points", () => {
    const point = { latitude: 51.508, longitude: -0.1281 };

    expect(haversine(point, point)).toBeCloseTo(0, 3);
  });

  it("returns the correct distance between two points ~1km apart", () => {
    // Same longitude, 0.009 degrees of latitude apart (~1001.88m via the
    // standard 111,320m-per-degree approximation).
    const a = { latitude: 51.5, longitude: -0.12 };
    const b = { latitude: 51.509, longitude: -0.12 };

    const distance = haversine(a, b);

    expect(distance).toBeGreaterThan(950);
    expect(distance).toBeLessThan(1050);
  });
});
