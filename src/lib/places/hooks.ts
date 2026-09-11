import { useMutation } from "@tanstack/react-query";
import { fetchJson } from "@/src/lib/http/fetch-json";
import type { Place } from "@/src/lib/places/rank";

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

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
