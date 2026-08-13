# Guia de Setup do Ambiente de Desenvolvimento
**Stack:** Next.js 16 (App Router, TypeScript, Tailwind CSS v4 + shadcn/ui) + Drizzle ORM + Postgres serverless (Neon) via integração Vercel. Testes com Vitest + Testing Library.

## 1. Pré-requisitos
* Node.js instalado (projeto criado/testado com Node 24).
* Conta Vercel com projeto criado e vinculado (`vercel link`).
* Acesso ao banco Neon provisionado via Marketplace da Vercel.

## 2. Variáveis de ambiente esperadas
Copiar `.env.local.example` para `.env.local` e preencher:

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão do banco Neon (Postgres), injetada pela integração Vercel |
| `NEXT_PUBLIC_APP_URL` | URL base da aplicação (usada em links de exportação de relatório) |
| `APP_PASSWORD` | Senha única compartilhada que protege o sistema inteiro (login simples, sem contas individuais — ver `src/proxy.ts` e HU-21) |

> Alternativa: usar `vercel env pull` para sincronizar variáveis do ambiente Vercel para `.env.local`.

## 3. Comandos de desenvolvimento
```bash
npm install          # instalar dependências
npm run dev           # subir ambiente local (http://localhost:3000)
npm run build          # build de produção
npm run lint           # checagem de lint
npm run test            # rodar testes (Vitest) uma vez
npm run test:watch       # rodar testes em modo watch
```

## 4. Migrações de banco (Drizzle)
O schema fica em `src/db/schema.ts`, espelhando `Modelo-Dados-ER.md` (tabelas `projetos`, `historico_transicoes`, `pendencias_visitas`, `checklist_itens`, `sessoes`, `tentativas_login`). Com `DATABASE_URL` configurada em `.env.local`:

```bash
npm run db:generate    # gera arquivos de migration a partir do schema (pasta drizzle/)
npm run db:push        # aplica o schema diretamente no banco Neon (uso em desenvolvimento)
```

## 5. Estrutura de código
* `src/app/` — páginas e rotas de API (App Router).
* `src/app/api/projetos/` e `src/app/api/configuracoes/` — endpoints REST descritos em `Especificacao-API.md`.
* `src/components/layout|board|details|configuracoes/` — componentes descritos em `Matriz-Componentes.md`.
* `src/components/ui/` — componentes gerados pelo shadcn/ui (não editar manualmente; regenerar via `npx shadcn@latest add <componente>`).
* `src/db/` — schema e client Drizzle.
* `src/types/projeto.ts` — tipos TypeScript compartilhados entre front-end e API.
* `src/proxy.ts` — protege o sistema com a senha única compartilhada (`APP_PASSWORD`, ver HU-21/HU-23): valida a sessão (tabela `sessoes`) e também gera a Content-Security-Policy (nonce novo por request) aplicada a toda página. **Atenção:** nesta versão do Next.js (16), o antigo `middleware.ts` foi renomeado pra `proxy.ts` com export `proxy` (não `middleware`) — e como o projeto usa `src/`, o arquivo precisa ficar em `src/proxy.ts`, não na raiz do repo. Ver `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`.
* **Atenção ao mexer em headers/CSP:** `curl` só confirma que o header está presente, não que o navegador consegue *usar* a página com ele — CSP sem nonce/`unsafe-inline` bloqueia silenciosamente o `<script>` inline que o App Router usa pra streaming de RSC (aparece como `Minified React error #412: Connection closed` no console, não como uma violação de CSP óbvia). Sempre testar no navegador de verdade (console limpo + interatividade real) depois de qualquer mudança nesse arquivo ou em `next.config.ts`. Ver `node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md`.

## 5. Convenções de branch e commit
* Branches: `feature/<descricao-curta>`, `fix/<descricao-curta>`.
* Commits: mensagens no imperativo, descrevendo o *porquê* quando não óbvio (ex: `fix: bloquear transição sem validação de parâmetros`).
* Toda tarefa deve corresponder a um item do `04-Acompanhamento/Board-Tarefas.md` antes de ser iniciada.

## 6. Deploy
* Preview: push em qualquer branch gera deploy de preview automático via Vercel.
* Produção: merge na branch principal promove para produção (ver `03-Processos/Metodologia-Trabalho.md` para o critério de "pronto" antes do merge).
