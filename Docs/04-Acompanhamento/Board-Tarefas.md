# Board de Tarefas do Time de Desenvolvimento
**Metodologia:** Kanban simples (ver `03-Processos/Metodologia-Trabalho.md`). Este documento é vivo — atualizar a cada sessão de trabalho movendo as tarefas entre as colunas.

## Backlog
Tarefas técnicas derivadas de `01-Produto/Backlog-Historias-Usuario.md`, na ordem de priorização sugerida (Fase 1 do cronograma primeiro):

- [ ] Provisionar banco Neon e aplicar schema inicial (`Projetos`, `Especificacoes_Tecnicas`, `Historico_Transicoes`)
- [ ] Implementar `GET/POST /api/projetos`
- [ ] Implementar `PATCH /api/projetos/:id/status` com validação de transição sequencial
- [ ] Implementar `PUT /api/projetos/:id/especificacoes`
- [ ] HU-01 — Componente `KanbanBoard` + `KanbanColumn` renderizando dados reais
- [ ] HU-02 — Ação de mover `ProjectCard` entre colunas adjacentes
- [ ] HU-06 — Formulário de dados de motores (Aba 2 do Drawer)
- [ ] HU-07 — Formulário de dados de sensores (Aba 2 do Drawer)
- [ ] HU-04 — Exibir histórico de transições (Aba 1 do Drawer)
- [ ] HU-05 — Cálculo e exibição de lead time por estágio
- [ ] HU-08 — Bloqueio de transição para "Concluído" sem parâmetros obrigatórios
- [ ] HU-09 — `MotorApresentacao` + preview na Aba 3 + exportação
- [ ] HU-03 — Busca global de projetos

## Em Progresso
_(vazio — nenhuma tarefa iniciada ainda)_

## Em Revisão
_(vazio)_

## Feito
_(vazio)_
