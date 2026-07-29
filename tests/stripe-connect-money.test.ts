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

  it("orienta ativacao quando a conta principal ainda nao aderiu ao Connect", async () => {
    const { stripeConnectSetupIssue } = await import("../src/server/services/stores");
    expect(stripeConnectSetupIssue(new Error("You can only create new accounts if you've signed up for Connect"))).toEqual({
      code: "STRIPE_CONNECT_NOT_ENABLED",
      message: "Ative o Stripe Connect na sua conta principal e tente novamente.",
      actionUrl: "https://dashboard.stripe.com/connect",
    });
  });
});
