# Plano de Testes e QA

## 1. Estratégia geral
| Nível | Cobertura alvo | Ferramenta sugerida |
|---|---|---|
| Unitário | Sub-rotinas puras: `CalculoMetricasTempo` | Vitest/Jest |
| Integração | Endpoints da `Especificacao-API.md` contra banco de teste | Vitest/Jest + banco Neon de teste |
| E2E | Fluxo completo de transição de estado no board | Playwright |

## 2. Casos críticos de teste (derivados do PRD e da Arquitetura)

### Fluxo de estados
* Mover projeto entre colunas adjacentes deve suceder e gravar `Historico_Transicoes`.
* Tentar mover projeto pulando uma coluna (ex: de "Offline" direto para "Online") deve ser bloqueado (`TRANSICAO_INVALIDA`).

### Métricas de tempo
* `CalculoMetricasTempo` deve retornar tempo de permanência correto para um projeto com múltiplas transições conhecidas (caso de teste com timestamps fixos).

### Relatório
* `MotorApresentacao` deve incluir status atual e histórico resumido no payload gerado.
* Geração de relatório para projeto sem descrição/nome preenchidos deve tratar campos ausentes sem quebrar (exibir "não informado" ou equivalente).

### Board / UI
* Board renderiza corretamente projetos em todas as 5 colunas com dados reais.
* Busca global filtra corretamente por `nome_maquina` (parcial, case-insensitive).
* `DetailsDrawer` abre sem perder o contexto visual do board ao fundo (ocupação de 40% da tela, conforme `Matriz-Componentes.md`).

## 3. Checklist de validação antes de considerar uma fase "pronta"
* [ ] Todos os critérios de aceite das histórias da fase (`Backlog-Historias-Usuario.md`) verificados manualmente ou via teste automatizado.
* [ ] Nenhum erro no console do navegador durante o fluxo testado.
* [ ] Nenhuma regressão nas fases anteriores (smoke test rápido do fluxo ponta a ponta).
* [ ] Revisão de código aprovada pelo Gestor/Tech Lead (DoD, ver `Metodologia-Trabalho.md`).

## 4. Ambiente de testes
Banco Neon dedicado a testes (separado do banco de desenvolvimento/produção), para não poluir dados reais durante execução de testes de integração/E2E.
