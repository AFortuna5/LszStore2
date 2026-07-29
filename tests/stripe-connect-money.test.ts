import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("../src/server/database/client", () => ({ prisma: {} }));

describe("Stripe Connect commission", () => {
  beforeEach(() => { process.env.STRIPE_DEFAULT_COMMISSION_PERCENTAGE = "5"; });

  it("calcula e arredonda a comissao em centavos", async () => {
    const { platformFee } = await import("../src/server/services/stores");
    expect(platformFee(10_01, 5)).toBe(50);
    expect(platformFee(19_99, 7.5)).toBe(150);
  });

  it("bloqueia comissao negativa ou igual ao pedido", async () => {
    const { platformFee } = await import("../src/server/services/stores");
    expect(() => platformFee(1000, -1)).toThrow();
    expect(() => platformFee(1000, 100)).toThrow();
  });
});
