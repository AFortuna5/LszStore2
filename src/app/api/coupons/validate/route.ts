import { isNonEmptyString, isRecord, jsonError, readJson, toPositiveInt } from "@/server/http/api";
import { prisma } from "@/server/database/client";
import { getClientIp, rateLimit } from "@/server/security/rate-limit";
import { CouponValidationError, getCouponQuote } from "@/server/services/coupons";

export async function POST(req: Request) {
  try {
    const limit = await rateLimit(`coupon:${getClientIp(req)}`, 20, 60_000);
    if (!limit.allowed) return jsonError("Muitas tentativas. Aguarde um minuto.", 429);

    const body = await readJson(req);
    if (!isRecord(body) || !isNonEmptyString(body.code) || !Array.isArray(body.items)) {
      return jsonError("Informe o cupom e os itens do carrinho");
    }

    const items = body.items.map((item) => {
      if (!isRecord(item) || !isNonEmptyString(item.productId)) return null;
      const quantity = toPositiveInt(item.quantity);
      if (!quantity) return null;
      return {
        productId: item.productId.trim(),
        variantId: isNonEmptyString(item.variantId) ? item.variantId.trim() : null,
        quantity,
      };
    });
    if (items.length === 0 || items.some((item) => item === null)) return jsonError("Carrinho invalido");

    const quote = await prisma.$transaction((tx) => getCouponQuote(
      tx,
      body.code as string,
      items as Array<{ productId: string; variantId: string | null; quantity: number }>,
    ));

    return Response.json({
      code: quote.code,
      discountPercent: quote.discountPercent,
      category: quote.category,
      eligibleSubtotal: quote.eligibleSubtotal,
      discountAmount: quote.discountAmount,
    });
  } catch (error) {
    if (error instanceof CouponValidationError) return jsonError(error.message);
    console.error(error);
    return jsonError("Nao foi possivel validar o cupom", 500);
  }
}
