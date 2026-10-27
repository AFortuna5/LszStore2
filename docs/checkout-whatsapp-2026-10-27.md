# Entrega combinada pelo WhatsApp — 27/10/2026

## Solicitação e comportamento

Incluir no frete do checkout uma opção de continuar pelo WhatsApp para quem deseja chamar um Uber e preparar automaticamente a mensagem com o pedido da pessoa.

A seção Entrega oferece a opção selecionável “WhatsApp · retirada por Uber”, com valor “a combinar”. Ao continuar por essa opção, o site abre `https://wa.me/5551996957614` com a mensagem já preenchida.

A mensagem contém:

- produtos, SKU/referência, variação, quantidade e valor de cada item;
- subtotal, cupom e desconto aplicado, quando houver;
- total dos produtos, deixando o valor da corrida para combinar separadamente;
- nome, telefone e e-mail informados no checkout;
- endereço informado ou indicação de que será combinado no atendimento.

Para WhatsApp/Uber, nome, telefone e e-mail continuam obrigatórios. O endereço e a cotação de frete não são exigidos, pois a retirada é combinada no atendimento. Se o CEP for informado, o checkout ainda preenche os campos de endereço, mas não substitui a opção WhatsApp por uma cotação.

Para as demais opções de entrega, o fluxo anterior continua exigindo endereço, cálculo/seleção do frete, conta do cliente e pagamento pela Stripe.

Abrir a conversa não confirma nem cobra o pedido, não altera estoque e preserva o carrinho. O envio da mensagem depende da ação do cliente no WhatsApp.

## Implementação

- `src/shared/checkout-whatsapp.ts`: identificador da opção, número de destino e mensagem automática do pedido.
- `src/templates/checkout/WhatsAppDeliveryOption.tsx`: opção de entrega e botão de continuação.
- `src/app/checkout/page.tsx`: seleção da entrega, validação, resumo, cálculo de CEP e abertura do WhatsApp.
- `tests/checkout-whatsapp.test.ts`: regressão da mensagem e do número de destino.

## Validação

- `npm run check`: lint, 37 testes existentes, TypeScript e build aprovados.
- Dois testes novos validam a mensagem completa e o número `5551996957614`.
- As verificações não enviaram mensagens reais nem realizaram compras.

Não há migração de banco nem configuração nova. A publicação utiliza o projeto `lszstore2` na Vercel, conectado ao repositório `AFortuna5/LszStore2`.

## Fluxo autorizado

Arthur confirmou nesta sessão que toda alteração deve seguir o ciclo de commit com apenas sua autoria e deploy na Vercel. Utilizar a identidade já usada neste repositório, `AFortuna5 <arthurfortuna17@gmail.com>`, sem assinatura ou coautoria do assistente. Conferir o endereço público após o deploy em produção.
