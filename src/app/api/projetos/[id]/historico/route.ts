import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { historicoTransicoes } from "@/db/schema";
import { erroResponse } from "@/lib/api-error";
import { buscarProjetoPorId } from "@/lib/projetos-repo";

// GET /api/projetos/:id/historico — lista de transições do projeto (HU-04).
// Ver Docs/02-Tecnico/Especificacao-API.md
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();
  const projeto = await buscarProjetoPorId(db, id);
  if (!projeto) {
    return erroResponse(404, "PROJETO_NAO_ENCONTRADO", `Projeto ${id} não encontrado.`);
  }

  const historico = await db
    .select()
    .from(historicoTransicoes)
    .where(eq(historicoTransicoes.idProjeto, id))
    .orderBy(asc(historicoTransicoes.dataMovimentacao));

  return NextResponse.json(historico);
}
