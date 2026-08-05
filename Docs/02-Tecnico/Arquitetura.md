# Documentação de Arquitetura e Modelagem
**Projeto:** Sistema de Gestão de Comissionamento

## 1. Arquitetura Lógica
O sistema é dividido em rotinas e sub-rotinas focadas em responsabilidade única, garantindo isolamento de problemas e facilidade de manutenção.

### 1.1. Rotinas Principais (Orquestração)
* `GerenciadorEstadoBoard`: Responsável por consultar a base de dados e renderizar os projetos nas colunas corretas.
* `MotorApresentacao`: Rotina de compilação que captura os dados técnicos e o status do projeto para montar e exportar o relatório executivo.

### 1.2. Sub-rotinas (Execução Micro)
* `CalculoMetricasTempo`: Sub-rotina acionada a cada mudança de coluna para calcular o tempo de permanência em cada estágio de montagem.
* `ValidacaoParametrosFisicos`: Sub-rotina que verifica se os dados obrigatórios (ex: configuração de hardware, ajustes de sensores) foram preenchidos antes de permitir a transição para "Operação Concluída".

## 2. Modelagem de Dados
Estrutura relacional pensada para operar em bancos de dados serverless modernos.

**Tabela: `Projetos`**
* `id_projeto` (UUID)
* `nome_maquina` (String)
* `status_atual` (Enum: Esquema_Eletrico, Offline, Montagem, Online, Concluido)
* `data_criacao` (Timestamp)

**Tabela: `Especificacoes_Tecnicas`**
* `id_especificacao` (UUID)
* `id_projeto` (UUID - FK)
* `link_esquema_eletrico` (URL)
* `dados_motores` (JSON - Contendo RPM, fator_reducao, diametro_engrenagem)
* `dados_sensores` (JSON - Contendo part_numbers e calibragem)

**Tabela: `Historico_Transicoes`**
* `id_transicao` (UUID)
* `id_projeto` (UUID - FK)
* `coluna_origem` (String)
* `coluna_destino` (String)
* `data_movimentacao` (Timestamp)