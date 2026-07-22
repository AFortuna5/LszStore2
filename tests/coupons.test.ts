import type { Prisma } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getCouponQuote, normalizeCouponCode } from "../src/server/services/coupons";

function couponDatabase(options?: { expired?: boolean; categoryId?: string | null }) {
  const now = new Date("2026-07-22T15:00:00.000Z");
  return {
    now,
    tx: {
      coupon: {
        findUnique: vi.fn().mockResolvedValue({
          id: "coupon-1",
          code: "VERAO15",
          discountPercent: 15,
          startsAt: new Date("2026-07-01T00:00:00.000Z"),
          endsAt: options?.expired ? new Date("2026-07-20T00:00:00.000Z") : new Date("2026-08-01T00:00:00.000Z"),
          active: true,
          categoryId: options?.categoryId ?? "category-1",
          category: { id: "category-1", name: "Perfumes", slug: "perfumes" },
        }),
      },
      product: {
        findMany: vi.fn().mockResolvedValue([{
          id: "product-1",
          categoryId: "category-1",
          price: 199.9,
          promoPrice: null,
          variants: [],
        }]),
      },
    } as unknown as Prisma.TransactionClient,
  };
}

describe("coupons", () => {
  it("normaliza o codigo e calcula desconto apenas sobre itens elegiveis", async () => {
    const { tx, now } = couponDatabase();
    const quote = await getCouponQuote(tx, " verao15 ", [{ productId: "product-1", quantity: 2 }], now);

    expect(normalizeCouponCode(" verao 15 ")).toBe("VERAO15");
    expect(quote.eligibleSubtotal).toBe(399.8);
    expect(quote.discountAmount).toBe(59.97);
    expect(quote.discountPercent).toBe(15);
  });

  it("recusa cupom expirado", async () => {
    const { tx, now } = couponDatabase({ expired: true });
    await expect(getCouponQuote(tx, "VERAO15", [{ productId: "product-1", quantity: 1 }], now))
      .rejects.toThrow("Este cupom expirou");
  });
});
