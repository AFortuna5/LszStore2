# Entrega combinada pelo WhatsApp — 27/10/2026

## Decisão vigente (revisão 2)

Arthur decidiu nesta sessão que **o pagamento é sempre feito pelo site** e o WhatsApp serve apenas para combinar a retirada por Uber após o pagamento. O modo anterior (pedido inteiro combinado no WhatsApp, sem pagamento) foi substituído. As opções de frete normais (Correios/Melhor Envio) continuam existindo ao lado da opção WhatsApp.

## Fluxo atual

1. Na seção Entrega, a opção selecionável "WhatsApp · retirada por Uber" aparece junto das cotações, com valor "A combinar" (o cliente paga a corrida direto ao Uber).
2. Com essa opção, o endereço completo também é obrigatório (decisão de Arthur na revisão seguinte), pois a mensagem já leva o pedido e o endereço de entrega. A cotação de frete não é exigida, pois a corrida do Uber é combinada à parte.
3. O checkout exige login como uma compra normal, cria o pedido via `/api/orders` com `shippingServiceId = "WHATSAPP_UBER"` (frete R$ 0, serviço "WhatsApp - retirada por Uber") e abre o pagamento Stripe.
4. Após a confirmação do pagamento, a página de retorno (`/checkout/retorno`) exibe o botão "Combinar retirada pelo WhatsApp", que abre `https://wa.me/5551996957614` com mensagem automática contendo número do pedido, itens, variações, nome do cliente e endereço de entrega.
5. No painel admin, o pedido aparece com a entrega "WhatsApp - retirada por Uber".

## Implementação

- `src/shared/checkout-whatsapp.ts`: identificador/rótulo da opção, número de destino e mensagem de retirada com o código do pedido.
- `src/templates/checkout/WhatsAppDeliveryOption.tsx`: opção de entrega selecionável.
- `src/app/checkout/page.tsx`: endereço obrigatório em todas as entregas e envio do `shippingServiceId` correspondente.
- `src/app/api/orders/route.ts`: aceita `WHATSAPP_UBER` sem cotação de frete; exige o endereço completo como nas demais entregas.
- `src/app/api/orders/payment-status/route.ts`: retorna itens e `shippingServiceId` para montar o botão.
- `src/templates/checkout/PaymentStatus.tsx`: botão do WhatsApp exibido após pagamento aprovado.
- `src/templates/admin/AdminOrdersClient.tsx`: prazo de entrega oculto quando não existe.
- `tests/checkout-whatsapp.test.ts`: regressão da mensagem e do número de destino.

## Validação

- `npm run check`: lint, testes, TypeScript e build aprovados.
- Navegador: seleção da opção, envio do pedido pela API e retorno esperados.
- As verificações não enviaram mensagens reais nem realizaram compras.

Não há migração de banco nem configuração nova. A publicação utiliza o projeto `lszstore2` na Vercel, conectado ao repositório `AFortuna5/LszStore2`.

## Fluxo autorizado

Arthur confirmou nesta sessão que toda alteração deve seguir o ciclo de commit com apenas sua autoria e deploy na Vercel. Utilizar a identidade já usada neste repositório, `AFortuna5 <arthurfortuna17@gmail.com>`, sem assinatura ou coautoria do assistente. Conferir o endereço público após o deploy em produção.
