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
* Cada `ProjectCard` mostra o `numero` (ex: "OS 1800") como identificador principal — é como o time sempre se refere ao projeto na prática — com `nome_maquina` como informação secundária, se preenchido.

### HU-02 — Mover projeto entre colunas
Como **Programador**, quero arrastar o card de projeto para a coluna seguinte do fluxo, para refletir o avanço real do comissionamento.
**Critérios de aceite:**
* Interação por arrastar-e-soltar (drag-and-drop) — arrastar pra fora de uma coluna adjacente é bloqueado, o card volta pro lugar com mensagem de erro.
* A movimentação só é permitida entre colunas adjacentes do fluxo sequencial (não é possível pular etapas arrastando).
* Toda movimentação dispara o registro de histórico (ver HU-04).
* Movimentação para "Operação Concluída" só é permitida se `ValidacaoParametrosFisicos` passar (ver HU-08).
* Movimentação de "Projeto Offline" para "Aguardando Montagem" só é permitida se o `ChecklistOffline` estiver 100% concluído (ver HU-15).

### HU-11 — Editar projeto
Como **Gestor/Tech Lead**, quero corrigir o número, nome da máquina ou descrição de um projeto já criado, para consertar erros de digitação sem precisar recriar o projeto.
**Critérios de aceite:**
* Botão "Editar" no cabeçalho do `DetailsDrawer`, abre um formulário pré-preenchido com os valores atuais.
* Os campos (número, nome da máquina, descrição e data prevista de conclusão da etapa atual) são editáveis, incluindo o número — com a mesma validação de unicidade da criação (HU-10).
* Card e drawer refletem a mudança imediatamente, sem recarregar a página.

### HU-12 — Priorizar projetos dentro da coluna
Como **Gestor/Tech Lead**, quero reordenar os cards dentro de uma mesma coluna arrastando, para indicar qual projeto é mais crítico e deve sair primeiro daquele estágio.
**Critérios de aceite:**
* Arrastar um card pra qualquer posição dentro da mesma coluna reordena a lista — o card mais acima é o mais crítico/prioritário.
* A ordem é persistida (salva no banco) — todo mundo que abrir o board vê a mesma prioridade, mesmo depois de recarregar.
* Um projeto novo sempre entra no fim da coluna "Aguardando Esquema Elétrico" (menor prioridade até alguém reordenar manualmente).

### HU-13 — Excluir projeto
Como **Gestor/Tech Lead**, quero excluir um projeto cadastrado por engano ou que não faz mais sentido acompanhar, para manter o board limpo.
**Critérios de aceite:**
* Botão "Excluir" no cabeçalho do `DetailsDrawer`, ao lado de "Editar".
* Ação irreversível — exige confirmação explícita antes de efetivar.
* Excluir um projeto remove também suas especificações técnicas e histórico de transições associados.

### HU-14 — Definir e cobrar prazo da etapa atual
Como **Gestor/Tech Lead**, quero atrelar uma data prevista de conclusão à etapa em que o projeto está agora, para conseguir cobrar e verificar na data se aquela etapa está realmente pronta para avançar.
**Critérios de aceite:**
* O formulário de criar projeto (HU-10) e o de editar (HU-11) têm um campo opcional "Data Prevista de Conclusão", referente à etapa atual do projeto — não uma data fixa do projeto inteiro.
* Ao mover um card para uma coluna nova (HU-02), o movimento é efetivado na hora e, em seguida, abre automaticamente um diálogo pedindo a data prevista da etapa recém-iniciada; pode ser pulado sem preencher e editado depois.
* Um card cuja data prevista já passou sem o projeto ter avançado de etapa é destacado visualmente (vermelho) no board e no `DetailsDrawer`.

