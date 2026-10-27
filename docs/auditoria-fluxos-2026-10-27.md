# Auditoria completa de fluxos (2026-10-27)

## Escopo testado em producao (lszstore2.vercel.app)

- 28 paginas publicas e admin: todas HTTP 200, sem erros de console/JS.
- Catalogo: todos os produtos publicados abrem (200); categorias e marcas OK.
- Busca, rastreio com codigo invalido, login/cadastro invalidos: mensagens
  amigaveis, sem quebra.
- Carrinho: adicionar, diminuir (remove em qtd=1), lixeira, localStorage
  sincronizado.
- Checkout: CEP valido preenche endereco via ViaCEP; cotacoes Melhor Envio
  partindo do Correios de Cachoeirinha-RS (94950-001); opcao WhatsApp/Uber.
- Admin sem login: paginas redirecionam para /login; APIs admin retornam 401.
- APIs publicas validam entrada (contact, newsletter, coupons, shipping,
  payment-status, orders).

## Bug corrigido

- **IDOR em GET /api/orders**: o parametro `userId` da query sobrescrevia o
  escopo `userId: session.id` para usuarios nao-admin, permitindo que qualquer
  usuario autenticado listasse pedidos (com dados pessoais) de outros clientes.
  Corrigido em `src/app/api/orders/route.ts`: o filtro `userId` agora so vale
  para ADMIN. Filtro extraido para `src/server/services/order-list.ts` com
  teste de regressao em `tests/orders-list-scope.test.ts`.

## Pendencias

- Painel admin (pedidos, produtos, estoque, cupons, financeiro, atendimento)
  exige credenciais de administrador para teste funcional end-to-end; protecao
  verificada (redirect/401), mas fluxos internos nao foram exercitados.
- Fluxo pos-Stripe real (webhook -> status pago -> botao WhatsApp) validado
  apenas com mocks locais; requer conta de teste e/ou Stripe CLI.
