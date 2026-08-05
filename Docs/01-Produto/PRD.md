# Product Requirements Document (PRD)
**Produto:** Sistema de Gestão de Comissionamento e Projetos
**Data:** Agosto 2026

## 1. Visão Geral
O sistema substituirá as atuais planilhas de controle por um fluxo visual (Kanban customizado) projetado para gerenciar o ciclo de vida completo do desenvolvimento e comissionamento de máquinas industriais. O objetivo é garantir rastreabilidade, padronizar a transição entre equipes (elétrica, programação, montagem mecânica) e gerar apresentações executivas automatizadas.

## 2. Atores (Usuários)
* **Gestor / Tech Lead:** Possui visão macro do quadro, identifica gargalos de produção, audita o preenchimento técnico e extrai relatórios/apresentações gerenciais.
* **Programador:** Atua no nível micro, atualizando o status do projeto, anexando documentações e preenchendo os parâmetros técnicos da máquina.

## 3. Fluxo de Estados (Jornada do Projeto)
Todo projeto de máquina deve obedecer ao seguinte ciclo sequencial:
1. **Aguardando Esquema Elétrico:** O projeto está paralisado aguardando liberação da engenharia elétrica.
2. **Projeto Offline:** Início da estruturação da lógica, mapeamento de I/O e simulação de hardware no ambiente de desenvolvimento.
3. **Aguardando Montagem:** O código offline está concluído. A máquina encontra-se em montagem mecânica/elétrica (espera física).
4. **Projeto Online (Comissionamento):** Código descarregado na máquina. Fase de testes de I/O, segurança e sintonia de parâmetros dinâmicos.
5. **Operação Concluída:** Equipamento validado e entregue.

## 4. Requisitos Funcionais
* **RF01:** O sistema deve permitir a visualização de todos os projetos em um quadro Kanban.
* **RF02:** O sistema deve registrar o histórico de transições de colunas (quem moveu e quando) para cálculo de tempo (Lead Time).
* **RF03:** O sistema deve possuir formulários internos nos cartões para registro de variáveis técnicas (RPM, fatores de redução, part numbers de sensores).
* **RF04:** O sistema deve compilar os dados do cartão ativo e gerar um relatório/apresentação visual consolidada (Motor de Apresentação).