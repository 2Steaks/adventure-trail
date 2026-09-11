import { useMutation } from "@tanstack/react-query";
import { fetchJson } from "@/src/lib/http/fetch-json";
import { getCurrentPosition } from "@/src/lib/geo/geolocation";
import type { Place } from "@/src/lib/places/rank";

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
