import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { projetos } from "@/db/schema";
import { erroResponse } from "@/lib/api-error";
import { buscarProjetoPorId } from "@/lib/projetos-repo";

// PATCH /api/projetos/:id/observacoes — define/limpa as observações gerais
// do projeto (pendências, definições em aberto etc.), sem precisar reenviar
// numero/nome_maquina/descricao.
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

  const observacoes = (body as Record<string, unknown>)?.observacoes;
  if (observacoes !== null && typeof observacoes !== "string") {
    return erroResponse(400, "VALIDACAO_CAMPO", "Campo observacoes deve ser texto ou null.");
  }

  const [atualizado] = await db
    .update(projetos)
    .set({ observacoes: observacoes ? (observacoes as string).trim() || null : null })
    .where(eq(projetos.idProjeto, id))
    .returning();

  return NextResponse.json(atualizado);
}
