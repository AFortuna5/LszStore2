import { readSessionFromRequest } from "@/server/auth/session";
import { jsonError } from "@/server/http/api";
import { refundOrder } from "@/server/services/payment";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = readSessionFromRequest(req);
  if (!session || session.role !== "ADMIN") return jsonError("Nao autorizado", 403);
  try {
    const { id } = await params;
    const refund = await refundOrder(id, false);
    return Response.json({ refundId: refund.id, status: refund.status, applicationFeeRefunded: false });
  } catch (error) {
    console.error("Falha no reembolso Stripe", error instanceof Error ? error.message : "erro");
    return jsonError("Nao foi possivel solicitar o reembolso", 409);
  }
}
