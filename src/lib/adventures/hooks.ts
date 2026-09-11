import { useMutation, useQuery } from "@tanstack/react-query";
import type { CreateAdventure } from "@/src/lib/schemas/adventure";
import type { AdventureSummary } from "@/src/lib/adventures/serialize";

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path);
  const responseBody = await response.json();

  if (!response.ok) {
    throw new Error(responseBody.error ?? "Something went wrong.");
  }

  return responseBody;
}

async function postJson(path: string, body: unknown) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const responseBody = await response.json();

  if (!response.ok) {
    throw new Error(responseBody.error ?? "Something went wrong.");
  }

  return responseBody;
}

export function useAdventures() {
  return useQuery({
    queryKey: ["adventures"],
    queryFn: () =>
      getJson<{ adventures: AdventureSummary[] }>("/api/adventures"),
  });
}

export function useCreateAdventure() {
  return useMutation({
    mutationFn: (input: CreateAdventure) =>
      postJson("/api/adventures", input),
  });
}
