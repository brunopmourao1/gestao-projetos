import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { pendenciasVisitas } from "@/db/schema";
import { getDb } from "@/db";
import { erroResponse } from "@/lib/api-error";

// PATCH /api/projetos/:id/pendencias/:idPendencia — marca/desmarca uma
// entrada do log de pendências como concluída e/ou corrige o texto (ex.:
// erro de digitação). Ver HU-19; concluida não bloqueia avanço de fase, é
// só um controle de acompanhamento.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; idPendencia: string }> }
) {
  const { id, idPendencia } = await params;
  const db = getDb();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return erroResponse(400, "VALIDACAO_CAMPO", "Corpo da requisição inválido (JSON esperado).");
  }

  const dados = body as Record<string, unknown>;
  const concluida = dados?.concluida;
  const texto = dados?.texto;

  if (concluida === undefined && texto === undefined) {
    return erroResponse(400, "VALIDACAO_CAMPO", "Informe ao menos um campo: concluida ou texto.");
  }
  if (concluida !== undefined && typeof concluida !== "boolean") {
    return erroResponse(400, "VALIDACAO_CAMPO", "Campo concluida deve ser booleano.");
  }
  if (texto !== undefined && (typeof texto !== "string" || texto.trim().length === 0)) {
    return erroResponse(400, "VALIDACAO_CAMPO", "Campo texto deve ser um texto não vazio.");
  }

  const valores: { concluida?: boolean; texto?: string } = {};
  if (concluida !== undefined) valores.concluida = concluida;
  if (texto !== undefined) valores.texto = (texto as string).trim();

  const [atualizada] = await db
    .update(pendenciasVisitas)
    .set(valores)
    .where(and(eq(pendenciasVisitas.idPendencia, idPendencia), eq(pendenciasVisitas.idProjeto, id)))
    .returning();

  if (!atualizada) {
    return erroResponse(404, "PENDENCIA_NAO_ENCONTRADA", `Pendência ${idPendencia} não encontrada.`);
  }

  return NextResponse.json({ ...atualizada, data: atualizada.data.toISOString() });
}

// DELETE /api/projetos/:id/pendencias/:idPendencia — remove uma entrada do
// log de pendências (ex.: registrada por engano).
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; idPendencia: string }> }
) {
  const { id, idPendencia } = await params;
  const db = getDb();

  const [excluida] = await db
    .delete(pendenciasVisitas)
    .where(and(eq(pendenciasVisitas.idPendencia, idPendencia), eq(pendenciasVisitas.idProjeto, id)))
    .returning();

  if (!excluida) {
    return erroResponse(404, "PENDENCIA_NAO_ENCONTRADA", `Pendência ${idPendencia} não encontrada.`);
  }

  return NextResponse.json({ ok: true });
}
