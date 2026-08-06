import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { projetos } from "@/db/schema";
import { erroResponse } from "@/lib/api-error";
import { buscarProjetoPorId } from "@/lib/projetos-repo";

// PATCH /api/projetos/:id/data-prevista — define/limpa a data prevista de
// conclusão da etapa atual, sem precisar reenviar numero/nome_maquina/descricao.
// Aberto automaticamente logo após mover um card pra uma coluna nova.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();
  const projeto = await buscarProjetoPorId(db, id);
  if (!projeto) {
    return erroResponse(404, "PROJETO_NAO_ENCONTRADO", `Projeto ${id} não encontrado.`);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return erroResponse(400, "VALIDACAO_CAMPO", "Corpo da requisição inválido (JSON esperado).");
  }

  const dataPrevistaConclusao = (body as Record<string, unknown>)?.data_prevista_conclusao;
  if (
    dataPrevistaConclusao !== null &&
    (typeof dataPrevistaConclusao !== "string" || Number.isNaN(new Date(dataPrevistaConclusao).getTime()))
  ) {
    return erroResponse(400, "VALIDACAO_CAMPO", "Campo data_prevista_conclusao deve ser uma data válida ou null.");
  }

  const [atualizado] = await db
    .update(projetos)
    .set({ dataPrevistaConclusao: dataPrevistaConclusao ? new Date(dataPrevistaConclusao) : null })
    .where(eq(projetos.idProjeto, id))
    .returning();

  return NextResponse.json(atualizado);
}
