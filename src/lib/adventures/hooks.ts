import { useMutation } from "@tanstack/react-query";
import type { CreateAdventure } from "@/src/lib/schemas/adventure";

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

export function useCreateAdventure() {
  return useMutation({
    mutationFn: (input: CreateAdventure) =>
      postJson("/api/adventures", input),
  });
}
