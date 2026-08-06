# Especificação de API
**Base:** rotas derivadas das rotinas descritas em `Arquitetura.md` (`GerenciadorEstadoBoard`, `MotorApresentacao`, `CalculoMetricasTempo`, `ValidacaoParametrosFisicos`).
**Formato:** REST sobre JSON. Todas as respostas de erro seguem `{ "erro": { "codigo": string, "mensagem": string } }`.

## Projetos

### `GET /api/projetos`
Lista todos os projetos, usado por `GerenciadorEstadoBoard` para renderizar o board.
**Query params opcionais:** `status` (filtra por `status_atual`), `busca` (busca parcial em `numero` OU `nome_maquina` — na prática, projetos são sempre identificados pelo número, ex: "OS 1800").
**Resposta 200:**
```json
[
  {
    "id_projeto": "uuid",
    "numero": "string",
    "nome_maquina": "string | null",
    "descricao": "string | null",
    "ordem": "number",
    "data_prevista_conclusao": "date | null",
    "status_atual": "Esquema_Eletrico | Offline | Montagem | Online | Concluido",
    "data_criacao": "timestamp"
  }
]
```

### `POST /api/projetos`
Cria um novo projeto. Status inicial sempre `Esquema_Eletrico`. `ordem` é calculada automaticamente (fim da coluna `Esquema_Eletrico`) — não é um campo de entrada.
**Body:** `{ "numero": "string (obrigatório, único)", "nome_maquina": "string (opcional)", "descricao": "string (opcional)", "data_prevista_conclusao": "date (opcional)" }` — `data_prevista_conclusao` é a data prevista de conclusão da etapa inicial (Esquema Elétrico).
**Resposta 201:** objeto do projeto criado.
**Resposta 409** (`VALIDACAO_CAMPO`): já existe um projeto com o mesmo `numero`.

### `PATCH /api/projetos/:id`
Edita `numero`/`nome_maquina`/`descricao`/`data_prevista_conclusao` de um projeto existente. Todos os campos são substituição total (omitir `data_prevista_conclusao` limpa o valor, igual aos demais campos deste endpoint).
**Body:** igual ao `POST` (mesma validação, incluindo unicidade de `numero`).
**Resposta 200:** objeto do projeto atualizado.
**Resposta 409** (`VALIDACAO_CAMPO`): já existe outro projeto com o `numero` informado.

### `DELETE /api/projetos/:id`
Exclui o projeto permanentemente. Especificações técnicas e histórico de transições são removidos em cascata (FK `ON DELETE CASCADE`).
**Resposta 200:** `{ "ok": true }`
**Resposta 404** (`PROJETO_NAO_ENCONTRADO`).

### `GET /api/projetos/:id`
Retorna detalhes de um projeto, incluindo especificações técnicas associadas (usado ao abrir o `DetailsDrawer`).
**Resposta 200:**
```json
{
  "id_projeto": "uuid",
  "numero": "string",
  "nome_maquina": "string | null",
  "descricao": "string | null",
  "ordem": "number",
  "status_atual": "string",
  "data_criacao": "timestamp",
  "especificacoes_tecnicas": { "...": "ver Especificacoes_Tecnicas" },
  "historico_transicoes": [ "...ver Historico_Transicoes" ]
}
```

### `PATCH /api/projetos/:id/status`
Move o projeto para uma coluna adjacente (arrastar o card, ver HU-02). Aciona `CalculoMetricasTempo` e grava em `Historico_Transicoes`. Se o destino for `Concluido`, aciona `ValidacaoParametrosFisicos` antes de efetivar.
**Body:** `{ "novo_status": "string", "ordem": "number (opcional)" }` — `ordem` posiciona o card no ponto exato onde foi solto na coluna de destino; se omitido, mantém a `ordem` atual.
**Resposta 200:** projeto atualizado.
**Resposta 422** (`PARAMETROS_INCOMPLETOS`): quando a transição para `Concluido` é bloqueada por dados obrigatórios ausentes. O corpo do erro lista os campos faltantes.
**Resposta 400** (`TRANSICAO_INVALIDA`): quando o `novo_status` não é adjacente ao `status_atual` no fluxo sequencial.

### `PATCH /api/projetos/:id/ordem`
Reordena o projeto dentro da mesma coluna (prioridade manual). Não altera `status_atual` nem grava histórico — reordenar não é uma transição de estado.
**Body:** `{ "ordem": "number" }`
**Resposta 200:** projeto atualizado.

### `PATCH /api/projetos/:id/data-prevista`
Define ou limpa a data prevista de conclusão da **etapa atual** do projeto, sem precisar reenviar `numero`/`nome_maquina`/`descricao`. Aberto automaticamente pela UI logo após mover um card para uma coluna nova (drag-and-drop) — o preenchimento é opcional e pode ser feito depois.
**Body:** `{ "data_prevista_conclusao": "date | null" }`
**Resposta 200:** projeto atualizado.

## Especificações Técnicas

### `PUT /api/projetos/:id/especificacoes`
Cria ou atualiza os dados técnicos do projeto (Aba 2 — Parâmetros). Idempotente.
**Body:**
```json
{
  "link_esquema_eletrico": "url",
  "dados_motores": { "rpm": "number", "fator_reducao": "number", "diametro_engrenagem": "number" },
  "dados_sensores": { "part_numbers": ["string"], "calibragem": "object" }
}
```
**Resposta 200:** especificações atualizadas.

## Histórico

### `GET /api/projetos/:id/historico`
Retorna a lista de transições do projeto, usada na Aba 1 (Visão Geral) e para cálculo de lead time.
**Resposta 200:**
```json
[
  {
    "id_transicao": "uuid",
    "coluna_origem": "string",
    "coluna_destino": "string",
    "data_movimentacao": "timestamp"
  }
]
```

### `GET /api/projetos/:id/metricas-tempo`
Retorna o tempo de permanência (lead time) calculado por estágio para o projeto.
**Resposta 200:**
```json
{ "por_estagio": [ { "coluna": "string", "tempo_permanencia_horas": "number" } ] }
```

## Relatório

### `GET /api/projetos/:id/relatorio`
Aciona `MotorApresentacao`. Retorna os dados compilados para o preview da Aba 3 (Relatório).
**Resposta 200:** payload estruturado com status, histórico resumido e especificações técnicas, pronto para renderização/exportação.

### `POST /api/projetos/:id/relatorio/exportar`
Gera o arquivo de exportação (PDF/apresentação) a partir do payload de `GET /relatorio`.
**Resposta 200:** `{ "url_download": "string" }`

## Códigos de erro comuns
| Código | Significado |
|---|---|
| `PROJETO_NAO_ENCONTRADO` | `id_projeto` não existe |
| `TRANSICAO_INVALIDA` | tentativa de pular etapas do fluxo sequencial |
| `PARAMETROS_INCOMPLETOS` | falha em `ValidacaoParametrosFisicos` |
| `VALIDACAO_CAMPO` | campo obrigatório ausente ou com tipo inválido no body |
