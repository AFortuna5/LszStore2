import { storeContact } from "@/shared/store-contact";
import { formatCurrency } from "@/shared/storefront";

export const WHATSAPP_SHIPPING_ID = "WHATSAPP_UBER";
const WHATSAPP_FALLBACK_NUMBER = "5551996957614";

export type WhatsAppOrderItem = {
  name: string;
  reference?: string;
  variantLabel?: string;
  quantity: number;
  unitPrice: number;
};

export type WhatsAppOrderDetails = {
  customer: {
    fullName: string;
    phone: string;
    email: string;
  };
  address?: {
    zipCode?: string;
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    complement?: string;
  };
  items: WhatsAppOrderItem[];
  coupon?: {
    code: string;
    discountAmount: number;
  } | null;
};

function text(value: string | null | undefined) {
  return value?.trim() ?? "";
}

export function buildWhatsAppOrderMessage(order: WhatsAppOrderDetails) {
  const subtotal = order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const discount = order.coupon?.discountAmount ?? 0;
  const total = Math.max(0, subtotal - discount);
  const address = order.address ?? {};
  const street = [text(address.street), text(address.number)].filter(Boolean).join(", ");
  const addressLines = [
    [street, text(address.complement)].filter(Boolean).join(" - "),
    text(address.neighborhood),
    [text(address.city), text(address.state)].filter(Boolean).join(" - "),
    text(address.zipCode) ? `CEP ${text(address.zipCode)}` : "",
  ].filter(Boolean);

  return [
    "Olá, LSZ Store! Quero continuar meu pedido pelo WhatsApp e combinar a entrega por Uber.",
    "",
    "PEDIDO",
    ...order.items.flatMap((item) => [
      `• ${item.quantity}x ${item.name}${item.variantLabel ? ` (${item.variantLabel})` : ""} — ${formatCurrency(item.unitPrice * item.quantity)}`,
      ...(item.reference ? [`  SKU/referência: ${item.reference}`] : []),
    ]),
    "",
    "RESUMO",
    `Subtotal: ${formatCurrency(subtotal)}`,
    ...(order.coupon ? [`Cupom ${order.coupon.code}: -${formatCurrency(discount)}`] : []),
    "Entrega por Uber: valor a combinar",
    `Total dos produtos: ${formatCurrency(total)}`,
    "",
    "CLIENTE",
    `Nome: ${order.customer.fullName}`,
    `Telefone: ${order.customer.phone}`,
    `E-mail: ${order.customer.email}`,
    "",
    "ENTREGA",
    ...(addressLines.length ? addressLines : ["Endereço: a combinar pelo WhatsApp"]),
    "",
    "Por favor, confirmem a disponibilidade dos produtos, o pagamento e o local e horário de retirada antes de eu chamar o Uber. O valor da corrida será combinado à parte.",
  ].join("\n");
}

export function buildWhatsAppOrderUrl(order: WhatsAppOrderDetails) {
  const number = storeContact.whatsapp.replace(/\D/g, "") || WHATSAPP_FALLBACK_NUMBER;
  return `https://wa.me/${number}?text=${encodeURIComponent(buildWhatsAppOrderMessage(order))}`;
}
