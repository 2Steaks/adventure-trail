import { useMutation } from "@tanstack/react-query";
import type { AuthCredentials } from "@/src/lib/schemas/auth";

async function postAuth(path: string, credentials: AuthCredentials) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error ?? "Something went wrong.");
  }

  return body;
}

export function useRegister() {
  return useMutation({
    mutationFn: (credentials: AuthCredentials) =>
      postAuth("/api/auth/register", credentials),
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: (credentials: AuthCredentials) =>
      postAuth("/api/auth/login", credentials),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        throw new Error("Something went wrong.");
      }
      return response.json();
    },
  });
}
