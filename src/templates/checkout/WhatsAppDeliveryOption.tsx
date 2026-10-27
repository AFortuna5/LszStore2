import { MessageCircle } from "lucide-react";

import { WHATSAPP_SHIPPING_ID } from "@/shared/checkout-whatsapp";

export default function WhatsAppDeliveryOption({
  checked,
  onSelect,
}: {
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      role="radio"
      aria-checked={checked}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={`flex cursor-pointer touch-manipulation items-center gap-3 rounded border p-4 transition-colors select-none ${checked ? "border-emerald-400 bg-emerald-400/10" : "border-emerald-400/40 bg-emerald-400/5"}`}
    >
      <input
        type="radio"
        name="shipping"
        value={WHATSAPP_SHIPPING_ID}
        checked={checked}
        onChange={onSelect}
        tabIndex={-1}
        className="pointer-events-none accent-emerald-400"
      />
      <span className="flex flex-1 items-start gap-3 text-silver">
        <MessageCircle size={20} className="mt-0.5 shrink-0 text-emerald-300" aria-hidden="true" />
        <span>
          <strong className="text-white">WhatsApp · retirada por Uber</strong>
          <small className="mt-1 block">
            Pague pelo site normalmente e depois combine a retirada por Uber com a loja pelo WhatsApp.
            Seu pedido e endereco ja chegam na mensagem. O valor da corrida fica por sua conta.
          </small>
        </span>
      </span>
      <strong className="text-sm text-white">A combinar</strong>
    </div>
  );
}
