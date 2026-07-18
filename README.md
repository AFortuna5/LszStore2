# LSZ Store

Loja virtual construída com Next.js, React, TypeScript, Prisma e PostgreSQL. O projeto inclui catálogo, carrinho, checkout, contas de clientes e painel administrativo.

## Estrutura do projeto

```text
LszStore2/
├── prisma/                    # Schema e carga inicial do banco
├── public/                    # Imagens e arquivos públicos
├── src/
│   ├── app/                   # Rotas, layouts e endpoints do Next.js
│   │   ├── api/               # Entradas HTTP da aplicação
│   │   └── ...                # Páginas e segmentos de URL
│   ├── templates/             # Somente interface e componentes visuais
│   │   ├── admin/             # Interface do painel administrativo
│   │   ├── cart/              # Componentes do carrinho
│   │   ├── home/              # Seções da página inicial
│   │   ├── layout/            # Cabeçalho, rodapé e estrutura visual
│   │   └── products/          # Cards, grades e ações de produtos
│   ├── server/                # Código que nunca deve ir para o navegador
│   │   ├── auth/              # Sessão, senhas e autenticação
│   │   ├── database/          # Cliente Prisma
│   │   ├── http/              # Validação e respostas das APIs
│   │   ├── repositories/      # Consultas ao catálogo
│   │   └── services/          # Regras de negócio, como pedidos
│   └── shared/                # Tipos e funções puras compartilhadas
├── dev.db                     # Backup legado usado somente na migracao
├── compose.yaml               # PostgreSQL local para desenvolvimento
└── package.json
```

### Regras de organização

- `templates` não acessa Prisma, cookies ou segredos. Dados chegam por propriedades ou pelas APIs.
- `server` contém autenticação, persistência e regras de negócio e está protegido por `server-only`.
- `shared` aceita importação tanto no cliente quanto no servidor e não possui dependências exclusivas de Node.js.
- `app/api` apenas valida a requisição, verifica autorização e chama os módulos de `server`.
- Novos componentes devem ser colocados no domínio correspondente dentro de `templates`.

## Executando localmente

```bash
npm install
cp .env.example .env
docker compose up -d postgres
npx prisma generate
npm run db:deploy
npm run db:seed
npm run dev
```

A aplicação estará disponível em [http://localhost:3000](http://localhost:3000).

Conta administrativa inicial para desenvolvimento:

```text
E-mail: admin@lszstore.com.br
Senha: admin123
```

Altere essas credenciais e configure `AUTH_SECRET` antes de publicar o projeto.

### Migrando os dados existentes do SQLite

O arquivo `dev.db` e preservado como fonte. Com o PostgreSQL vazio e as migrations aplicadas, execute:

```bash
docker compose up -d postgres
npm run db:deploy
npm run db:migrate:sqlite
```

O importador copia IDs, usuarios, produtos, pedidos, enderecos e logs de inventario sem alterar o SQLite original. Ele recusa um PostgreSQL que ja contenha usuarios para evitar mistura acidental de bases. Para uma importacao conscientemente incremental, use `npm run db:migrate:sqlite -- --allow-non-empty`.

## Verificações

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Ou execute toda a validação de uma vez:

```bash
npm run check
```

## Integrações de produção

Copie `.env.example` para `.env` e preencha as credenciais. Sem credenciais, o projeto permanece em modo local: pagamento manual, frete padrão e e-mails apenas armazenados no painel.

- **PostgreSQL:** configure `DATABASE_URL` para a aplicacao e `DIRECT_URL` para migrations. Em producao, aplique o schema com `npm run db:deploy`; nunca use `prisma db push` nem `migrate dev` no banco produtivo.

- **Stripe:** defina `PAYMENT_PROVIDER=stripe`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` e cadastre `https://SEU-DOMINIO/api/payments/stripe/webhook` para os eventos `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`, `charge.refunded` e `charge.dispute.created`.
- Para testes, use uma chave `sk_test_...` e `STRIPE_LIVE_MODE=false`. Para cobrar de verdade, use uma chave `sk_live_...`, `STRIPE_LIVE_MODE=true` e um `APP_URL` publico com HTTPS.
- Guarde a chave secreta e a assinatura `whsec_...` apenas nas variaveis protegidas da hospedagem. Nunca envie esses valores ao navegador nem os versione no Git.
- Antes de liberar a loja, conclua uma compra de teste e confirme que o pedido muda de `PENDING` para `PAID` depois que o webhook for recebido.
- **Melhor Envio:** configure o CEP de origem e `MELHOR_ENVIO_TOKEN`. Use sandbox durante a homologação.
- **Resend:** configure `RESEND_API_KEY`, valide o domínio e altere `EMAIL_FROM`.
- **Cloudinary:** informe as três credenciais para liberar upload de imagens no editor de produtos.
- **Contato público:** substitua telefone, WhatsApp, Instagram e e-mail pelos dados definitivos do cliente.

Antes de publicar, troque a senha inicial do administrador, revise os textos jurídicos com o responsável pela loja, configure backup do banco e teste pagamento/frete com contas sandbox dos provedores.

## Funcionalidades operacionais

- cálculo de frete no servidor e preenchimento de endereço por CEP;
- Stripe Checkout e sincronização de pagamento por webhook;
- painel de pedidos, status, cancelamento, estoque e rastreio;
- escolha de variações e estoque por SKU;
- recuperação de senha e limitação de tentativas;
- contato, newsletter e caixa de entrada administrativa;
- upload de produtos, busca, sitemap, robots e metadados sociais;
- health check em `/api/health` e CI em `.github/workflows/quality.yml`.
