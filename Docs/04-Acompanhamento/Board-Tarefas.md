# Board de Tarefas do Time de Desenvolvimento
**Metodologia:** Kanban simples (ver `03-Processos/Metodologia-Trabalho.md`). Este documento é vivo — atualizar a cada sessão de trabalho movendo as tarefas entre as colunas.

## Backlog
_(vazio — todas as histórias de usuário da Fase 1, `01-Produto/Backlog-Historias-Usuario.md`, foram concluídas. Próximos itens vêm do backlog de produto para fases futuras, ainda não detalhados aqui.)_

## Em Progresso
_(vazio)_

## Em Revisão
- [ ] HU-02 (revisada) — Botões "← Voltar"/"Avançar →" substituídos por drag-and-drop (`@dnd-kit`). Lógica de negócio (bloqueio de pular etapa, `ordem` no drop) verificada via curl direto na API; a interação de arrastar em si **ainda não foi testada visualmente no navegador** nesta sessão (extensão do Chrome desconectou) — confirmar manualmente antes de considerar concluído.
- [ ] HU-12 — Priorizar projetos dentro da coluna (drag-and-drop + campo `ordem` persistido) — mesma pendência de verificação visual acima.

## Feito
- [x] Provisionar banco Neon e aplicar schema inicial (`Projetos`, `Especificacoes_Tecnicas`, `Historico_Transicoes`)
- [x] Implementar `GET/POST /api/projetos`
- [x] Implementar `GET /api/projetos/:id`
- [x] Implementar `PATCH /api/projetos/:id/status` com validação de transição sequencial (`isTransicaoValida`)
- [x] Implementar `PUT /api/projetos/:id/especificacoes`
- [x] Implementar `GET /api/projetos/:id/historico`
- [x] Implementar `GET /api/projetos/:id/metricas-tempo` (`CalculoMetricasTempo`)
- [x] Implementar `GET /api/projetos/:id/relatorio` e `POST /api/projetos/:id/relatorio/exportar` (`MotorApresentacao`; exportação como Markdown em `data:` URL — sem PDF/Blob por enquanto)
- [x] HU-01 — Componente `KanbanBoard` + `KanbanColumn` renderizando dados reais (board religado à API)
- [x] HU-04 — Exibir histórico de transições (Aba 1 do Drawer) — dados reais via fetch ao abrir o card
- [x] HU-08 — Bloqueio de transição para "Concluído" sem parâmetros obrigatórios (`ValidacaoParametrosFisicos`, verificado ponta a ponta)
- [x] HU-06 — Formulário de dados de motores (Aba 2 do Drawer)
- [x] HU-07 — Formulário de dados de sensores (Aba 2 do Drawer) — incluindo fix de merge parcial em `PUT .../especificacoes` (salvar uma seção não apaga mais a outra)
- [x] HU-02 (versão original) — Ação de mover `ProjectCard` entre colunas adjacentes (botões "← Voltar"/"Avançar →" no card, erro inline com campos faltantes quando bloqueado) — substituída por drag-and-drop, ver "Em Revisão"
- [x] HU-05 — Exibição de lead time por estágio na UI (seção "Tempo por Estágio" na Aba 1, atualiza junto com o histórico ao mover o card)
- [x] HU-09 — Preview do relatório na Aba 3 + botão de exportação na `TopNavbar`, ligado ao projeto ativo do drawer. Corrigido bug de layout em `sheet.tsx` onde o painel do drawer cobria a `TopNavbar` inteira (`inset-y-0`), tornando o botão de exportar inacessível enquanto o drawer estava aberto — ajustado pra `top-14`, respeitando a altura da navbar.
- [x] HU-03 — Busca global de projetos (filtro client-side por `numero`/`nomeMaquina`, case-insensitive e parcial, campo na `TopNavbar` habilitado) — última história da Fase 1
- [x] HU-10 — Criar novo projeto (descoberta em produção: `POST /api/projetos` nunca tinha sido exposta na UI). Botão "Novo Projeto" na `TopNavbar` abre `NovoProjetoDialog` (modal), campo obrigatório é o número da OS.
- [x] Adicionar campos `numero` (OS, obrigatório e único) e `descricao` (opcional) ao Projeto — feedback real do usuário ("projetos sempre são chamados pelo número, ex: OS 1800"). Migração em 3 etapas no banco de produção (colunas nullable → backfill do registro real "OS 1800" que já existia, usando `nome_maquina` como origem → `NOT NULL` + `UNIQUE`), sem perda de dado. `nome_maquina` virou opcional. `numero` passou a ser o identificador exibido no `ProjectCard`/`SheetTitle` e usado na busca (HU-03) e no nome do arquivo exportado (HU-09). Erro de número duplicado tratado via `.cause.code === "23505"` (drizzle-orm envolve o erro original do driver em `DrizzleQueryError`).
- [x] HU-11 — Editar projeto (`EditarProjetoDialog`, botão "Editar" no cabeçalho do drawer). Extraído `ProjetoFormCampos.tsx` compartilhado entre criar/editar; placeholder do nome atualizado pra `ex: Solda US - TF - Furação e Solda US`. Verificado via curl: edição bem-sucedida e bloqueio de número duplicado (409).
- [x] Adicionar campo `ordem` (double precision, fractional indexing) ao Projeto — base pra HU-12. Migração em 3 etapas (mesmo padrão seguro) preservando os 2 projetos reais existentes. `src/lib/ordenacao.ts` (`calcularOrdem`, testado) calcula a posição sem precisar reescrever a coluna inteira a cada reordenação. Novo endpoint `PATCH /api/projetos/:id/ordem`; `PATCH .../status` aceita `ordem` opcional pra reposicionar no drop entre colunas. Verificado via curl (reordenar, mover+reposicionar, bloqueio de pular etapa preservando `ordem`).
- [x] HU-13 — Excluir projeto (pedido mid-sessão). `DELETE /api/projetos/:id` (especificações/histórico removidos em cascata via FK `ON DELETE CASCADE` já existente). `ExcluirProjetoDialog` com confirmação explícita (ação irreversível), botão "Excluir" no cabeçalho do drawer ao lado de "Editar". Verificado via curl (exclusão + 404 subsequente + lista final correta).
