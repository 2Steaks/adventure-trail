import { useMutation } from "@tanstack/react-query";
import { getCurrentPosition } from "@/src/lib/geo/geolocation";
import { fetchJson } from "@/src/lib/http/fetch-json";
import type { ArrivalResult } from "@/src/lib/game/arrival";

export function useCheckArrival(adventureId: string) {
  return useMutation({
    mutationFn: async () => {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;

      return fetchJson<ArrivalResult>(
        `/api/adventures/${adventureId}/arrival`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latitude, longitude }),
        },
      );
    },
  });
}
