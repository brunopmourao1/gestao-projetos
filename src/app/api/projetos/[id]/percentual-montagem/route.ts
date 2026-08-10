import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { projetos } from "@/db/schema";
import { erroResponse } from "@/lib/api-error";
import { buscarProjetoPorId } from "@/lib/projetos-repo";
import { percentualValido } from "@/lib/percentual-montagem";

// PATCH /api/projetos/:id/percentual-montagem — ajusta o progresso manual
// (0-100) da fase "Montagem". Sem checklist e sem bloqueio de avanço — o
// usuário preenche livremente conforme recebe informação em reunião.
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

  const percentual = (body as Record<string, unknown>)?.percentual;
  if (!percentualValido(percentual)) {
    return erroResponse(400, "VALIDACAO_CAMPO", "Campo percentual deve ser um inteiro entre 0 e 100.");
  }

  const [atualizado] = await db
    .update(projetos)
    .set({ percentualMontagem: percentual })
    .where(eq(projetos.idProjeto, id))
    .returning();

  return NextResponse.json(atualizado);
}
