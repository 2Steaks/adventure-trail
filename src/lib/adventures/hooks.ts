import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateAdventure,
  DeleteAdventure,
} from "@/src/lib/schemas/adventure";
import type {
  AdventureSummary,
  SerializedAdventure,
  SerializedGameState,
  SerializedQuest,
} from "@/src/lib/adventures/serialize";
import { fetchJson } from "@/src/lib/http/fetch-json";

const AdventureQueryKey = ["adventures"] as const;
const createAdventureByIdQueryKey = (id: string) => [...AdventureQueryKey, id];

export function useAdventures() {
  return useQuery({
    queryKey: AdventureQueryKey,
    queryFn: () =>
      fetchJson<{ adventures: AdventureSummary[] }>("/api/adventures"),
  });
}

export function useAdventure(id: string) {
  return useQuery({
    queryKey: createAdventureByIdQueryKey(id),
    queryFn: () =>
      fetchJson<{
        adventure: SerializedAdventure;
        quests: SerializedQuest[];
        gameState: SerializedGameState;
      }>(`/api/adventures/${id}`),
  });
}

export function useCreateAdventure() {
  return useMutation({
    mutationFn: (input: CreateAdventure) =>
      fetchJson<{ success: true; adventure: SerializedAdventure }>(
        "/api/adventures",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        },
      ),
  });
}

export function useDeleteAdventure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DeleteAdventure) =>
      fetchJson<{ success: true; adventure: SerializedAdventure }>(
        "/api/adventures",
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AdventureQueryKey });
    },
  });
}
