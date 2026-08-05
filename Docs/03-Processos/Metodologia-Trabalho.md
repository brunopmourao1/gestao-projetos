# Metodologia de Trabalho do Time
**Escopo:** como o time de desenvolvimento constrói o sistema. Não confundir com o Kanban que é a *feature do produto* (ver `PRD.md`).

## 1. Abordagem: Kanban simples
Fluxo contínuo, sem sprints fixos nem cerimônias de planejamento por ciclo. Adequado para time pequeno (Gestor/Tech Lead + Programador(es)) com prioridades que podem mudar rapidamente.

## 2. Quadro de trabalho
Colunas do `Board-Tarefas.md` (ver `04-Acompanhamento/`):
1. **Backlog** — tarefas identificadas, ainda não iniciadas.
2. **Em Progresso** — tarefa sendo ativamente trabalhada.
3. **Em Revisão** — código/entrega pronta para revisão do Tech Lead.
4. **Feito** — revisado, aprovado e mesclado.

## 3. Limites de trabalho em progresso (WIP)
* Máximo de **2 tarefas** em "Em Progresso" por programador simultaneamente.
* Objetivo: evitar dispersão e garantir que tarefas cheguem a "Feito" antes de novas serem iniciadas.

## 4. Definição de Pronto (DoD)
Uma tarefa só vai para "Feito" quando:
* O código implementa o critério de aceite da história de usuário correspondente (`01-Produto/Backlog-Historias-Usuario.md`).
* Não quebra nenhuma rota/página existente (verificação manual mínima até haver suíte de testes automatizada — ver `Plano-Testes-QA.md`).
* Foi revisado por, no mínimo, o Gestor/Tech Lead.
* Está de acordo com as convenções descritas em `02-Tecnico/Guia-Setup-Ambiente.md`.

## 5. Papéis no fluxo
| Papel | Responsabilidade no quadro de trabalho |
|---|---|
| Programador | Move suas tarefas de Backlog → Em Progresso → Em Revisão |
| Gestor / Tech Lead | Revisa tarefas em "Em Revisão", move para "Feito" ou devolve com apontamentos, prioriza o Backlog |

## 6. Priorização do Backlog
Segue a ordem sugerida em `01-Produto/Backlog-Historias-Usuario.md` (seção "Priorização sugerida"), ajustável pelo Gestor/Tech Lead conforme dependências técnicas descobertas durante a implementação.

## 7. Cadência de acompanhamento
* Sem reuniões diárias obrigatórias (time pequeno, fluxo contínuo).
* Status report a cada marco de fase concluído (ver `Plano-Projeto-Cronograma.md` e `04-Acompanhamento/Status-Report-Template.md`).
* Ata registrada sempre que houver reunião de decisão (ver `04-Acompanhamento/Ata-Reunioes-Template.md`).
