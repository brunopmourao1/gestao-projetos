# Documentação de Arquitetura e Modelagem
**Projeto:** Sistema de Gestão de Comissionamento

## 1. Arquitetura Lógica
O sistema é dividido em rotinas e sub-rotinas focadas em responsabilidade única, garantindo isolamento de problemas e facilidade de manutenção.

### 1.1. Rotinas Principais (Orquestração)
* `GerenciadorEstadoBoard`: Responsável por consultar a base de dados e renderizar os projetos nas colunas corretas.
* `MotorApresentacao`: Rotina de compilação que captura os dados técnicos e o status do projeto para montar e exportar o relatório executivo.

### 1.2. Sub-rotinas (Execução Micro)
* `CalculoMetricasTempo`: Sub-rotina acionada a cada mudança de coluna para calcular o tempo de permanência em cada estágio de montagem.
* `validarChecklist`: Sub-rotina genérica que verifica se todos os itens configurados de uma fase (Offline ou Online, ver `Checklist_Itens`/HU-20) estão marcados antes de permitir a transição pra próxima coluna do fluxo.

> **Nota histórica:** existia uma sub-rotina `ValidacaoParametrosFisicos` (dados de motores/sensores/esquema elétrico, tabela `Especificacoes_Tecnicas`) que bloqueava a transição pra "Operação Concluída" — **removida por completo** numa sessão posterior a pedido do usuário, junto com a própria coluna "Operação Concluída" (substituída por "Tryout com o Cliente"/"Máquina Entregue", ver HU-19). Ver `Backlog-Historias-Usuario.md` (HU-06/07/08, marcadas como removidas) e `Board-Tarefas.md`.

### 1.3. Segurança (HU-21/HU-23)
* **Autenticação:** senha única compartilhada (`APP_PASSWORD`), sem contas individuais. `src/proxy.ts` (renomeação de `middleware.ts` no Next.js 16) intercepta toda rota exceto `/login`/`/api/login`, valida a sessão contra a tabela `Sessoes` no banco e redireciona (páginas) ou responde `401` (API) quando inválida.
* **Sessão:** token aleatório de 256 bits por login (não derivado da senha), com expiração e revogação individual via `POST /api/logout` — ver tabela `Sessoes` em `Modelo-Dados-ER.md`.
* **Rate limiting:** `POST /api/login` bloqueia um IP após 5 tentativas erradas em 15 minutos, persistido na tabela `Tentativas_Login` (Postgres, não memória — sobrevive a cold start em ambiente serverless).
* **Cabeçalhos de segurança:** `src/proxy.ts` gera uma Content-Security-Policy com nonce novo a cada request (exigência do Next.js pra não bloquear o script inline de streaming de RSC — ver nota técnica em HU-23) e define `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` estáticos em `next.config.ts`.

## 2. Modelagem de Dados
Estrutura relacional pensada para operar em bancos de dados serverless modernos. Ver `Modelo-Dados-ER.md` para o diagrama completo e atualizado — resumo:

**Tabela: `Projetos`**
* `id_projeto` (UUID)
* `nome_maquina` (String)
* `status_atual` (Enum: Esquema_Eletrico, Offline, Montagem, Online, Tryout, Entregue)
* `data_criacao` (Timestamp)
* `checklist_offline` / `checklist_online` (JSON — mapa chave-item → concluído, chaves definidas em `Checklist_Itens`)

**Tabela: `Checklist_Itens`** (configuração global, sem FK pra `Projetos` — ver HU-20)
* `id_item` (UUID)
* `fase` (Enum: Offline, Online)
* `chave` (String — identificador estável usado no JSON `checklist_offline`/`checklist_online`)
* `rotulo` (String)
* `ordem` (Int)

**Tabela: `Pendencias_Visitas`** (log de pendências de visitas técnicas, fases Tryout/Entregue — ver HU-19)
* `id_pendencia` (UUID)
* `id_projeto` (UUID - FK)
* `data` (Timestamp)
* `texto` (Text)

**Tabela: `Historico_Transicoes`**
* `id_transicao` (UUID)
* `id_projeto` (UUID - FK)
* `coluna_origem` (String)
* `coluna_destino` (String)
* `data_movimentacao` (Timestamp)

**Tabela: `Sessoes`** (autenticação, sem FK — ver seção 1.3)
* `token` (String, PK — 256 bits aleatórios)
* `criada_em` / `expira_em` (Timestamp)

**Tabela: `Tentativas_Login`** (rate limiting do login, sem FK — ver seção 1.3)
* `id` (UUID)
* `ip` (String)
* `criada_em` (Timestamp)