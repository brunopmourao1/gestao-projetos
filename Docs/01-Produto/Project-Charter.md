# Termo de Abertura do Projeto (Project Charter)
**Produto:** Sistema de Gestão de Comissionamento e Projetos
**Data:** Agosto 2026
**Status:** Em planejamento

## 1. Justificativa / Problema de Negócio
O controle atual do ciclo de vida de comissionamento de máquinas industriais é feito em planilhas. Isso gera:
* Falta de rastreabilidade sobre quem moveu um projeto de uma fase para outra e quando.
* Dificuldade de identificar gargalos entre as equipes de elétrica, programação e montagem mecânica.
* Retrabalho manual para montar apresentações executivas a partir de dados dispersos.
* Risco de um equipamento avançar para "Operação Concluída" sem que todos os parâmetros técnicos obrigatórios tenham sido validados.

## 2. Objetivo do Projeto
Substituir as planilhas por um sistema visual (Kanban customizado) que padronize a transição entre equipes, registre histórico de movimentação para cálculo de lead time, e gere relatórios/apresentações executivas de forma automatizada.

## 3. Sponsors e Stakeholders
| Papel | Responsabilidade no projeto |
|---|---|
| Gestor / Tech Lead | Sponsor do produto, define prioridades, aprova critérios de "pronto", consome relatórios executivos |
| Programador | Usuário operacional, atualiza status e preenche parâmetros técnicos das máquinas |
| Equipe de Engenharia Elétrica | Fornece o esquema elétrico que libera a fase "Projeto Offline" (não é usuário direto do sistema na v1) |
| Equipe de Montagem Mecânica | Executa a fase física "Aguardando Montagem" (não é usuário direto do sistema na v1) |

## 4. Escopo

### Dentro do escopo (v1)
* Quadro Kanban com as 5 colunas do fluxo de estado (ver `PRD.md`, seção 3).
* Histórico de transições de coluna (quem moveu e quando).
* Cartão de projeto com formulário técnico (RPM, fatores de redução, part numbers de sensores).
* Motor de geração de relatório/apresentação a partir dos dados do cartão ativo.
* Validação obrigatória de parâmetros físicos antes de permitir a transição para "Operação Concluída".

### Fora do escopo (v1)
* Integração automática com sistemas de engenharia elétrica (o esquema elétrico é anexado manualmente via link/URL).
* Notificações automáticas (e-mail, push) sobre mudanças de status.
* Múltiplos boards/times (v1 assume um único board consolidado).
* Controle de acesso granular por permissão (papéis são lógicos, não necessariamente enforced via autenticação avançada na v1).

## 5. Critérios de Sucesso
* 100% dos projetos ativos migrados das planilhas para o Kanban.
* Lead time por estágio calculável automaticamente para qualquer projeto (RF02).
* Geração de relatório executivo em menos de 1 minuto, sem montagem manual.
* ~~Zero projetos chegando a "Operação Concluída" sem os parâmetros obrigatórios preenchidos~~ — critério removido: a funcionalidade de parâmetros técnicos/`ValidacaoParametrosFisicos` e a própria coluna "Operação Concluída" (agora "Tryout com o Cliente"/"Máquina Entregue") não existem mais no produto, ver `Arquitetura.md`.

## 6. Premissas
* O time (Gestor/Tech Lead + Programador(es)) já está definido e disponível para uso e feedback contínuo do sistema.
* A stack técnica (Next.js + banco serverless Postgres/Neon na Vercel) está definida e aprovada.
* Os dados de projetos existentes nas planilhas atuais poderão ser migrados manualmente ou via importação simples.

## 7. Restrições
* O sistema deve operar em banco de dados serverless moderno (requisito de arquitetura, ver `Arquitetura.md`).
* O fluxo de estados é sequencial e fixo — não há suporte, na v1, para fluxos paralelos ou customizáveis por tipo de máquina.

## 8. Metodologia de Execução
O time interno de desenvolvimento seguirá **Kanban simples** (fluxo contínuo, sem sprints fixos) — ver detalhes em `03-Processos/Metodologia-Trabalho.md`.
