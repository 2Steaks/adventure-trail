import { describe, expect, it } from "vitest";
import { authCredentialsSchema } from "./schema";

describe("authCredentialsSchema", () => {
  it("accepts a valid email and a password of at least 6 characters", () => {
    const result = authCredentialsSchema.safeParse({
      email: "parent@example.com",
      password: "sixchr",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid email format", () => {
    const result = authCredentialsSchema.safeParse({
      email: "not-an-email",
      password: "sixchr",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a password under 6 characters", () => {
    const result = authCredentialsSchema.safeParse({
      email: "parent@example.com",
      password: "abc",
    });

    expect(result.success).toBe(false);
  });
});
