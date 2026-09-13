import { OverpassElement, Place } from "@/src/services/overpass/overpass.types";
import { haversine, type LatLng } from "@/src/utils/geo/haversine";

const MAX_CANDIDATES = 10;

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
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, MAX_CANDIDATES);
}
