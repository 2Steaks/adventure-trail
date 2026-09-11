import { describe, expect, it } from "vitest";
import { isPublicPath } from "./public-paths";

describe("isPublicPath", () => {
  it.each([
    ["/login", true],
    ["/login/callback", true],
    ["/register", true],
    ["/auth", true],
    ["/auth/callback", true],
    ["/", false],
    ["/adventures", false],
  ])("isPublicPath(%s) === %s", (pathname, expected) => {
    expect(isPublicPath(pathname)).toBe(expected);
  });
});
