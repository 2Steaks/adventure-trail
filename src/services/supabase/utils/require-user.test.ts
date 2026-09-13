import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { requireUser } from "./require-user";

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    getAll: () => [],
    set: () => {},
  })),
}));

const getUserMock = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: getUserMock },
  })),
}));

describe("requireUser", () => {
  const originalUrl = process.env.SUPABASE_URL;
  const originalKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  beforeEach(() => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_PUBLISHABLE_KEY = "test-key";
  });

  afterEach(() => {
    process.env.SUPABASE_URL = originalUrl;
    process.env.SUPABASE_PUBLISHABLE_KEY = originalKey;
    getUserMock.mockReset();
  });

  it("returns a null user when there is no session", async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: null });

    const result = await requireUser();

    expect(result.user).toBeNull();
  });

  it("returns the user when there is a session", async () => {
    const fakeUser = { id: "user-1", email: "parent@example.com" };
    getUserMock.mockResolvedValue({ data: { user: fakeUser }, error: null });

    const result = await requireUser();

    expect(result.user).toEqual(fakeUser);
  });
});
