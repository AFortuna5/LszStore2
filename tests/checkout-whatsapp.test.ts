import { describe, expect, it } from "vitest";

import { buildWhatsAppOrderMessage, buildWhatsAppOrderUrl } from "../src/shared/checkout-whatsapp";

const order = {
  customer: { fullName: "Ana Cliente", phone: "51 99999-0000", email: "ana@example.com" },
  items: [
    { name: "CHINELO ARMANI EXCHANGE", reference: "CHI-AX-40", variantLabel: "40", quantity: 2, unitPrice: 129.9 },
    { name: "Camiseta", quantity: 1, unitPrice: 100 },
  ],
  coupon: { code: "BEMVINDO10", discountAmount: 20 },
};

describe("pedido pelo WhatsApp", () => {
  it("monta mensagem completa com cliente, itens, cupom e total", () => {
    const message = buildWhatsAppOrderMessage({
      ...order,
      address: {
        zipCode: "94900-000", street: "Rua Teste", number: "123",
        neighborhood: "Centro", city: "Cachoeirinha", state: "RS", complement: "Apto 10",
      },
    });

    for (const expected of [
      "PEDIDO", "2x CHINELO ARMANI EXCHANGE (40)", "SKU/referência: CHI-AX-40",
      "1x Camiseta", "Subtotal:", "Cupom BEMVINDO10", "Entrega por Uber: valor a combinar",
      "Total dos produtos:", "Nome: Ana Cliente", "Telefone: 51 99999-0000",
      "E-mail: ana@example.com", "Rua Teste, 123 - Apto 10", "Cachoeirinha - RS", "CEP 94900-000",
    ]) {
      expect(message).toContain(expected);
    }
  });

  it("direciona para o WhatsApp da loja e informa endereco a combinar", () => {
    const url = new URL(buildWhatsAppOrderUrl({ ...order, coupon: null }));
    expect(url.hostname).toBe("wa.me");
    expect(url.pathname).toBe("/5551996957614");
    const message = url.searchParams.get("text") ?? "";
    expect(message).toContain("Endereço: a combinar pelo WhatsApp");
    expect(message).toContain("Total dos produtos:");
  });
});
