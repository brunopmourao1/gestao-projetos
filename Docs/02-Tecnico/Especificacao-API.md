# Especificação de API
**Base:** rotas derivadas das rotinas descritas em `Arquitetura.md` (`GerenciadorEstadoBoard`, `MotorApresentacao`, `CalculoMetricasTempo`).
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
    "status_atual": "Esquema_Eletrico | Offline | Montagem | Online | Tryout | Entregue",
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
Exclui o projeto permanentemente. Histórico de transições é removido em cascata (FK `ON DELETE CASCADE`).
**Resposta 200:** `{ "ok": true }`
**Resposta 404** (`PROJETO_NAO_ENCONTRADO`).

### `GET /api/projetos/:id`
Retorna detalhes de um projeto (usado ao abrir o `DetailsDrawer`).
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
  "checklist_offline": { "<chave-do-item>": "boolean, ..." },
  "observacoes": "string | null",
  "percentual_montagem": "number (0-100)",
  "checklist_online": { "<chave-do-item>": "boolean, ..." },
  "historico_transicoes": [ "...ver Historico_Transicoes" ],
  "pendencias_visitas": [ { "id_pendencia": "uuid", "data": "timestamp", "texto": "string", "concluida": "boolean" } ]
}
```

### `PATCH /api/projetos/:id/status`
Move o projeto para uma coluna adjacente (arrastar o card, ver HU-02). Aciona `CalculoMetricasTempo` e grava em `Historico_Transicoes`. Se o destino for `Montagem` (vindo de `Offline`), aciona `validarChecklistOffline`. Se o destino for `Tryout` (vindo de `Online`), aciona `validarChecklistOnline`.
**Body:** `{ "novo_status": "string", "ordem": "number (opcional)" }` — `ordem` posiciona o card no ponto exato onde foi solto na coluna de destino; se omitido, mantém a `ordem` atual.
**Resposta 200:** projeto atualizado.
**Resposta 422** (`CHECKLIST_OFFLINE_INCOMPLETO`): quando a transição de `Offline` para `Montagem` é bloqueada por sub-etapas do checklist não concluídas. O corpo do erro lista `itens_faltantes` (ver HU-15).
**Resposta 422** (`CHECKLIST_ONLINE_INCOMPLETO`): quando a transição de `Online` para `Tryout` é bloqueada por sub-etapas do checklist de comissionamento não concluídas. O corpo do erro lista `itens_faltantes` (ver HU-18).
**Resposta 400** (`TRANSICAO_INVALIDA`): quando o `novo_status` não é adjacente ao `status_atual` no fluxo sequencial.

### `PATCH /api/projetos/:id/ordem`
Reordena o projeto dentro da mesma coluna (prioridade manual). Não altera `status_atual` nem grava histórico — reordenar não é uma transição de estado.
**Body:** `{ "ordem": "number" }`
**Resposta 200:** projeto atualizado.

### `PATCH /api/projetos/:id/data-prevista`
Define ou limpa a data prevista de conclusão da **etapa atual** do projeto, sem precisar reenviar `numero`/`nome_maquina`/`descricao`. Aberto automaticamente pela UI logo após mover um card para uma coluna nova (drag-and-drop) — o preenchimento é opcional e pode ser feito depois.
**Body:** `{ "data_prevista_conclusao": "date | null" }`
**Resposta 200:** projeto atualizado.

### `PATCH /api/projetos/:id/checklist-offline`
Atualiza um ou mais itens do checklist configurável da fase Offline (ver HU-15/HU-20). Merge parcial — uma chave ausente do body preserva o valor já salvo. As chaves aceitas no body são exatamente as `chave` dos itens configurados pra fase Offline (ver `GET /configuracoes/checklist`) — chave desconhecida é rejeitada.
**Body:** `{ "<chave-do-item>": "boolean", ... }`
**Resposta 200:** projeto atualizado.
**Resposta 400** (`VALIDACAO_CAMPO`): quando alguma chave não corresponde a um item configurado, ou o valor não é booleano.

### `PATCH /api/projetos/:id/observacoes`
Define ou limpa a nota única de observações gerais do projeto (ver HU-16), sem precisar reenviar `numero`/`nome_maquina`/`descricao`.
**Body:** `{ "observacoes": "string | null" }`
**Resposta 200:** projeto atualizado.

### `PATCH /api/projetos/:id/percentual-montagem`
Ajusta o progresso manual (0-100) da fase Montagem (ver HU-17). Sem checklist, sem bloqueio de avanço associado — diferente de `checklist-offline`.
**Body:** `{ "percentual": "number (0-100)" }`
**Resposta 200:** projeto atualizado.
**Resposta 400** (`VALIDACAO_CAMPO`): quando `percentual` não é um inteiro entre 0 e 100.

### `PATCH /api/projetos/:id/checklist-online`
Atualiza um ou mais itens do checklist configurável da fase Online (ver HU-18/HU-20). Mesmo padrão de `checklist-offline` (merge parcial, chaves dinâmicas vindas de `GET /configuracoes/checklist`).
**Body:** `{ "<chave-do-item>": "boolean", ... }`
**Resposta 200:** projeto atualizado.
**Resposta 400** (`VALIDACAO_CAMPO`): quando alguma chave não corresponde a um item configurado, ou o valor não é booleano.

### `POST /api/projetos/:id/pendencias`
Adiciona uma entrada ao log de pendências de visitas técnicas (fases Tryout/Entregue, ver HU-19). Log com múltiplas entradas — nunca sobrescreve, diferente de `observacoes`. Criada sempre com `concluida: false`.
**Body:** `{ "texto": "string" }`
**Resposta 201:** `{ "id_pendencia": "uuid", "id_projeto": "uuid", "data": "timestamp", "texto": "string", "concluida": false }`
**Resposta 400** (`VALIDACAO_CAMPO`): quando `texto` está ausente ou vazio.

### `PATCH /api/projetos/:id/pendencias/:idPendencia`
Marca ou desmarca uma pendência específica como concluída (ver HU-22). É só um controle de acompanhamento — não bloqueia nem exige nada pra mover o card entre colunas.
**Body:** `{ "concluida": "boolean" }`
**Resposta 200:** `{ "id_pendencia": "uuid", "id_projeto": "uuid", "data": "timestamp", "texto": "string", "concluida": "boolean" }`
**Resposta 400** (`VALIDACAO_CAMPO`): quando `concluida` está ausente ou não é booleano.
**Resposta 404** (`PENDENCIA_NAO_ENCONTRADA`): quando `idPendencia` não existe.

## Configurações

### `GET /api/configuracoes/checklist`
Lista os itens configurados dos checklists de Offline e Online (ver HU-20), ordenados por `ordem`.
**Resposta 200:** `[ { "id_item": "uuid", "fase": "Offline | Online", "chave": "string", "rotulo": "string", "ordem": "number" } ]`

### `POST /api/configuracoes/checklist`
Cria um novo item no final da lista da fase informada. `chave` é gerada automaticamente (slug do `rotulo`, único dentro da fase).
**Body:** `{ "fase": "Offline | Online", "rotulo": "string" }`
**Resposta 201:** item criado.
**Resposta 400** (`VALIDACAO_CAMPO`): `fase` ausente/inválida ou `rotulo` vazio.

### `PATCH /api/configuracoes/checklist/:id`
Renomeia o rótulo de um item. A `chave` nunca muda depois de criada — só o texto exibido.
**Body:** `{ "rotulo": "string" }`
**Resposta 200:** item atualizado.
**Resposta 404** (`ITEM_CHECKLIST_NAO_ENCONTRADO`).

### `DELETE /api/configuracoes/checklist/:id`
Remove o item da configuração. Projetos que já tinham essa chave marcada mantêm o valor no JSON (chave órfã, ignorada no cálculo de percentual/validação) — sem limpeza retroativa.
**Resposta 200:** `{ "ok": true }`
**Resposta 404** (`ITEM_CHECKLIST_NAO_ENCONTRADO`).

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
**Resposta 200:** payload estruturado com status, histórico resumido e tempo por estágio, pronto para renderização/exportação.

### `POST /api/projetos/:id/relatorio/exportar`
Gera o arquivo de exportação (PDF/apresentação) a partir do payload de `GET /relatorio`.
**Resposta 200:** `{ "url_download": "string" }`

## Autenticação

Ver HU-21. Login simples de senha única compartilhada (`APP_PASSWORD`, sem contas individuais), aplicado por `src/proxy.ts` a todas as rotas exceto `/login` e `/api/login`.

### `POST /api/login`
Valida a senha e, se correta, seta o cookie de sessão `sessao` (httpOnly).
**Body:** `{ "senha": "string" }`
**Resposta 200:** `{ "ok": true }`
**Resposta 401** (`SENHA_INCORRETA`): senha incorreta ou `APP_PASSWORD` não configurada no servidor.

### `POST /api/logout`
Limpa o cookie de sessão.
**Resposta 200:** `{ "ok": true }`

## Códigos de erro comuns
| Código | Significado |
|---|---|
| `PROJETO_NAO_ENCONTRADO` | `id_projeto` não existe |
| `TRANSICAO_INVALIDA` | tentativa de pular etapas do fluxo sequencial |
| `CHECKLIST_OFFLINE_INCOMPLETO` | falha em `validarChecklistOffline` (transição Offline → Montagem) |
| `CHECKLIST_ONLINE_INCOMPLETO` | falha em `validarChecklistOnline` (transição Online → Tryout) |
| `ITEM_CHECKLIST_NAO_ENCONTRADO` | `id_item` não existe (rotas de Configurações) |
| `SENHA_INCORRETA` | `POST /api/login` com senha errada |
| `NAO_AUTENTICADO` | requisição de API sem cookie de sessão válido (retornado pelo proxy, não por uma rota) |
| `VALIDACAO_CAMPO` | campo obrigatório ausente ou com tipo inválido no body |
