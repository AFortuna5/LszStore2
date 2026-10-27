import { MessageCircle } from "lucide-react";

import { storeContact } from "@/shared/store-contact";
import { formatCurrency } from "@/shared/storefront";

type DeliveryItem = {
  name: string;
  variantLabel?: string;
  quantity: number;
  unitPrice: number;
};

export default function WhatsAppDeliveryOption({
  items,
  couponCode,
  disabled = false,
}: {
  items: DeliveryItem[];
  couponCode?: string;
  disabled?: boolean;
}) {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const message = [
    "Olá, LSZ Store! Quero continuar minha compra pelo WhatsApp e combinar a retirada por Uber.",
    "",
    "Itens do carrinho:",
    ...items.map((item) =>
      `${item.quantity}x ${item.name}${item.variantLabel ? ` (${item.variantLabel})` : ""} — ${formatCurrency(item.unitPrice * item.quantity)}`
    ),
    "",
    `Subtotal dos produtos (sem frete e descontos): ${formatCurrency(subtotal)}`,
    ...(couponCode ? [`Cupom informado: ${couponCode} (a confirmar com a loja).`] : []),
    "",
    "Podem confirmar a disponibilidade dos produtos, o pagamento e o local e horário de retirada antes de eu chamar o Uber? O valor da corrida será combinado à parte.",
  ].join("\n");
  const canContinue = items.length > 0 && !disabled;
  const buttonClass = "mt-4 inline-flex w-full items-center justify-center gap-2 rounded bg-emerald-400 px-4 py-3 text-center text-sm font-bold uppercase text-black transition-colors hover:bg-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300 disabled:opacity-50";

  return (
    <div className="rounded border border-emerald-400/40 bg-emerald-400/5 p-4">
      <h3 className="flex items-center gap-2 font-bold text-white">
        <MessageCircle size={20} className="shrink-0 text-emerald-300" aria-hidden="true" />
        Quer chamar um Uber?
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-silver">
        Continue pelo WhatsApp para combinar a retirada com a loja em {storeContact.location}.
        Confirme a disponibilidade e o horário antes de chamar o motorista. O valor da corrida é combinado à parte.
      </p>
      {canContinue ? (
        <a
          href={`https://wa.me/${storeContact.whatsapp}?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
        >
          Continuar pelo WhatsApp
          <span className="sr-only"> (abre em uma nova aba)</span>
        </a>
      ) : (
        <button type="button" disabled className={buttonClass}>
          Continuar pelo WhatsApp
        </button>
      )}
      <p className="mt-2 text-xs leading-relaxed text-silver">
        Você pode falar com a loja sem preencher o endereço ou calcular o frete.
        A compra será combinada no atendimento; abrir a conversa não confirma o pedido.
      </p>
    </div>
  );
}
