import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("proxy.ts location", () => {
  it("lives at src/proxy.ts, alongside the app directory — not the repo root", () => {
    expect(existsSync(resolve(process.cwd(), "src/proxy.ts"))).toBe(true);
    expect(existsSync(resolve(process.cwd(), "proxy.ts"))).toBe(false);
  });
});
