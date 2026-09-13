import { OverpassElement } from "@/src/services/overpass/overpass.types";
import { describe, expect, it } from "vitest";
import { rankPlaces } from "./rank";

const origin = { latitude: 51.5, longitude: -0.12 };

function namedNode(index: number): OverpassElement {
  return {
    type: "node",
    id: index,
    lat: origin.latitude + index * 0.001,
    lon: origin.longitude,
    tags: { name: `Landmark ${index}`, tourism: "attraction" },
  };
}

describe("rankPlaces", () => {
  it("drops elements with no tags.name", () => {
    const unnamed: OverpassElement = {
      type: "node",
      id: 999,
      lat: origin.latitude + 0.0001,
      lon: origin.longitude,
      tags: {},
    };

    const result = rankPlaces(origin, [namedNode(1), unnamed]);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Landmark 1");
  });

  it("sorts results nearest-first", () => {
    const result = rankPlaces(origin, [
      namedNode(3),
      namedNode(1),
      namedNode(2),
    ]);

    expect(result.map((place) => place.name)).toEqual([
      "Landmark 1",
      "Landmark 2",
      "Landmark 3",
    ]);
    for (let i = 1; i < result.length; i++) {
      expect(result[i].distanceMeters).toBeGreaterThanOrEqual(
        result[i - 1].distanceMeters,
      );
    }
  });

  it("caps the result at 10 from a larger fixture", () => {
    const elements = Array.from({ length: 15 }, (_, i) => namedNode(i + 1));

    const result = rankPlaces(origin, elements);

    expect(result).toHaveLength(10);
  });

  it("handles a way element via its center point", () => {
    const way: OverpassElement = {
      type: "way",
      id: 42,
      center: { lat: origin.latitude + 0.0025, lon: origin.longitude },
      tags: { name: "Way Landmark", historic: "monument" },
    };

    const result = rankPlaces(origin, [way]);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "way/42",
      name: "Way Landmark",
      type: "monument",
      latitude: origin.latitude + 0.0025,
      longitude: origin.longitude,
    });
    expect(result[0].distanceMeters).toBeGreaterThan(0);
  });
});
