import { rankPlaces, type OverpassElement, type Place } from "@/src/lib/places/rank";
import { createOverpassQuery } from "@/src/lib/places/query";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

export class NearbyPlacesFetchError extends Error {}

export async function fetchNearbyPlaces({
  lat,
  lng,
  radiusMeters,
}: {
  lat: number;
  lng: number;
  radiusMeters: number;
}): Promise<Place[]> {
  const overpassQuery = createOverpassQuery({ lat, lng, radiusMeters });

  let response: Response;
  try {
    response = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: {
        // Overpass's server rejects requests with no User-Agent (406),
        // and fetch() sends none by default (unlike curl).
        "User-Agent": "dungeon-master-ai/0.1 (places module)",
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
