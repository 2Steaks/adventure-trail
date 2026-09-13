export async function fetchJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(path, init);
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    throw new Error("Your session has expired. Please log in again.");
  }

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error ?? "Something went wrong.");
  }

  return body as T;
}