### HU-03 — Buscar projeto pelo número ou nome
Como **Gestor/Tech Lead**, quero buscar um projeto pelo número da OS (ou pelo nome da máquina) na barra de busca global, para localizar rapidamente um projeto específico sem navegar por todas as colunas.
**Critérios de aceite:**
* Busca por `numero` OU `nome_maquina` (case-insensitive, busca parcial) — como projetos são sempre identificados pelo número na prática (ex: "OS 1800"), a busca precisa cobrir esse campo.
* Resultado destaca ou filtra o(s) card(s) correspondente(s) no board.

### HU-10 — Criar novo projeto
Como **Gestor/Tech Lead**, quero cadastrar um novo projeto no sistema a partir de qualquer tela do board, para começar a acompanhar seu comissionamento desde o início do fluxo.
**Critérios de aceite:**
* Botão "Novo Projeto" acessível a partir da `TopNavbar`, independente da coluna que a pessoa está vendo.
* Formulário pede o número da OS (obrigatório, único no sistema — ex: "OS 1800"), nome da máquina (opcional), descrição (opcional) e data prevista de conclusão da etapa inicial (opcional); status inicial sempre `Esquema_Eletrico`.
* Tentar cadastrar um número já existente é bloqueado com mensagem clara.
* Projeto criado aparece imediatamente na coluna "Aguardando Esquema Elétrico" sem precisar recarregar a página.

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

### HU-15 — Checklist de sub-etapas da fase Offline
Como **Programador**, quero marcar quais sub-etapas do trabalho offline já concluí (Hardware, Lógica das FC's e FB's, IHM, Segurança), para saber quanto falta e não avançar o projeto incompleto para a montagem física.
**Critérios de aceite:**
* Aba "Progresso" no `DetailsDrawer` (compartilhada com HU-17: mostra o checklist na fase Offline, o progresso manual na fase Montagem) com 4 itens, sempre na mesma ordem: Hardware → Lógica (FC's e FB's) → IHM → Segurança (tipicamente um PLC de segurança separado do PLC principal, geralmente Siemens).
* Cada item é um checkbox binário (feito/não feito); cada um vale 25% do total. Marcar/desmarcar salva imediatamente.
* O `ProjectCard` mostra uma barra de progresso com o percentual quando o projeto está na coluna "Projeto Offline".
* Tentar mover o card de "Projeto Offline" para "Aguardando Montagem" com menos de 100% é bloqueado, com mensagem indicando quais sub-etapas faltam (mesmo padrão de bloqueio de HU-08).

### HU-16 — Observações gerais do projeto
Como **Gestor/Tech Lead** ou **Programador**, quero registrar observações livres sobre o projeto (pendências, definições em aberto, algo faltando), para não perder esse contexto entre uma fase e outra.
**Critérios de aceite:**
* Campo de texto livre "Observações" na Aba 1 (Visão Geral) do `DetailsDrawer`, com botão de salvar próprio.
* É uma nota única e editável (não um log com histórico) — sobrescreve o valor anterior ao salvar.
* Visível e editável em qualquer fase do projeto, não só na "Projeto Offline".

### HU-17 — Progresso manual da fase Montagem
Como **Gestor/Tech Lead**, quero ajustar manualmente o percentual de andamento da montagem física da máquina, conforme vou recebendo informação em reunião, para ter uma noção visual do progresso mesmo sem um checklist formal (a montagem física não é controlada diretamente pelo sistema).
**Critérios de aceite:**
* Aba "Progresso" no `DetailsDrawer` (mesma aba de HU-15) mostra, quando o projeto está em "Aguardando Montagem", um slider de 0% a 100% em passos de 5%.
* Ajuste do slider salva imediatamente, sem botão "Salvar" — sem checklist, sem sub-etapas.
* Diferente de HU-15: **não há bloqueio** de avanço para "Projeto Online" baseado nesse percentual, em nenhum valor.
* O `ProjectCard` mostra a barra de progresso com esse percentual quando o projeto está na coluna "Aguardando Montagem", mesmo estilo visual usado para a fase Offline (HU-15).

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
