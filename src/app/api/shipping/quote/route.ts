import { isNonEmptyString, isRecord, jsonError, readJson, toPositiveInt } from "@/server/http/api";
import { getShippingQuotes } from "@/server/services/shipping";

export async function POST(req: Request) {
  try {
    const body = await readJson(req);
    if (!isRecord(body) || !isNonEmptyString(body.zipCode) || !Array.isArray(body.items)) return jsonError("Dados de frete invalidos");
    const items = body.items.map((item) => {
      if (!isRecord(item) || !isNonEmptyString(item.productId)) return null;
      const quantity = toPositiveInt(item.quantity);
      return quantity ? {
        productId: item.productId.trim(),
        variantId: isNonEmptyString(item.variantId) ? item.variantId.trim() : null,
        quantity,
      } : null;
    });
    if (items.some((item) => !item)) return jsonError("Itens invalidos");
    return Response.json({
      quotes: await getShippingQuotes(
        items as { productId: string; variantId?: string | null; quantity: number }[],
        body.zipCode,
      ),
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Erro ao calcular frete", 400);
  }
}
