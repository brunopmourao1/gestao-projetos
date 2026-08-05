# Glossário de Termos
**Objetivo:** alinhar linguagem entre time técnico (desenvolvimento) e domínio industrial (elétrica, programação de máquina, montagem mecânica).

## Termos de Domínio Industrial
| Termo | Definição |
|---|---|
| **Comissionamento** | Processo de colocar uma máquina em operação, validando funcionamento, segurança e parâmetros dinâmicos após a instalação física. |
| **Esquema Elétrico** | Documento técnico produzido pela engenharia elétrica que define a fiação, componentes e ligações da máquina; pré-requisito para iniciar a programação offline. |
| **Mapeamento de I/O** | Processo de definir quais entradas (sensores, botões) e saídas (motores, atuadores) físicas correspondem a quais variáveis no código de controle da máquina. |
| **Código Offline** | Lógica de controle da máquina desenvolvida e simulada em ambiente de desenvolvimento, antes de ser descarregada na máquina física. |
| **Descarregar código** | Ato de transferir o programa de controle do ambiente de desenvolvimento para o CLP/controlador físico da máquina. |
| **RPM** | Rotações Por Minuto — unidade de velocidade angular de um motor. |
| **Fator de Redução** | Razão entre a velocidade de entrada e saída de uma caixa de redução/engrenagem, usada para calcular torque e velocidade efetivos. |
| **Part Number** | Código de identificação único de um componente (ex: sensor) usado para rastreabilidade e recompra. |
| **Calibragem** | Processo de ajuste de um sensor para garantir que sua leitura corresponda ao valor físico real medido. |
| **Sintonia de Parâmetros Dinâmicos** | Ajuste fino de parâmetros de controle (ex: PID) durante o comissionamento, para que a máquina opere de forma estável e precisa. |

## Termos do Sistema (Produto)
| Termo | Definição |
|---|---|
| **Lead Time** | Tempo total que um projeto permanece em um determinado estágio (coluna) do fluxo, calculado a partir do histórico de transições. |
| **Card / ProjectCard** | Unidade visual no Kanban que representa um projeto de máquina individual. |
| **Board** | Quadro Kanban completo, contendo todas as colunas e cards. |
| **Drawer (DetailsDrawer)** | Painel lateral modal que exibe o detalhamento de um projeto ao clicar em seu card. |
| **Motor de Apresentação** | Rotina do sistema que compila dados técnicos e status de um projeto em um relatório executivo exportável. |
| **Status Atual (status_atual)** | Campo que indica em qual das 5 colunas do fluxo o projeto se encontra atualmente. |

## Termos Técnicos (Arquitetura)
| Termo | Definição |
|---|---|
| **Rotina** | Unidade de orquestração de responsabilidade única no sistema (ex: `GerenciadorEstadoBoard`). |
| **Sub-rotina** | Unidade de execução acionada por uma rotina principal, focada em uma tarefa específica (ex: `CalculoMetricasTempo`). |
| **Serverless (banco de dados)** | Modelo de banco de dados gerenciado que escala automaticamente sem provisionamento manual de servidor (ex: Neon/Postgres na Vercel). |
