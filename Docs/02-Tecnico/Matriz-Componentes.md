# Matriz de Componentes Visuais (UI/UX)
**Diretriz:** Design modular, voltado para facilitar repaginação de interfaces e componentização reaproveitável. 

## 1. Estrutura Base
* **`LayoutContainer`**: O wrapper principal. Fixa o Header no topo e permite a rolagem horizontal da área de conteúdo (Board).
* **`TopNavbar`**: Contém o título do sistema, barra de busca global de máquinas, o botão "Novo Projeto" (abre `NovoProjetoDialog`, formulário mínimo só com nome da máquina) e o botão primário de exportação de relatórios.

## 2. Componentes de Fluxo (Board)
* **`KanbanBoard`**: Componente pai que orquestra as listas.
* **`KanbanColumn`**: Coluna individual representando um status do fluxo. Recebe uma cor de destaque no cabeçalho indicando criticidade (ex: Vermelho para "Aguardando Montagem", Verde para "Projeto Online").
* **`ProjectCard`**: Componente clicável que exibe:
  * Número (OS) e nome da máquina.
  * Prazo da etapa atual (destacado em vermelho se atrasado).
  * Barra de progresso + percentual, só quando o projeto está em "Projeto Offline" (do `checklistOffline`) ou "Aguardando Montagem" (do `percentualMontagem`) — ver HU-15/HU-17.
  * Avatar do responsável técnico.
  * Tags visuais de tecnologias envolvidas.

## 3. Componentes de Detalhamento
* **`DetailsDrawer`** (Modal Lateral): Abre ao clicar em um `ProjectCard`. Ocupa 40% da tela e não perde o contexto do Kanban ao fundo.
* **`TabNavigation`**: Navegação interna do modal.
  * *Aba 1 (Visão Geral):* Descrição, campo de observações gerais (`ObservacoesForm`, HU-16), data prevista de conclusão da etapa atual, tempo por estágio e histórico de transições.
  * *Aba 2 (Progresso):* Adaptativa por fase — `ChecklistOfflineForm` (4 sub-etapas, HU-15) quando o projeto está em "Projeto Offline"; `PercentualMontagemForm` (slider manual, HU-17) quando está em "Aguardando Montagem"; mensagem neutra nas demais fases.
  * *Aba 3 (Parâmetros):* Inputs numéricos para entrada de dados de comissionamento físico.
  * *Aba 4 (Relatório):* Preview visual dos dados que serão enviados ao `MotorApresentacao`.