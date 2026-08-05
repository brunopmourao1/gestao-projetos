CREATE TYPE "public"."status_projeto" AS ENUM('Esquema_Eletrico', 'Offline', 'Montagem', 'Online', 'Concluido');--> statement-breakpoint
CREATE TABLE "especificacoes_tecnicas" (
	"id_especificacao" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id_projeto" uuid NOT NULL,
	"link_esquema_eletrico" varchar(2048),
	"dados_motores" json,
	"dados_sensores" json
);
--> statement-breakpoint
CREATE TABLE "historico_transicoes" (
	"id_transicao" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id_projeto" uuid NOT NULL,
	"coluna_origem" varchar(50) NOT NULL,
	"coluna_destino" varchar(50) NOT NULL,
	"data_movimentacao" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projetos" (
	"id_projeto" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome_maquina" varchar(255) NOT NULL,
	"status_atual" "status_projeto" DEFAULT 'Esquema_Eletrico' NOT NULL,
	"data_criacao" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "especificacoes_tecnicas" ADD CONSTRAINT "especificacoes_tecnicas_id_projeto_projetos_id_projeto_fk" FOREIGN KEY ("id_projeto") REFERENCES "public"."projetos"("id_projeto") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "historico_transicoes" ADD CONSTRAINT "historico_transicoes_id_projeto_projetos_id_projeto_fk" FOREIGN KEY ("id_projeto") REFERENCES "public"."projetos"("id_projeto") ON DELETE cascade ON UPDATE no action;