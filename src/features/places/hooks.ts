import { useMutation } from "@tanstack/react-query";
import { fetchJson } from "@/src/utils/http/fetch-json";
import { getCurrentPosition } from "@/src/utils/geo/geolocation";
import { Place } from "@/src/services/overpass/overpass.types";

export function useNearbyPlaces() {
  return useMutation({
    mutationFn: async () => {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;

      return fetchJson<{ places: Place[] }>(
        `/api/places/nearby?lat=${latitude}&lng=${longitude}`,
      );
    },
  });
}
