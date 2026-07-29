import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(), update: vi.fn(), eventCreate: vi.fn(), eventUpdate: vi.fn(),
  checkoutCreate: vi.fn(), checkoutRetrieve: vi.fn(), couponCreate: vi.fn(),
}));

vi.mock("../src/server/config/env", () => ({ env: {
  paymentProvider: "stripe", stripeSecretKey: ["sk", "test", "example"].join("_"), stripeWebhookSecret: ["whsec", "example"].join("_"),
  stripeLiveMode: false, stripeDefaultCommissionPercentage: 5, appUrl: "http://localhost:3000",
} }));
vi.mock("../src/server/database/client", () => ({ prisma: {
  order: { findUnique: mocks.findUnique, update: mocks.update },
  stripeWebhookEvent: { create: mocks.eventCreate, update: mocks.eventUpdate },
} }));
vi.mock("../src/server/services/inventory", () => ({ changeInventory: vi.fn() }));
vi.mock("../src/server/services/stores", () => ({ commissionPercentage: () => 5, platformFee: () => 500, syncStoreStripeAccount: vi.fn() }));
vi.mock("../src/server/stripe/client", () => ({
  stripeRequestOptions: (account?: string | null, idempotencyKey?: string) => ({
    ...(account ? { stripeAccount: account } : {}),
    ...(idempotencyKey ? { idempotencyKey } : {}),
  }),
  stripeClient: () => ({ checkout: { sessions: { create: mocks.checkoutCreate, retrieve: mocks.checkoutRetrieve } }, coupons: { create: mocks.couponCreate }, webhooks: { constructEvent: vi.fn() } }),
}));

describe("Stripe Connect payment", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("cria Checkout Session como direct charge na conta da loja", async () => {
    mocks.findUnique.mockResolvedValue({
      id: "order_1", userId: "user_1", storeId: "store_1", status: "PENDING", paymentStatus: "PENDING",
      total: "100.00", discountAmount: "0", shippingCost: "0", customerEmail: "cliente@example.com",
      stripeCheckoutSessionId: null, items: [{ quantity: 1, price: "100.00", productName: "Camiseta", variantLabel: null }],
      store: { stripeAccountId: "acct_store", stripeChargesEnabled: true, stripeAccountStatus: "ACTIVE", commissionPercentage: null },
    });
    mocks.checkoutCreate.mockResolvedValue({ id: "cs_test_1", url: "https://checkout.stripe.test", payment_intent: null });
    mocks.update.mockResolvedValue({});
    const { createPaymentSession } = await import("../src/server/services/payment");
    await createPaymentSession("order_1");
    expect(mocks.checkoutCreate).toHaveBeenCalledWith(expect.objectContaining({
      payment_intent_data: expect.objectContaining({ application_fee_amount: 500 }),
      metadata: { orderId: "order_1", storeId: "store_1" },
    }), { stripeAccount: "acct_store", idempotencyKey: "checkout_order_1" });
    expect(mocks.checkoutCreate.mock.calls[0][0]).not.toHaveProperty("payment_method_types");
  });

  it("mantem checkout da plataforma enquanto a loja nao conclui o Connect", async () => {
    mocks.findUnique.mockResolvedValue({
      id: "order_2", userId: "user_1", storeId: "store_1", status: "PENDING", paymentStatus: "PENDING",
      total: "100.00", discountAmount: "0", shippingCost: "0", customerEmail: "cliente@example.com",
      stripeCheckoutSessionId: null, items: [{ quantity: 1, price: "100.00", productName: "Camiseta", variantLabel: null }],
      store: { stripeAccountId: null, stripeChargesEnabled: false, stripeAccountStatus: "NOT_CONNECTED", commissionPercentage: null },
    });
    mocks.checkoutCreate.mockResolvedValue({ id: "cs_test_2", url: "https://checkout.stripe.test", payment_intent: null });
    mocks.update.mockResolvedValue({});
    const { createPaymentSession } = await import("../src/server/services/payment");
    await createPaymentSession("order_2");
    expect(mocks.checkoutCreate).toHaveBeenCalledWith(expect.objectContaining({
      payment_intent_data: {
        metadata: { orderId: "order_2", storeId: "store_1" },
      },
      metadata: { orderId: "order_2", storeId: "store_1" },
    }), { idempotencyKey: "checkout_order_2" });
    expect(mocks.checkoutCreate.mock.calls[0][0]).not.toHaveProperty("payment_method_types");
    expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ stripeConnectedAccountId: null, platformFeeAmount: 0 }),
    }));
  });

  it("registra evento desconhecido uma unica vez sem efeitos financeiros", async () => {
    mocks.eventCreate.mockResolvedValue({}); mocks.eventUpdate.mockResolvedValue({});
    const { processStripeEvent } = await import("../src/server/services/payment");
    await processStripeEvent({ id: "evt_1", type: "customer.created", account: "acct_store", data: { object: {} } } as never);
    expect(mocks.eventCreate).toHaveBeenCalledTimes(1);
    expect(mocks.eventUpdate).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: "PROCESSED" }) }));
  });
});
