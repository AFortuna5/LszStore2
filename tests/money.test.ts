import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { moneySum, moneyToCents, moneyToNumber } from "../src/server/money";

describe("money", () => {
  it("converte valores para centavos sem erro de ponto flutuante", () => {
    expect(moneyToCents(299.9)).toBe(29990);
    expect(moneyToCents("24.90")).toBe(2490);
    expect(moneyToNumber("324.80")).toBe(324.8);
  });

  it("soma valores monetarios em centavos", () => {
    expect(moneySum([0.1, 0.2])).toBe(0.3);
    expect(moneySum([299.9, 24.9])).toBe(324.8);
  });
});
