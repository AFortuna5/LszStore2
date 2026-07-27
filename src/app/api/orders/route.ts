import { NextResponse } from "next/server";

import {
  isNonEmptyString,
  isRecord,
  jsonError,
  readJson,
  toPositiveInt,
} from "@/server/http/api";
import { readSessionFromRequest } from "@/server/auth/session";
import { createOrderFromCart, orderInclude, serializeOrder } from "@/server/services/orders";
import { prisma } from "@/server/database/client";
import { getShippingQuotes } from "@/server/services/shipping";
import { createPaymentSession, getStripeReadiness } from "@/server/services/payment";
import { escapeHtml, sendEmail } from "@/server/services/email";
import { CouponValidationError } from "@/server/services/coupons";

async function existingCheckoutResponse(checkoutKey: string, userId: string) {
  const order = await prisma.order.findUnique({
    where: { checkoutKey },
    include: orderInclude,
  });
  if (!order) return null;
  if (order.userId !== userId) {
    return jsonError("Identificador do checkout invalido", 409);
  }

  let paymentUrl = order.paymentUrl ?? undefined;
  if (!paymentUrl && order.status === "PENDING") {
    paymentUrl = (await createPaymentSession(order.id)).url;
  }
  return NextResponse.json({ order: serializeOrder(order), paymentUrl });
}

export async function GET(req: Request) {
  try {
    const session = readSessionFromRequest(req);
    if (!session) {
      return jsonError("Nao autorizado", 401);
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId")?.trim();
    const status = searchParams.get("status")?.trim();
    const limit = Math.min(
      toPositiveInt(searchParams.get("limit"), 25) ?? 25,
      100
    );
    const page = toPositiveInt(searchParams.get("page"), 1) ?? 1;

    const orders = await prisma.order.findMany({
      where: {
        ...(session.role === "ADMIN" ? {} : { userId: session.id }),
        ...(userId ? { userId } : {}),
        ...(status ? { status } : {}),
      },
      include: orderInclude,
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json(orders.map(serializeOrder));
  } catch (error) {
    console.error(error);
    return jsonError("Erro ao buscar os pedidos", 500);
  }
}

export async function POST(req: Request) {
  try {
    const body = await readJson(req);

    if (!isRecord(body)) {
      return jsonError("JSON invalido");
    }

    const session = readSessionFromRequest(req);
    if (!session) {
      return jsonError("Nao autorizado", 401);
    }

    const { userId, items, address, paymentMethod, shippingServiceId, couponCode } = body;

    if (!isNonEmptyString(userId) || userId.trim() !== session.id) {
      return jsonError("Usuario invalido", 401);
    }

    if (!Array.isArray(items)) {
      return jsonError("Itens do pedido sao obrigatorios");
    }

    if (!isRecord(address)) {
      return jsonError("Endereco e obrigatorio");
    }

    if (!isNonEmptyString(paymentMethod)) {
      return jsonError("Forma de pagamento obrigatoria");
    }
    if (paymentMethod.trim().toUpperCase() !== "STRIPE") {
      return jsonError("Forma de pagamento invalida");
    }
    if (!getStripeReadiness().ready) {
      return jsonError("Pagamento temporariamente indisponivel", 503);
    }

    const checkoutKey = req.headers.get("idempotency-key")?.trim();
    if (!checkoutKey || !/^[A-Za-z0-9_-]{16,128}$/.test(checkoutKey)) {
      return jsonError("Identificador do checkout invalido");
    }

    const existingResponse = await existingCheckoutResponse(checkoutKey, session.id);
    if (existingResponse) return existingResponse;

    const requiredAddressFields = ["fullName", "phone", "email", "zipCode", "street", "number", "neighborhood", "city", "state"];
    if (requiredAddressFields.some((field) => !isNonEmptyString(address[field]))) {
      return jsonError("Preencha todos os dados obrigatorios do endereco");
    }

    const parsedItems = items.map((item) => {
      if (!isRecord(item) || !isNonEmptyString(item.productId)) return null;
      const quantity = toPositiveInt(item.quantity);
      if (!quantity) return null;
      return {
        productId: item.productId.trim(),
        variantId: isNonEmptyString(item.variantId) ? item.variantId.trim() : null,
        quantity,
      };
    });

    if (parsedItems.some((item) => item === null)) {
      return jsonError("Itens do pedido invalidos");
    }

    const validItems = parsedItems as { productId: string; variantId?: string | null; quantity: number }[];
    const quotes = await getShippingQuotes(validItems, String(address.zipCode));
    const selectedQuote = quotes.find((quote) => quote.id === String(shippingServiceId ?? "")) ?? quotes[0];

    let order;
    try {
      order = await createOrderFromCart(userId.trim(), validItems, {
        address: {
          fullName: String(address.fullName ?? "").trim(),
          phone: String(address.phone ?? "").trim(),
          email: String(address.email ?? "").trim(),
          zipCode: String(address.zipCode ?? "").trim(),
          street: String(address.street ?? "").trim(),
          number: String(address.number ?? "").trim(),
          neighborhood: String(address.neighborhood ?? "").trim(),
          city: String(address.city ?? "").trim(),
          state: String(address.state ?? "").trim(),
          complement: isNonEmptyString(address.complement)
            ? address.complement.trim()
            : null,
        },
        paymentMethod: paymentMethod.trim().toUpperCase(),
        shippingCost: selectedQuote.price,
        shippingService: `${selectedQuote.company} - ${selectedQuote.name}`,
        shippingServiceId: selectedQuote.id,
        shippingDeadline: selectedQuote.deliveryDays,
        checkoutKey,
        couponCode: isNonEmptyString(couponCode) ? couponCode.trim() : null,
      });
    } catch (error) {
      // Duas requisicoes simultaneas podem passar pela primeira consulta. A
      // restricao unica do banco escolhe uma delas, e a outra reutiliza o pedido.
      if (String(error).includes("P2002")) {
        const concurrentResponse = await existingCheckoutResponse(checkoutKey, session.id);
        if (concurrentResponse) return concurrentResponse;
      }
      throw error;
    }
    let paymentUrl: string | undefined;
    try {
      const payment = await createPaymentSession(order.id);
      paymentUrl = payment.url;
    } catch (paymentError) {
      console.error(paymentError);
      await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "ERROR" } });
      return jsonError(
        "Pedido criado, mas nao foi possivel abrir o pagamento. Tente novamente.",
        502,
      );
    }
    void sendEmail({
      to: order.customerEmail,
      subject: `Recebemos seu pedido #${order.id.slice(-8).toUpperCase()}`,
      idempotencyKey: `order-created-${order.id}`,
      html: `<h1>Pedido recebido</h1><p>Ola, ${escapeHtml(order.customerName)}.</p><p>Seu pedido foi registrado no valor de <strong>R$ ${Number(order.total).toFixed(2)}</strong>.</p>`,
    }).catch(console.error);

    return NextResponse.json({ order: serializeOrder(order), paymentUrl }, { status: 201 });
  } catch (error) {
    if (error instanceof CouponValidationError) return jsonError(error.message);
    console.error(error);
    return jsonError("Erro ao criar o pedido", 500);
  }
}
