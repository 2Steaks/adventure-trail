import {
  rankPlaces,
  type OverpassElement,
  type Place,
} from "@/src/lib/places/rank";
import { createOverpassQuery } from "@/src/lib/places/query";

export class NearbyPlacesFetchError extends Error {}

export class OverpassClient {
  constructor(
    private baseUrl: string,
    private userAgent: string,
  ) {}

  async findNearbyPlaces({
    lat,
    lng,
    radiusMeters,
  }: {
    lat: number;
    lng: number;
    radiusMeters: number;
  }): Promise<Place[]> {
    const overpassQuery = createOverpassQuery({
      lat,
      lng,
      radiusMeters,
    });

    let response: Response;

    try {
      response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "User-Agent": this.userAgent,
        },
        body: overpassQuery,
      });
    } catch {
      throw new NearbyPlacesFetchError(
        "Couldn't find nearby landmarks. Try again.",
      );
    }

    if (!response.ok) {
      throw new NearbyPlacesFetchError(
        "Couldn't find nearby landmarks. Try again.",
      );
    }

    let elements: OverpassElement[];

    try {
      ({ elements } = (await response.json()) as {
        elements: OverpassElement[];
      });
    } catch {
      throw new NearbyPlacesFetchError(
        "Couldn't find nearby landmarks. Try again.",
      );
    }

    return rankPlaces({ latitude: lat, longitude: lng }, elements);
  }
}

export const overpassClient = new OverpassClient(
  "https://overpass-api.de/api/interpreter",
  "dungeon-master-ai/0.1 (places module)",
);
