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
O schema fica em `src/db/schema.ts`, espelhando `Modelo-Dados-ER.md` (tabelas `projetos`, `especificacoes_tecnicas`, `historico_transicoes`). Com `DATABASE_URL` configurada em `.env.local`:

```bash
npm run db:generate    # gera arquivos de migration a partir do schema (pasta drizzle/)
npm run db:push        # aplica o schema diretamente no banco Neon (uso em desenvolvimento)
```

## 5. Estrutura de código
* `src/app/` — páginas e rotas de API (App Router).
* `src/app/api/projetos/` — endpoints REST descritos em `Especificacao-API.md` (ainda como stubs retornando 501 — implementação real é tarefa do `Board-Tarefas.md`).
* `src/components/layout|board|details/` — componentes descritos em `Matriz-Componentes.md`.
* `src/components/ui/` — componentes gerados pelo shadcn/ui (não editar manualmente; regenerar via `npx shadcn@latest add <componente>`).
* `src/db/` — schema e client Drizzle.
* `src/types/projeto.ts` — tipos TypeScript compartilhados entre front-end e API.

## 5. Convenções de branch e commit
* Branches: `feature/<descricao-curta>`, `fix/<descricao-curta>`.
* Commits: mensagens no imperativo, descrevendo o *porquê* quando não óbvio (ex: `fix: bloquear transição sem validação de parâmetros`).
* Toda tarefa deve corresponder a um item do `04-Acompanhamento/Board-Tarefas.md` antes de ser iniciada.

## 6. Deploy
* Preview: push em qualquer branch gera deploy de preview automático via Vercel.
* Produção: merge na branch principal promove para produção (ver `03-Processos/Metodologia-Trabalho.md` para o critério de "pronto" antes do merge).
