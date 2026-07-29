# Stripe Connect — configuração e operação

## Arquitetura

O projeto usa Stripe Connect com **Direct Charges**. Cada `Store` mantém seu `stripeAccountId` (`acct_...`). A Checkout Session é criada no contexto dessa conta com `stripeAccount` e a plataforma recebe `application_fee_amount`. Não é usado `transfer_data.destination` e não há repasse manual.

O navegador envia apenas IDs de produtos/variantes e quantidades. Produtos, loja, preço, estoque, frete, cupom e comissão são obtidos ou validados no backend. Um pedido pertence a uma única loja; carrinhos mistos são rejeitados. O estoque é reservado na criação do pedido e restaurado de forma transacional em falha final, expiração, reembolso integral ou disputa.

Somente webhooks assinados promovem pedidos a `PAID`. A página de retorno consulta apenas o estado local autenticado. `StripeWebhookEvent.stripeEventId` é único e impede processamento duplicado.

## Variáveis de ambiente

Copie `.env.example` para `.env` e configure:

```dotenv
PAYMENT_PROVIDER=stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_LIVE_MODE=false
STRIPE_DEFAULT_COMMISSION_PERCENTAGE=5
APP_URL=http://localhost:3000
```

Nunca publique a chave secreta, o segredo do webhook ou dados financeiros. A publishable key foi prevista, mas o Checkout hospedado atual não precisa expô-la.

## Banco e início local

```bash
npm ci
npm run db:migrate
npm run db:seed
npm run dev
```

Em produção, aplique migrations sem modo interativo:

```bash
npm run db:deploy
```

A migration `20260728150000_stripe_connect` é aditiva. Ela cria `Store`, `StoreMember` e `StripeWebhookEvent`, acrescenta os campos financeiros e associa o catálogo/pedidos existentes à loja `legacy_store`.

## Onboarding e contas conectadas

Acesse `/admin/financeiro` e clique em **Conectar Stripe**. A implementação cria uma conta Express brasileira, compatível com o Checkout hospedado e Direct Charges, reutiliza o `acct_...` salvo e sempre gera um novo Account Link. Retornar com `success=true` não ativa a loja; a rota de status e `account.updated` consultam os sinais reais da Stripe.

Uma loja só vende quando o estado local é `ACTIVE` e `charges_enabled` está verdadeiro. `payouts_enabled`, `details_submitted` e requisitos não confidenciais também são sincronizados.

## Webhook local

Autentique a Stripe CLI e encaminhe eventos da plataforma e das contas conectadas:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/payments/stripe/webhook --forward-connect-to localhost:3000/api/payments/stripe/webhook
```

Copie o signing secret exibido para `STRIPE_WEBHOOK_SECRET`. Dispare eventos auxiliares com `stripe trigger`, mas para validar `event.account`, Direct Charges e metadata faça um checkout de teste por uma conta conectada.

Eventos tratados:

- `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`;
- `payment_intent.succeeded`, `payment_intent.payment_failed`;
- `charge.refunded`;
- `charge.dispute.created`, `charge.dispute.closed`;
- `account.updated`.

No Dashboard de produção, crie um endpoint para `https://SEU_DOMINIO/api/payments/stripe/webhook`, habilite **Listen to events on Connected accounts** e selecione os eventos acima.

## Checkout e comissão

Use cartões de teste oficiais da Stripe no Checkout. Confirme no Dashboard que a cobrança aparece na conta conectada e que a Application Fee aparece na plataforma. O pedido grava a comissão em centavos em `platformFeeAmount`.

A prioridade do percentual é `Store.commissionPercentage`, seguida de `STRIPE_DEFAULT_COMMISSION_PERCENTAGE`. Apenas administradores da plataforma podem alterar a configuração por `PATCH /api/admin/stores/:id/commission` com `{ "percentage": 7.5 }`. O endpoint aceita de 0 a 100; no checkout, uma comissão que alcance o total é rejeitada.

## Reembolsos

`POST /api/admin/orders/:id/refund` cria um reembolso idempotente no contexto da conta conectada. A decisão atual é **não devolver automaticamente a application fee** (`refund_application_fee: false`); isso evita alterar a receita da plataforma sem uma política comercial explícita. O pedido só é finalizado como reembolsado quando o webhook `charge.refunded` chegar. Reembolso duplicado é bloqueado após `refundedAt` e pela idempotency key.

## Testes e qualidade

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
```

Os testes usam mocks e não chamam a API da Stripe. Teste manualmente onboarding novo/reutilizado, conta incompleta/ativa/suspensa, carrinho misto, webhook duplicado, pagamento assíncrono, falha, reembolso e disputa.

## Mudança para produção

Não misture objetos de teste e produção. Troque as variáveis no provedor de hospedagem, defina `STRIPE_LIVE_MODE=true`, use HTTPS e refaça onboarding com contas reais. IDs `acct_...` de teste não funcionam em live mode.

Checklist:

- conta principal verificada e Connect habilitado em produção;
- perfil, termos, branding e informações da plataforma preenchidos;
- domínio permitido, `APP_URL` HTTPS e política de URLs revisados;
- chaves live e segredo do webhook de produção configurados;
- endpoint ouvindo eventos de contas conectadas;
- conta real criada e onboarding concluído;
- pagamento real de pequeno valor e application fee conferidos;
- reembolso e política de devolução da comissão validados;
- política de chargebacks, termos do lojista e tratamento fiscal/jurídico aprovados;
- monitoramento de erros, alertas de webhooks falhos e rotina de conciliação ativos.

## Limitações conhecidas

- Um checkout aceita apenas uma loja. Separação automática em vários pagamentos não está implementada.
- O painel usa dados locais para métricas; a Stripe só é consultada ao atualizar status/onboarding e nas operações financeiras.
- Reembolsos parciais exigem uma política de estoque/comissão adicional e não são expostos pela rota administrativa atual.
