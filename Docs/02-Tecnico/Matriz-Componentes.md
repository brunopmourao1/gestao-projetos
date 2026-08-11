# Matriz de Componentes Visuais (UI/UX)
**Diretriz:** Design modular, voltado para facilitar repaginação de interfaces e componentização reaproveitável. 

## 1. Estrutura Base
* **`LayoutContainer`**: O wrapper principal. Fixa o Header no topo e permite a rolagem horizontal da área de conteúdo (Board).
* **`TopNavbar`**: Contém o logo da LS Control (`public/Logomarca LS.jpg`) + título "Bruno Mourão - Gestão de Projeto" (branding, sessão desta feature grande), barra de busca global de máquinas, o botão "Novo Projeto" (abre `NovoProjetoDialog`, formulário mínimo só com nome da máquina), o link/ícone de Configurações (`/configuracoes/checklist`, HU-20) e o botão primário de exportação de relatórios.

## 2. Componentes de Fluxo (Board)
* **`KanbanBoard`**: Componente pai que orquestra as listas.
* **`KanbanColumn`**: Coluna individual representando um status do fluxo. Recebe uma cor de destaque no cabeçalho indicando criticidade (ex: Vermelho para "Aguardando Montagem", Verde para "Projeto Online").
* **`ProjectCard`**: Componente clicável que exibe:
  * Número (OS) e nome da máquina.
  * Prazo da etapa atual (destacado em vermelho se atrasado).
  * Barra de progresso + percentual, só quando o projeto está em "Projeto Offline" (do `checklistOffline`), "Aguardando Montagem" (do `percentualMontagem`) ou "Projeto Online" (do `checklistOnline`) — ver HU-15/HU-17/HU-18. O percentual do checklist é calculado dinamicamente (`100/N`, N = itens configurados da fase, ver HU-20), não mais fixo em 25%/item.
  * Avatar do responsável técnico.
  * Tags visuais de tecnologias envolvidas.

## 3. Componentes de Detalhamento
* **`DetailsDrawer`** (Modal Lateral): Abre ao clicar em um `ProjectCard`. Ocupa 40% da tela e não perde o contexto do Kanban ao fundo.
* **`TabNavigation`**: Navegação interna do modal.
  * *Aba 1 (Visão Geral):* Descrição, campo de observações gerais (`ObservacoesForm`, HU-16), data prevista de conclusão da etapa atual, tempo por estágio e histórico de transições.
  * *Aba 2 (Progresso):* Adaptativa por fase — `ChecklistForm` (componente único parametrizado por `fase`, HU-20) quando o projeto está em "Projeto Offline" (`fase="Offline"`) ou "Projeto Online" (`fase="Online"`), busca os itens configurados via `GET /configuracoes/checklist` ao montar; `PercentualMontagemForm` (slider manual, HU-17) quando está em "Aguardando Montagem"; mensagem neutra nas demais fases.
  * *Aba 3 (Pendências):* `PendenciasForm` (HU-19) — log de pendências de visitas técnicas (textarea + lista cronológica) quando o projeto está em "Tryout com o Cliente" ou "Máquina Entregue"; mensagem neutra nas demais fases.
  * *Aba 4 (Relatório):* Preview visual dos dados que serão enviados ao `MotorApresentacao`.

## 4. Configurações
* **`ChecklistConfigManager`** (`/configuracoes/checklist`): duas listas lado a lado (Offline/Online), cada uma mostrando os itens configurados com edição inline do rótulo e exclusão com confirmação em duas etapas, mais um formulário de adicionar item no final. Mostra o percentual por item (`100/N`) recalculado em tempo real conforme itens são adicionados/removidos. Ver HU-20.

> **Nota histórica:** existia uma "Aba 3 (Parâmetros)" com inputs de dados de motores/sensores/esquema elétrico — removida por completo nesta sessão (ver HU-06/HU-07/HU-08 em `Backlog-Historias-Usuario.md`, marcadas como removidas). Também existiam `ChecklistOfflineForm`/`ChecklistOnlineForm` como componentes separados com itens fixos — unificados em `ChecklistForm` (HU-20).