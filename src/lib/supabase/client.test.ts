import { afterEach, describe, expect, it, vi } from "vitest";
import { createClient } from "./client";

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    getAll: () => [],
    set: () => {},
  })),
}));

describe("createClient", () => {
  const originalUrl = process.env.SUPABASE_URL;
  const originalKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  afterEach(() => {
    process.env.SUPABASE_URL = originalUrl;
    process.env.SUPABASE_PUBLISHABLE_KEY = originalKey;
  });

  it("throws a clear error when SUPABASE_URL is missing", async () => {
    delete process.env.SUPABASE_URL;
    process.env.SUPABASE_PUBLISHABLE_KEY = "test-key";

    await expect(createClient()).rejects.toThrow("Supabase API keys missing.");
  });

  it("throws a clear error when SUPABASE_PUBLISHABLE_KEY is missing", async () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    delete process.env.SUPABASE_PUBLISHABLE_KEY;

    await expect(createClient()).rejects.toThrow("Supabase API keys missing.");
  });

  it("constructs successfully given both env vars", async () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_PUBLISHABLE_KEY = "test-key";

    await expect(createClient()).resolves.toBeDefined();
  });
});
