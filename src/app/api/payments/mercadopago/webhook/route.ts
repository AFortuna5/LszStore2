import { syncMercadoPagoPayment } from "@/server/services/payment";
import { WebhookSignatureValidator, InvalidWebhookSignatureError } from "mercadopago";
import { env } from "@/server/config/env";

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const body = await req.json().catch(() => ({})) as { data?: { id?: string | number } };
    const paymentId = String(body.data?.id ?? url.searchParams.get("data.id") ?? "");
    if (!paymentId) return Response.json({ error: "Pagamento nao informado" }, { status: 400 });
    if (!env.mercadoPagoWebhookSecret) return Response.json({ error: "Webhook nao configurado" }, { status: 503 });
    WebhookSignatureValidator.validate({
      xSignature: req.headers.get("x-signature"),
      xRequestId: req.headers.get("x-request-id"),
      dataId: paymentId,
      secret: env.mercadoPagoWebhookSecret,
      toleranceSeconds: 300,
    });
    await syncMercadoPagoPayment(paymentId);
    return Response.json({ received: true });
  } catch (error) {
    if (error instanceof InvalidWebhookSignatureError) return Response.json({ error: "Assinatura invalida" }, { status: 401 });
    console.error(error);
    return Response.json({ error: "Falha ao processar notificacao" }, { status: 500 });
  }
}
