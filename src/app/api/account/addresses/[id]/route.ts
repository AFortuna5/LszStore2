import { isNonEmptyString, isRecord, jsonError, readJson } from "@/server/http/api";
import { readSessionFromRequest } from "@/server/auth/session";
import { prisma } from "@/server/database/client";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const session = readSessionFromRequest(req);
    if (!session) return jsonError("Nao autenticado", 401);
    const { id } = await context.params;
    const existing = await prisma.address.findFirst({ where: { id, userId: session.id } });
    if (!existing) return jsonError("Endereco nao encontrado", 404);
    const body = await readJson(req);
    if (!isRecord(body)) return jsonError("JSON invalido");

    const fields = ["fullName", "phone", "email", "zipCode", "street", "number", "neighborhood", "city", "state"] as const;
    const data: Record<string, string | null> = {};
    for (const field of fields) {
      if (field in body) {
        if (!isNonEmptyString(body[field])) return jsonError(`Campo ${field} invalido`);
        data[field] = body[field].trim();
      }
    }
    if ("complement" in body) {
      data.complement = isNonEmptyString(body.complement) ? body.complement.trim() : null;
    }
    if (data.email) data.email = data.email.toLowerCase();
    if (data.state) data.state = data.state.toUpperCase();

    const address = await prisma.address.update({ where: { id }, data });
    return Response.json(address);
  } catch (error) {
    console.error(error);
    return jsonError("Erro ao atualizar o endereco", 500);
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  try {
    const session = readSessionFromRequest(req);
    if (!session) return jsonError("Nao autenticado", 401);
    const { id } = await context.params;
    const existing = await prisma.address.findFirst({ where: { id, userId: session.id } });
    if (!existing) return jsonError("Endereco nao encontrado", 404);
    await prisma.address.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return jsonError("Erro ao excluir o endereco", 500);
  }
}
