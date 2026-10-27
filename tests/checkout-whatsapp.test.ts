import { describe, expect, it } from "vitest";

import {
  buildWhatsAppPickupMessage,
  buildWhatsAppPickupUrl,
  WHATSAPP_SHIPPING_ID,
  WHATSAPP_SHIPPING_LABEL,
} from "../src/shared/checkout-whatsapp";

const order = {
  code: "AB12CD34",
  customerName: "Ana Cliente",
  address: {
    zipCode: "94900-000",
    street: "Rua Teste",
    number: "123",
    neighborhood: "Centro",
    city: "Cachoeirinha",
    state: "RS",
    complement: "Apto 10",
  },
  items: [
    { name: "CHINELO ARMANI EXCHANGE", variantLabel: "40", quantity: 2 },
    { name: "Camiseta", variantLabel: null, quantity: 1 },
  ],
};

describe("retirada por Uber combinada pelo WhatsApp", () => {
  it("identifica o pedido pago com itens, variacao, cliente e endereco", () => {
    const message = buildWhatsAppPickupMessage(order);

    for (const expected of [
      "pedido #AB12CD34 foi pago no site",
      "PEDIDO #AB12CD34",
      "2x CHINELO ARMANI EXCHANGE (40)",
      "1x Camiseta",
      "Nome: Ana Cliente",
      "ENDEREÇO PARA ENTREGA",
      "Rua Teste, 123",
      "Apto 10",
      "Cachoeirinha - RS",
      "CEP 94900-000",
      "local e o horário de retirada",
    ]) {
      expect(message).toContain(expected);
    }
  });

  it("direciona para o WhatsApp da loja com a mensagem codificada", () => {
    const url = new URL(buildWhatsAppPickupUrl(order));
    expect(url.hostname).toBe("wa.me");
    expect(url.pathname).toBe("/5551996957614");
    const message = url.searchParams.get("text") ?? "";
    expect(message).toContain("#AB12CD34");
    expect(message).toContain("Ana Cliente");
  });

  it("expoe identificador e rotulo da opcao de entrega", () => {
    expect(WHATSAPP_SHIPPING_ID).toBe("WHATSAPP_UBER");
    expect(WHATSAPP_SHIPPING_LABEL).toContain("Uber");
  });
});
