import { useMutation, useQuery } from "@tanstack/react-query";
import type { CreateAdventure } from "@/src/lib/schemas/adventure";
import type {
  AdventureSummary,
  SerializedAdventure,
  SerializedGameState,
  SerializedQuest,
} from "@/src/lib/adventures/serialize";
import { fetchJson } from "@/src/lib/http/fetch-json";

export function useAdventures() {
  return useQuery({
    queryKey: ["adventures"],
    queryFn: () =>
      fetchJson<{ adventures: AdventureSummary[] }>("/api/adventures"),
  });
}

export function useAdventure(id: string) {
  return useQuery({
    queryKey: ["adventures", id],
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
