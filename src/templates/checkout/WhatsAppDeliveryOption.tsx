import { MessageCircle } from "lucide-react";

import { WHATSAPP_SHIPPING_ID } from "@/shared/checkout-whatsapp";

export default function WhatsAppDeliveryOption({
  checked,
  disabled = false,
  onSelect,
}: {
  checked: boolean;
  disabled?: boolean;
  onSelect: () => void;
}) {
  return (
    <label className={`flex items-center gap-3 rounded border p-4 transition-colors ${disabled ? "cursor-not-allowed" : "cursor-pointer"} ${checked ? "border-emerald-400 bg-emerald-400/10" : "border-emerald-400/40 bg-emerald-400/5"}`}>
      <input
        type="radio"
        name="shipping"
        value={WHATSAPP_SHIPPING_ID}
        checked={checked}
        disabled={disabled}
        onChange={onSelect}
        className="accent-emerald-400"
      />
      <span className="flex flex-1 items-start gap-3 text-silver">
        <MessageCircle size={20} className="mt-0.5 shrink-0 text-emerald-300" aria-hidden="true" />
        <span>
          <strong className="text-white">WhatsApp · retirada por Uber</strong>
          <small className="mt-1 block">
            Pague pelo site normalmente e depois combine local e horario de retirada com a loja pelo WhatsApp.
            O valor da corrida fica por sua conta.
          </small>
        </span>
      </span>
      <strong className="text-sm text-white">A combinar</strong>
    </label>
  );
}
