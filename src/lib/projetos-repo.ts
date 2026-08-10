import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { especificacoesTecnicas, historicoTransicoes, projetos } from "@/db/schema";
import { ProjetoDetalhado } from "@/types/projeto";

type Db = ReturnType<typeof getDb>;

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Evita que um :id mal-formado vire "invalid input syntax for type uuid" do
// Postgres (500 não tratado) em vez de um 404 PROJETO_NAO_ENCONTRADO limpo.
export function idValido(id: string): boolean {
  return UUID_REGEX.test(id);
}

export async function buscarProjetoPorId(db: Db, id: string) {
  if (!idValido(id)) return null;
  const [projeto] = await db.select().from(projetos).where(eq(projetos.idProjeto, id));
  return projeto ?? null;
}

export async function montarProjetoDetalhado(db: Db, id: string): Promise<ProjetoDetalhado | null> {
  const projeto = await buscarProjetoPorId(db, id);
  if (!projeto) return null;

  const [espec] = await db
    .select()
    .from(especificacoesTecnicas)
    .where(eq(especificacoesTecnicas.idProjeto, id));
  const historico = await db
    .select()
    .from(historicoTransicoes)
    .where(eq(historicoTransicoes.idProjeto, id))
    .orderBy(asc(historicoTransicoes.dataMovimentacao));

  return {
    idProjeto: projeto.idProjeto,
    numero: projeto.numero,
    nomeMaquina: projeto.nomeMaquina,
    descricao: projeto.descricao,
    ordem: projeto.ordem,
    dataPrevistaConclusao: projeto.dataPrevistaConclusao?.toISOString() ?? null,
    statusAtual: projeto.statusAtual,
    dataCriacao: projeto.dataCriacao.toISOString(),
    checklistOffline: projeto.checklistOffline,
    observacoes: projeto.observacoes,
    percentualMontagem: projeto.percentualMontagem,
    especificacoesTecnicas: espec ?? null,
    historicoTransicoes: historico.map((h) => ({
      ...h,
      dataMovimentacao: h.dataMovimentacao.toISOString(),
    })),
  };
}
