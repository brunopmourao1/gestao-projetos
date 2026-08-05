# Backlog de Histórias de Usuário
**Produto:** Sistema de Gestão de Comissionamento e Projetos
**Fonte:** Requisitos Funcionais RF01–RF04 (`PRD.md`) e Fluxo de Estados (seção 3 do PRD)

Cada história referencia o requisito funcional de origem. Status inicial de todas as histórias: **Backlog** (ver `04-Acompanhamento/Board-Tarefas.md`).

## Épico 1 — Quadro Kanban (RF01)
### HU-01 — Visualizar projetos no board
Como **Gestor/Tech Lead**, quero visualizar todos os projetos organizados em colunas por status, para ter uma visão macro do quadro e identificar gargalos de produção.
**Critérios de aceite:**
* O board exibe as 5 colunas do fluxo: Aguardando Esquema Elétrico, Projeto Offline, Aguardando Montagem, Projeto Online, Operação Concluída.
* Cada coluna exibe todos os `ProjectCard` cujo `status_atual` corresponde à coluna.
* A coluna tem cor de destaque no cabeçalho conforme criticidade (ver `Matriz-Componentes.md`).

### HU-02 — Mover projeto entre colunas
Como **Programador**, quero mover um card de projeto para a próxima coluna do fluxo, para refletir o avanço real do comissionamento.
**Critérios de aceite:**
* A movimentação só é permitida entre colunas adjacentes do fluxo sequencial (não é possível pular etapas).
* Toda movimentação dispara o registro de histórico (ver HU-03).
* Movimentação para "Operação Concluída" só é permitida se `ValidacaoParametrosFisicos` passar (ver HU-08).

### HU-03 — Buscar projeto pelo nome
Como **Gestor/Tech Lead**, quero buscar uma máquina pelo nome na barra de busca global, para localizar rapidamente um projeto específico sem navegar por todas as colunas.
**Critérios de aceite:**
* Busca por `nome_maquina` (case-insensitive, busca parcial).
* Resultado destaca ou filtra o(s) card(s) correspondente(s) no board.

## Épico 2 — Histórico e Métricas de Tempo (RF02)
### HU-04 — Registrar histórico de transições
Como **Gestor/Tech Lead**, quero que toda mudança de coluna seja registrada com autor e data, para auditar o processo e calcular tempo de permanência por estágio.
**Critérios de aceite:**
* Cada transição grava `coluna_origem`, `coluna_destino` e `data_movimentacao` na tabela `Historico_Transicoes`.
* O histórico é visível na Aba 1 (Visão Geral) do `DetailsDrawer`.

### HU-05 — Calcular lead time por estágio
Como **Gestor/Tech Lead**, quero ver quanto tempo cada projeto permaneceu em cada coluna, para identificar gargalos de produção.
**Critérios de aceite:**
* `CalculoMetricasTempo` é acionado a cada mudança de coluna (ver `Arquitetura.md`).
* O tempo de permanência é calculado a partir do histórico de transições e exibido por projeto.

## Épico 3 — Parâmetros Técnicos (RF03)
### HU-06 — Preencher dados de motores
Como **Programador**, quero preencher RPM, fator de redução e diâmetro de engrenagem no cartão do projeto, para registrar as especificações técnicas da máquina.
**Critérios de aceite:**
* Formulário na Aba 2 (Parâmetros) do `DetailsDrawer` grava em `dados_motores` (JSON) na tabela `Especificacoes_Tecnicas`.
* Campos numéricos validados (não aceitam texto livre onde é esperado número).

### HU-07 — Preencher dados de sensores
Como **Programador**, quero registrar part numbers e calibragem dos sensores, para manter a rastreabilidade dos componentes usados na máquina.
**Critérios de aceite:**
* Formulário grava em `dados_sensores` (JSON) na tabela `Especificacoes_Tecnicas`.

### HU-08 — Validar parâmetros obrigatórios antes de concluir
Como **Gestor/Tech Lead**, quero que o sistema impeça a conclusão de um projeto sem os dados técnicos obrigatórios preenchidos, para garantir que nenhum equipamento seja entregue com documentação incompleta.
**Critérios de aceite:**
* `ValidacaoParametrosFisicos` verifica campos obrigatórios (configuração de hardware, ajustes de sensores) antes de permitir transição para "Operação Concluída".
* Se a validação falhar, o sistema bloqueia a transição e indica quais campos faltam.

## Épico 4 — Relatórios Executivos (RF04)
### HU-09 — Gerar relatório de apresentação
Como **Gestor/Tech Lead**, quero gerar um relatório/apresentação visual consolidada a partir dos dados do cartão ativo, para extrair relatórios gerenciais sem montagem manual.
**Critérios de aceite:**
* `MotorApresentacao` compila status, histórico e especificações técnicas do projeto selecionado.
* O preview do relatório é visível na Aba 3 (Relatório) do `DetailsDrawer` antes da exportação.
* Exportação é acionada pelo botão primário na `TopNavbar`.

## Priorização sugerida (para o Board-Tarefas)
1. HU-01, HU-02 (board funcional básico)
2. HU-06, HU-07 (captura de dados técnicos)
3. HU-04, HU-05 (histórico e métricas)
4. HU-08 (validação — depende de HU-06/HU-07 existirem)
5. HU-09 (relatório — depende de todos os dados acima existirem)
6. HU-03 (busca — incremento de usabilidade, não bloqueia fluxo principal)
