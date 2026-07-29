import { readSessionFromRequest } from "@/server/auth/session";
import { prisma } from "@/server/database/client";
import { jsonError } from "@/server/http/api";

export async function GET(req: Request) {
  const session = readSessionFromRequest(req);
  if (!session) return jsonError("Nao autorizado", 401);
  const sessionId = new URL(req.url).searchParams.get("session_id");
  if (!sessionId || !/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return jsonError("Sessao invalida");
  const order = await prisma.order.findFirst({ where: { stripeCheckoutSessionId: sessionId, ...(session.role === "ADMIN" ? {} : { userId: session.id }) }, select: { id: true, status: true, paymentStatus: true } });
  if (!order) return jsonError("Pedido nao encontrado", 404);
  return Response.json(order);
}
