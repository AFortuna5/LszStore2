# Segurança

Este é um projeto em desenvolvimento. A publicação do código não representa uma certificação de segurança nem a conclusão da operação financeira.

## Relatar uma vulnerabilidade

Use a aba **Security → Report a vulnerability** do GitHub, quando disponível. Não publique credenciais, dados de clientes ou detalhes exploráveis em issues públicas. Se o canal privado não estiver disponível, solicite um contato privado ao mantenedor sem incluir detalhes sensíveis.

## Credenciais e dados

- Use `.env.example` como modelo; valores reais ficam no ambiente local ou no gerenciador de segredos da hospedagem.
- Variáveis `NEXT_PUBLIC_*` são públicas. Nunca coloque nelas chaves secretas.
- Não versione bancos, exports de clientes, logs privados, sessões de navegador ou backups.
- O `.gitignore` não remove arquivos já presentes no histórico. Credenciais comprometidas devem ser revogadas e substituídas, mesmo após remover o arquivo.
- Use contas e chaves de teste para desenvolvimento. Não execute o seed em produção.
- Revise dependências, permissões e regras de negócio antes de qualquer uso real.

## Repositório público

Qualquer visitante pode consultar e copiar o código publicado, inclusive versões antigas. Credenciais, dados de produção e acesso administrativo não fazem parte da distribuição. Imagens e marcas podem pertencer a terceiros; sua presença não concede licença de reutilização.
