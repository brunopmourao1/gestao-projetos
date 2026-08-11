import { NextResponse } from "next/server";
import { pendenciasVisitas } from "@/db/schema";
import { getDb } from "@/db";
import { erroResponse } from "@/lib/api-error";
import { buscarProjetoPorId } from "@/lib/projetos-repo";

// POST /api/projetos/:id/pendencias — adiciona uma entrada ao log de
// pendências de visitas técnicas (fases Tryout/Entregue). Ver HU-19.
// Log com múltiplas entradas (data + texto), nunca sobrescrito — diferente
// do campo único "observacoes" (HU-16).
export async function POST(
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

  const texto = (body as Record<string, unknown>)?.texto;
  if (typeof texto !== "string" || texto.trim().length === 0) {
    return erroResponse(400, "VALIDACAO_CAMPO", "Campo texto é obrigatório.");
  }

  const [criada] = await db
    .insert(pendenciasVisitas)
    .values({ idProjeto: id, texto: texto.trim() })
    .returning();

  return NextResponse.json({ ...criada, data: criada.data.toISOString() }, { status: 201 });
}
