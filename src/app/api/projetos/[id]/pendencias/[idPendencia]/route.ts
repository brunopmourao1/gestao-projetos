import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { pendenciasVisitas } from "@/db/schema";
import { getDb } from "@/db";
import { erroResponse } from "@/lib/api-error";

// PATCH /api/projetos/:id/pendencias/:idPendencia — marca/desmarca uma
// entrada do log de pendências como concluída. Ver HU-19; não bloqueia
// avanço de fase, é só um controle de acompanhamento.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; idPendencia: string }> }
) {
  const { idPendencia } = await params;
  const db = getDb();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return erroResponse(400, "VALIDACAO_CAMPO", "Corpo da requisição inválido (JSON esperado).");
  }

  const concluida = (body as Record<string, unknown>)?.concluida;
  if (typeof concluida !== "boolean") {
    return erroResponse(400, "VALIDACAO_CAMPO", "Campo concluida é obrigatório e deve ser booleano.");
  }

  const [atualizada] = await db
    .update(pendenciasVisitas)
    .set({ concluida })
    .where(eq(pendenciasVisitas.idPendencia, idPendencia))
    .returning();

  if (!atualizada) {
    return erroResponse(404, "PENDENCIA_NAO_ENCONTRADA", `Pendência ${idPendencia} não encontrada.`);
  }

  return NextResponse.json({ ...atualizada, data: atualizada.data.toISOString() });
}
