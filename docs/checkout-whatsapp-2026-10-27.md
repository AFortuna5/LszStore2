# Entrega combinada pelo WhatsApp — 27/10/2026

## Solicitação e comportamento

Incluir no frete do checkout uma opção de continuar pelo WhatsApp para quem deseja chamar um Uber.

A seção Entrega oferece um cartão “Quer chamar um Uber?” com o link “Continuar pelo WhatsApp”. O link usa o contato já configurado em `NEXT_PUBLIC_WHATSAPP_NUMBER`, com o mesmo número padrão utilizado pelo restante da loja.

A mensagem preparada contém produtos, variações, quantidades, valores dos itens, subtotal sem frete ou descontos e o código do cupom, quando informado. Solicita confirmação de disponibilidade, pagamento e local/horário de retirada. O custo da corrida é combinado separadamente.

Essa alternativa funciona sem login, endereço preenchido ou cotação de frete. O carrinho é preservado e nenhum pedido ou pagamento é criado ao abrir o WhatsApp. A compra precisa ser combinada no atendimento. O envio da mensagem depende da ação do cliente no WhatsApp.

O link fica indisponível se não houver produtos carregados, se algum produto do carrinho não for encontrado, se houver estoque insuficiente ou se um pagamento já estiver sendo aberto.

## Implementação

- `src/templates/checkout/WhatsAppDeliveryOption.tsx`: cartão, resumo do carrinho e link com mensagem codificada.
- `src/app/checkout/page.tsx`: integração acima das cotações de entrega.

Também foi explicitada uma coluna nas grades do checkout em telas pequenas para evitar que os campos alarguem a página além da tela.

## Validação

- `npm run check`: lint, 27 testes existentes, TypeScript e build aprovados.
- Build executado novamente após o ajuste das grades, também aprovado.
- Navegador Chromium com APIs simuladas: abertura do destino WhatsApp sem login/endereço, mensagem com variação, quantidade e preço, carrinho preservado e ausência de criação de pedido.
- Confirmada a disponibilidade da alternativa com cotação normal e com erro na cotação.
- Confirmado o bloqueio para carrinho vazio e estoque insuficiente.
- Layout verificado em larguras de 320, 390, 768 e 1365 pixels, sem rolagem horizontal; nenhum erro JavaScript.
- Capturas locais em `.local-artifacts/checkout-whatsapp-mobile.png` e `.local-artifacts/checkout-whatsapp-desktop.png` (ignoradas pelo Git).

As verificações não enviaram mensagens reais nem realizaram compras.

Não há migração de banco nem configuração nova. A publicação utiliza o projeto `lszstore2` na Vercel, conectado ao repositório `AFortuna5/LszStore2`.
