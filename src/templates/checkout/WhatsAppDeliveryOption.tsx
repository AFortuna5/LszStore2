import { MessageCircle } from "lucide-react";

import { WHATSAPP_SHIPPING_ID } from "@/shared/checkout-whatsapp";
import { storeContact } from "@/shared/store-contact";

export default function WhatsAppDeliveryOption({
  checked,
  disabled = false,
  onSelect,
  onContinue,
}: {
  checked: boolean;
  disabled?: boolean;
  onSelect: () => void;
  onContinue: () => void;
}) {
  return (
    <div className={`rounded border p-4 transition-colors ${checked ? "border-emerald-400 bg-emerald-400/10" : "border-emerald-400/40 bg-emerald-400/5"}`}>
      <label className={`flex items-center gap-3 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
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
              Combine a retirada com a loja em {storeContact.location}. O valor da corrida é combinado à parte.
            </small>
          </span>
        </span>
        <strong className="text-sm text-white">A combinar</strong>
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={onContinue}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded bg-emerald-400 px-4 py-3 text-center text-sm font-bold uppercase text-black transition-colors hover:bg-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300 disabled:opacity-50"
      >
        Continuar pelo WhatsApp
      </button>
      <p className="mt-2 text-xs leading-relaxed text-silver">
        A mensagem será preenchida automaticamente com os produtos, seus dados, cupom e total dos produtos.
        O endereço pode ser combinado no atendimento; abrir a conversa não confirma nem cobra o pedido.
      </p>
    </div>
  );
}
