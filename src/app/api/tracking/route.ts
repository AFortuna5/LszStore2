import { isNonEmptyString, isRecord, jsonError, readJson } from "@/server/http/api";
import { prisma } from "@/server/database/client";

export async function POST(req: Request) {
  const body = await readJson(req);
  if (!isRecord(body) || !isNonEmptyString(body.code) || !isNonEmptyString(body.email)) return jsonError("Informe pedido e email");
  const code = body.code.trim();
  const order = await prisma.order.findFirst({
    where: {
      customerEmail: body.email.trim().toLowerCase(),
      OR: [{ id: code }, { trackingCode: code }, ...(code.length <= 8 ? [{ id: { endsWith: code.toLowerCase() } }] : [])],
    },
    select: { id: true, status: true, trackingCode: true, shippingService: true, shippingDeadline: true, createdAt: true, updatedAt: true },
  });
  if (!order) return jsonError("Pedido nao encontrado", 404);
  return Response.json({ order });
}
