# Origem do frete: Correios Cachoeirinha-RS (2026-10-27)

## Decisao

- O calculo de frete do checkout passa a usar como origem o CEP `94950-001`
  (Agencia AC Cachoeirinha, Av. Gen. Flores da Cunha, 1330, Vila Bom Principe,
  Cachoeirinha-RS), em vez do padrao anterior `01001-000` (Sao Paulo).
- `SHIPPING_ORIGIN_ZIP` foi atualizada na Vercel (production) para `94950001` e
  o valor padrao em `src/server/config/env.ts` e `.env.example` foi alinhado.
- As cotacoes continuam sendo calculadas pela API do Melhor Envio (SEDEX, PAC e
  transportadoras), agora partindo de Cachoeirinha-RS, o que reflete o custo
  real de postagem da loja.

## Observacao

- Caso a loja passe a postar por outra agencia, basta ajustar
  `SHIPPING_ORIGIN_ZIP` na Vercel; o valor e apenas o CEP de origem usado na
  chamada `/api/v2/me/shipment/calculate`.
