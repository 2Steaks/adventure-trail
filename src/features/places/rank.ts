import { OverpassElement, Place } from "@/src/services/overpass/overpass.types";
import { haversine, type LatLng } from "@/src/utils/geo/haversine";

const MAX_CANDIDATES = 10;

// Anything closer than this is essentially where the player is already
// standing. Picking it as a quest destination would let the player
// "arrive" without walking anywhere, so it's filtered out before ranking.
const MIN_DISTANCE_METERS = 50;

export function rankPlaces(
  origin: LatLng,
  elements: OverpassElement[],
): Place[] {
  return elements
    .filter((element) => Boolean(element.tags?.name))
    .map((element) => {
      const point = element.center ?? { lat: element.lat, lon: element.lon };
      const latitude = point.lat as number;
      const longitude = point.lon as number;

      return {
        id: `${element.type}/${element.id}`,
        name: element.tags!.name,
        type: element.tags!.tourism ?? element.tags!.historic ?? "landmark",
        latitude,
        longitude,
        distanceMeters: haversine(origin, { latitude, longitude }),
      };
    })
    .filter((place) => place.distanceMeters >= MIN_DISTANCE_METERS)
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, MAX_CANDIDATES);
}
