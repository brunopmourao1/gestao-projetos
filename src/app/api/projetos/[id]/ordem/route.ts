import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { projetos } from "@/db/schema";
import { erroResponse } from "@/lib/api-error";
import { buscarProjetoPorId } from "@/lib/projetos-repo";

// PATCH /api/projetos/:id/ordem — reordena o projeto dentro da mesma coluna
// (prioridade manual). Não altera status_atual nem grava histórico — não é
// uma transição de estado, só uma reordenação visual.
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

  const ordem = (body as Record<string, unknown>)?.ordem;
  if (typeof ordem !== "number") {
    return erroResponse(400, "VALIDACAO_CAMPO", "Campo ordem é obrigatório e deve ser número.");
  }

  const [atualizado] = await db
    .update(projetos)
    .set({ ordem })
    .where(eq(projetos.idProjeto, id))
    .returning();

  return NextResponse.json(atualizado);
}
