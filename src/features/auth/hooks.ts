import { useMutation } from "@tanstack/react-query";

import { fetchJson } from "@/src/utils/http/fetch-json";
import { AuthCredentials } from "./schema";

function postAuth(path: string, credentials?: AuthCredentials) {
  return fetchJson(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: credentials ? JSON.stringify(credentials) : undefined,
  });
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
    mutationFn: () => postAuth("/api/auth/logout"),
  });
}
