import { pgTable, uuid, varchar, text, timestamp, pgEnum, json, doublePrecision, integer, boolean } from "drizzle-orm/pg-core";

export const statusProjetoEnum = pgEnum("status_projeto", [
  "Esquema_Eletrico",
  "Offline",
  "Montagem",
  "Online",
  "Tryout",
  "Entregue",
]);

// Mapa chave-do-item -> concluído. As chaves são definidas dinamicamente
// pela tabela checklist_itens (configurável, ver HU-20) — não há mais um
// shape fixo de 4 campos.
export type ChecklistValores = Record<string, boolean>;

const CHECKLIST_PADRAO: ChecklistValores = {};

// Ver Docs/02-Tecnico/Modelo-Dados-ER.md
export const projetos = pgTable("projetos", {
  idProjeto: uuid("id_projeto").primaryKey().defaultRandom(),
  numero: varchar("numero", { length: 50 }).notNull().unique(),
  nomeMaquina: varchar("nome_maquina", { length: 255 }),
  nomeCliente: varchar("nome_cliente", { length: 255 }),
  descricao: text("descricao"),
  ordem: doublePrecision("ordem").notNull(),
  dataPrevistaConclusao: timestamp("data_prevista_conclusao"),
  statusAtual: statusProjetoEnum("status_atual").notNull().default("Esquema_Eletrico"),
  dataCriacao: timestamp("data_criacao").notNull().defaultNow(),
  // Sub-etapas da fase "Offline" (Hardware -> Lógica FC/FB -> IHM -> Segurança).
  // Ver Docs/01-Produto/Backlog-Historias-Usuario.md
  checklistOffline: json("checklist_offline")
    .$type<ChecklistValores>()
    .notNull()
    .default(CHECKLIST_PADRAO),
  observacoes: text("observacoes"),
  // Progresso manual (0-100) da fase "Montagem" — sem checklist, ajustado
  // livremente conforme informação recebida em reunião. Ver HU-17.
  percentualMontagem: integer("percentual_montagem").notNull().default(0),
  // Sub-etapas da fase "Online" (comissionamento na máquina). Ver HU-18.
  checklistOnline: json("checklist_online")
    .$type<ChecklistValores>()
    .notNull()
    .default(CHECKLIST_PADRAO),
});

export const historicoTransicoes = pgTable("historico_transicoes", {
  idTransicao: uuid("id_transicao").primaryKey().defaultRandom(),
  idProjeto: uuid("id_projeto")
    .notNull()
    .references(() => projetos.idProjeto, { onDelete: "cascade" }),
  colunaOrigem: varchar("coluna_origem", { length: 50 }).notNull(),
  colunaDestino: varchar("coluna_destino", { length: 50 }).notNull(),
  dataMovimentacao: timestamp("data_movimentacao").notNull().defaultNow(),
});

// Log de pendências anotadas em visitas técnicas (fases Tryout/Entregue). Ver HU-19.
export const pendenciasVisitas = pgTable("pendencias_visitas", {
  idPendencia: uuid("id_pendencia").primaryKey().defaultRandom(),
  idProjeto: uuid("id_projeto")
    .notNull()
    .references(() => projetos.idProjeto, { onDelete: "cascade" }),
  data: timestamp("data").notNull().defaultNow(),
  texto: text("texto").notNull(),
  concluida: boolean("concluida").notNull().default(false),
});

export const faseChecklistEnum = pgEnum("fase_checklist", ["Offline", "Online"]);

// Itens configuráveis dos checklists de Offline/Online (tela de
// configurações) — substitui os arrays fixos ITENS_CHECKLIST_OFFLINE/ONLINE.
// `chave` é o identificador estável usado como chave no JSON
// checklist_offline/checklist_online de Projetos. Ver HU-20.
export const checklistItens = pgTable("checklist_itens", {
  idItem: uuid("id_item").primaryKey().defaultRandom(),
  fase: faseChecklistEnum("fase").notNull(),
  chave: varchar("chave", { length: 100 }).notNull(),
  rotulo: varchar("rotulo", { length: 255 }).notNull(),
  ordem: integer("ordem").notNull(),
});
