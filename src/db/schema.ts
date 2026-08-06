import { pgTable, uuid, varchar, text, timestamp, pgEnum, json, doublePrecision } from "drizzle-orm/pg-core";

export const statusProjetoEnum = pgEnum("status_projeto", [
  "Esquema_Eletrico",
  "Offline",
  "Montagem",
  "Online",
  "Concluido",
]);

// Ver Docs/02-Tecnico/Modelo-Dados-ER.md
export const projetos = pgTable("projetos", {
  idProjeto: uuid("id_projeto").primaryKey().defaultRandom(),
  numero: varchar("numero", { length: 50 }).notNull().unique(),
  nomeMaquina: varchar("nome_maquina", { length: 255 }),
  descricao: text("descricao"),
  ordem: doublePrecision("ordem").notNull(),
  dataPrevistaConclusao: timestamp("data_prevista_conclusao"),
  statusAtual: statusProjetoEnum("status_atual").notNull().default("Esquema_Eletrico"),
  dataCriacao: timestamp("data_criacao").notNull().defaultNow(),
});

type DadosMotores = {
  rpm: number;
  fatorReducao: number;
  diametroEngrenagem: number;
};

type DadosSensores = {
  partNumbers: string[];
  calibragem: Record<string, unknown>;
};

export const especificacoesTecnicas = pgTable("especificacoes_tecnicas", {
  idEspecificacao: uuid("id_especificacao").primaryKey().defaultRandom(),
  idProjeto: uuid("id_projeto")
    .notNull()
    .references(() => projetos.idProjeto, { onDelete: "cascade" }),
  linkEsquemaEletrico: varchar("link_esquema_eletrico", { length: 2048 }),
  dadosMotores: json("dados_motores").$type<DadosMotores>(),
  dadosSensores: json("dados_sensores").$type<DadosSensores>(),
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
