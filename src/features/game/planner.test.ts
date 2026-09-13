import { describe, expect, it } from "vitest";
import { AdventurePlan } from "../adventures/adventure-plan.schema";
import { invalidLocationIds } from "./planner";
import { Place } from "@/src/services/overpass/overpass.types";

const candidates: Place[] = [
  {
    id: "node/1",
    name: "Lion",
    type: "artwork",
    latitude: 51.5078,
    longitude: -0.1281,
    distanceMeters: 20,
  },
  {
    id: "way/2",
    name: "Nelson's Column",
    type: "monument",
    latitude: 51.5077,
    longitude: -0.1279,
    distanceMeters: 29,
  },
];

function planWithLocationIds(...locationIds: string[]): AdventurePlan {
  return {
    title: "Test Plan",
    quests: locationIds.map((locationId) => ({
      locationId,
      objective: "Do a thing.",
      type: "exploration" as const,
    })),
  };
}

describe("invalidLocationIds", () => {
  it("returns an empty array when every locationId matches a candidate", () => {
    const plan = planWithLocationIds("node/1", "way/2");

    expect(invalidLocationIds(plan, candidates)).toEqual([]);
  });

  it("returns the offending id(s) when one doesn't match any candidate", () => {
    const plan = planWithLocationIds("node/1", "node/999");

    expect(invalidLocationIds(plan, candidates)).toEqual(["node/999"]);
  });

  it("returns all locationIds when none match", () => {
    const plan = planWithLocationIds("node/999", "way/888");

    expect(invalidLocationIds(plan, candidates)).toEqual([
      "node/999",
      "way/888",
    ]);
  });
});
