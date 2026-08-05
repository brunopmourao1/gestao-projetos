# Board de Tarefas do Time de Desenvolvimento
**Metodologia:** Kanban simples (ver `03-Processos/Metodologia-Trabalho.md`). Este documento é vivo — atualizar a cada sessão de trabalho movendo as tarefas entre as colunas.

## Backlog
Tarefas técnicas derivadas de `01-Produto/Backlog-Historias-Usuario.md`, na ordem de priorização sugerida (Fase 1 do cronograma primeiro):

- [ ] HU-02 — Ação de mover `ProjectCard` entre colunas adjacentes (UI — API já suporta via `PATCH .../status`)
- [ ] HU-06 — Formulário de dados de motores (Aba 2 do Drawer) (UI — API já suporta via `PUT .../especificacoes`)
- [ ] HU-07 — Formulário de dados de sensores (Aba 2 do Drawer) (UI — API já suporta via `PUT .../especificacoes`)
- [ ] HU-05 — Exibição de lead time por estágio na UI (cálculo já disponível via `GET .../metricas-tempo`)
- [ ] HU-09 — Preview do relatório na Aba 3 + botão de exportação na `TopNavbar` (dados já disponíveis via `GET .../relatorio` e `POST .../relatorio/exportar`)
- [ ] HU-03 — Busca global de projetos (UI — API já suporta via `?busca=`)

## Em Progresso
_(vazio)_

## Em Revisão
_(vazio)_

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
