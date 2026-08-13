# Matriz de Riscos, Premissas, Issues e Dependências (RAID Log)

## Riscos
| # | Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|---|
| R1 | ~~Dados técnicos incompletos travarem a transição para "Operação Concluída"~~ — **risco removido**: a funcionalidade de dados técnicos/parâmetros físicos (`ValidacaoParametrosFisicos`) foi eliminada do produto nesta sessão, não existe mais o bloqueio associado | — | — | N/A |
| R2 | Atraso da engenharia elétrica trava projetos indefinidamente na coluna "Aguardando Esquema Elétrico" | Alta | Baixo (é uma espera física esperada pelo processo) | Métrica de lead time (HU-05) torna o gargalo visível para o Gestor/Tech Lead agir fora do sistema |
| R3 | Migração dos dados das planilhas atuais para o novo sistema ser feita de forma incompleta ou inconsistente | Média | Alto | Definir processo de migração manual validado pelo Gestor/Tech Lead antes de descontinuar as planilhas |
| R4 | Time pequeno (Gestor/Tech Lead + Programador) sem capacidade de manter cadência de revisão de código, virando gargalo do próprio processo de desenvolvimento | Média | Médio | WIP limit de 2 tarefas por programador (`Metodologia-Trabalho.md`) para não acumular fila de revisão |
| R5 | Ausência de testes automatizados na v1 permitir regressões silenciosas | Média | Médio | Priorizar testes dos casos críticos listados em `Plano-Testes-QA.md`, mesmo que cobertura não seja 100% |
| R6 | ~~Login vulnerável a força bruta e sessão sem revogação individual~~ — **mitigado**: rate limiting por IP (5 tentativas/15min) e token de sessão aleatório revogável implementados nesta sessão (HU-23) | — | — | Ver `Especificacao-API.md`, seção Autenticação |
| R7 | Mudança futura em headers/CSP quebrar a hidratação do React sem ser percebida (só `curl` não detecta — precisa abrir no navegador) | Baixa | Alto (quebra o app inteiro em produção, silenciosamente) | Testar sempre no navegador real após mexer em `src/proxy.ts`/`next.config.ts`, conforme nota em `Guia-Setup-Ambiente.md` |

## Premissas
| # | Premissa |
|---|---|
| A1 | O time (Gestor/Tech Lead + Programador(es)) está disponível e engajado durante todo o desenvolvimento da v1 |
| A2 | A stack (Next.js + Neon via Vercel) permanece estável e não muda durante o desenvolvimento |
| A3 | O fluxo de 5 estados definido no PRD é suficiente para todos os tipos de máquina comissionados hoje |

## Issues (a resolver)
| # | Issue | Status |
|---|---|---|
| I1 | Definir processo formal de migração dos dados das planilhas existentes | Aberto |
| I2 | ~~Definir se haverá autenticação/controle de acesso na v1 ou se fica para uma v2~~ | **Resolvido** — HU-21 (login com senha única) implementada, endurecida em HU-23 (rate limiting, sessão revogável, headers de segurança) |

## Dependências
| # | Dependência | Descrição |
|---|---|---|
| D1 | Provisionamento do banco Neon via Vercel | Bloqueia toda a Fase 1 do cronograma |
| D2 | Disponibilidade da engenharia elétrica para fornecer esquemas | Bloqueia avanço de projetos reais para além da coluna 1, mas não bloqueia o desenvolvimento do sistema em si |
