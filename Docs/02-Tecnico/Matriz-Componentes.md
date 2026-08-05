# Matriz de Componentes Visuais (UI/UX)
**Diretriz:** Design modular, voltado para facilitar repaginação de interfaces e componentização reaproveitável. 

## 1. Estrutura Base
* **`LayoutContainer`**: O wrapper principal. Fixa o Header no topo e permite a rolagem horizontal da área de conteúdo (Board).
* **`TopNavbar`**: Contém o título do sistema, barra de busca global de máquinas e o botão primário de exportação de relatórios.

## 2. Componentes de Fluxo (Board)
* **`KanbanBoard`**: Componente pai que orquestra as listas.
* **`KanbanColumn`**: Coluna individual representando um status do fluxo. Recebe uma cor de destaque no cabeçalho indicando criticidade (ex: Vermelho para "Aguardando Montagem", Verde para "Projeto Online").
* **`ProjectCard`**: Componente clicável que exibe:
  * Nome do Projeto.
  * Avatar do responsável técnico.
  * Tags visuais de tecnologias envolvidas.

## 3. Componentes de Detalhamento
* **`DetailsDrawer`** (Modal Lateral): Abre ao clicar em um `ProjectCard`. Ocupa 40% da tela e não perde o contexto do Kanban ao fundo.
* **`TabNavigation`**: Navegação interna do modal.
  * *Aba 1 (Visão Geral):* Histórico e anexos de PDFs.
  * *Aba 2 (Parâmetros):* Inputs numéricos para entrada de dados de comissionamento físico.
  * *Aba 3 (Relatório):* Preview visual dos dados que serão enviados ao `MotorApresentacao`.