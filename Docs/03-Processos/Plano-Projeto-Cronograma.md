# Plano de Projeto / Cronograma por Fases
**Abordagem:** fases sequenciais com marcos de entrega, compatíveis com fluxo contínuo (Kanban) — sem datas fixas rígidas, mas com ordem de dependência clara.

> **Nota histórica:** este é o plano original de kickoff do projeto. A Fase 3 (Parâmetros Técnicos/`Especificacoes_Tecnicas`) e a validação `ValidacaoParametrosFisicos` da Fase 4, descritas abaixo, foram implementadas conforme planejado e depois **removidas por completo** numa sessão posterior a pedido do usuário — não fazem mais parte do produto. A execução real, sessão a sessão, está registrada em `04-Acompanhamento/Board-Tarefas.md`, que é a fonte de verdade atual sobre o que existe no sistema.

## Fase 1 — Fundação: Schema + API
**Objetivo:** ter o modelo de dados e os endpoints centrais funcionando, sem UI final.
* Provisionar banco Neon e aplicar schema (`Projetos`, `Especificacoes_Tecnicas`, `Historico_Transicoes` — ver `02-Tecnico/Modelo-Dados-ER.md`).
* Implementar endpoints de `02-Tecnico/Especificacao-API.md`: CRUD de projetos, transição de status, especificações técnicas.
* **Marco:** criar, listar e mover um projeto entre status via API (sem tela).

## Fase 2 — Board Kanban
**Objetivo:** visualização funcional do fluxo (HU-01, HU-02).
* `LayoutContainer`, `TopNavbar`, `KanbanBoard`, `KanbanColumn`, `ProjectCard` (ver `Matriz-Componentes.md`).
* Drag-and-drop ou ação equivalente para mover card entre colunas adjacentes.
* **Marco:** board renderiza projetos reais do banco e permite movimentação básica.

## Fase 3 — Drawer de Detalhes e Parâmetros Técnicos
**Objetivo:** captura de dados técnicos (HU-06, HU-07).
* `DetailsDrawer` com `TabNavigation` (Aba 1 e Aba 2).
* Formulários de motores e sensores gravando em `Especificacoes_Tecnicas`.
* **Marco:** Programador consegue preencher todos os parâmetros técnicos de um projeto pelo drawer.

## Fase 4 — Histórico, Métricas e Validação
**Objetivo:** rastreabilidade e regras de negócio (HU-04, HU-05, HU-08).
* `CalculoMetricasTempo` acionado a cada transição.
* `ValidacaoParametrosFisicos` bloqueando transição para "Operação Concluída" com dados incompletos.
* Exibição de histórico e lead time na Aba 1.
* **Marco:** não é possível concluir um projeto sem dados obrigatórios; lead time visível por projeto.

## Fase 5 — Motor de Apresentação
**Objetivo:** relatório executivo (HU-09).
* `MotorApresentacao` compilando dados do projeto.
* Aba 3 (Relatório) com preview.
* Exportação via botão na `TopNavbar`.
* **Marco:** Gestor/Tech Lead gera um relatório executivo real a partir de um projeto concluído.

## Fase 6 — Hardening e QA
**Objetivo:** estabilidade antes de considerar a v1 pronta para uso contínuo pelo time.
* Testes conforme `Plano-Testes-QA.md`.
* Revisão de acessibilidade/usabilidade do board e do drawer.
* Busca global (HU-03), se ainda não implementada.
* **Marco:** v1 aprovada pelo Gestor/Tech Lead para substituir as planilhas em uso real.

## Dependências entre fases
Fase 1 bloqueia todas as demais. Fase 2 bloqueia Fase 3. Fase 3 bloqueia Fase 4 (validação depende dos dados existirem) e Fase 5 (relatório depende dos dados existirem). Fase 6 depende de todas as anteriores.
