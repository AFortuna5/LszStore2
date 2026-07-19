import { describe, expect, it } from "vitest";

import { getStoreBrand, matchesStoreBrand } from "../src/shared/brands";

describe("brand navigation", () => {
  it("finds configured brands by slug", () => {
    expect(getStoreBrand("armani")?.name).toBe("Armani");
    expect(getStoreBrand("lacoste")?.name).toBe("Lacoste");
    expect(getStoreBrand("tommy-hilfiger")?.name).toBe("Tommy Hilfiger");
  });

  it("matches common catalog variations", () => {
    const armani = getStoreBrand("armani");
    const tommy = getStoreBrand("tommy-hilfiger");
    expect(armani && matchesStoreBrand("Emporio Armani", armani)).toBe(true);
    expect(tommy && matchesStoreBrand("Tommy Jeans", tommy)).toBe(true);
  });
});
