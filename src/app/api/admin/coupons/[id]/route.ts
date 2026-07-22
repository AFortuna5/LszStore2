import { isNonEmptyString, isRecord, jsonError, readJson, toPositiveInt } from "@/server/http/api";
import { readSessionFromRequest } from "@/server/auth/session";
import { prisma } from "@/server/database/client";
import { normalizeCouponCode } from "@/server/services/coupons";

type RouteContext = { params: Promise<{ id: string }> };

function parseDate(value: unknown) {
  if (!isNonEmptyString(value)) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const session = readSessionFromRequest(req);
    if (!session || session.role !== "ADMIN") return jsonError("Nao autorizado", 401);
    const { id } = await context.params;
    const body = await readJson(req);
    if (!isRecord(body) || !isNonEmptyString(body.code)) return jsonError("Dados do cupom invalidos");

    const code = normalizeCouponCode(body.code);
    if (!/^[A-Z0-9_-]{3,40}$/.test(code)) return jsonError("Codigo do cupom invalido");
    const discountPercent = toPositiveInt(body.discountPercent);
    if (!discountPercent || discountPercent > 100) return jsonError("Desconto deve estar entre 1% e 100%");
    const startsAt = parseDate(body.startsAt);
    const endsAt = parseDate(body.endsAt);
    if (!startsAt || !endsAt) return jsonError("Informe as datas de inicio e fim");
    if (endsAt.getTime() <= startsAt.getTime()) return jsonError("A data final deve ser posterior a data inicial");

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        code,
        discountPercent,
        startsAt,
        endsAt,
        active: Boolean(body.active),
        categoryId: isNonEmptyString(body.categoryId) ? body.categoryId.trim() : null,
      },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
    return Response.json(coupon);
  } catch (error) {
    console.error(error);
    if (String(error).includes("P2025")) return jsonError("Cupom nao encontrado", 404);
    if (String(error).includes("P2002") || String(error).includes("Unique constraint")) return jsonError("Este codigo de cupom ja existe", 409);
    if (String(error).includes("P2003") || String(error).includes("Foreign key constraint")) return jsonError("Categoria invalida");
    return jsonError("Nao foi possivel atualizar o cupom", 500);
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  try {
    const session = readSessionFromRequest(req);
    if (!session || session.role !== "ADMIN") return jsonError("Nao autorizado", 401);
    const { id } = await context.params;
    await prisma.coupon.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (error) {
    if (String(error).includes("P2025")) return jsonError("Cupom nao encontrado", 404);
    console.error(error);
    return jsonError("Nao foi possivel excluir o cupom", 500);
  }
}
