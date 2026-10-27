import { storeContact } from "@/shared/store-contact";

export const WHATSAPP_SHIPPING_ID = "WHATSAPP_UBER";
export const WHATSAPP_SHIPPING_LABEL = "WhatsApp - retirada por Uber";
const WHATSAPP_FALLBACK_NUMBER = "5551996957614";

export type WhatsAppPickupItem = {
  name: string;
  variantLabel?: string | null;
  quantity: number;
};

export type WhatsAppPickupOrder = {
  code: string;
  customerName: string;
  items: WhatsAppPickupItem[];
};

export function buildWhatsAppPickupMessage(order: WhatsAppPickupOrder) {
  return [
    `Olá, LSZ Store! Meu pedido #${order.code} foi pago no site e quero combinar a retirada por Uber.`,
    "",
    `PEDIDO #${order.code}`,
    ...order.items.map(
      (item) => `• ${item.quantity}x ${item.name}${item.variantLabel ? ` (${item.variantLabel})` : ""}`,
    ),
    "",
    `Nome: ${order.customerName}`,
    "",
    "Podem confirmar o local e o horário de retirada? O valor da corrida do Uber fica por minha conta.",
  ].join("\n");
}

export function buildWhatsAppPickupUrl(order: WhatsAppPickupOrder) {
  const number = storeContact.whatsapp.replace(/\D/g, "") || WHATSAPP_FALLBACK_NUMBER;
  return `https://wa.me/${number}?text=${encodeURIComponent(buildWhatsAppPickupMessage(order))}`;
}
