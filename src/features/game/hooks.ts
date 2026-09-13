import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentPosition } from "@/src/utils/geo/geolocation";
import { fetchJson } from "@/src/utils/http/fetch-json";
import type { EncounterOutput } from "./encounter.schema";
import { ArrivalResult } from "./arrival";

export function useEncounter(adventureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      fetchJson<EncounterOutput>(`/api/adventures/${adventureId}/encounter`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adventures", adventureId] });
    },
  });
}

export function useSendChoice(adventureId: string) {
  return useMutation({
    mutationFn: (label: string) =>
      fetchJson<{ success: true }>(`/api/adventures/${adventureId}/choice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      }),
  });
}

export function useCheckArrival(adventureId: string) {
  const queryClient = useQueryClient();

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
    onSuccess: (data) => {
      if (data.arrived) {
        queryClient.invalidateQueries({ queryKey: ["adventures"] });
      }
    },
  });
}
