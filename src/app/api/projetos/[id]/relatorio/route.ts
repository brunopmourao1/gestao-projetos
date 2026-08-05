import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { erroResponse } from "@/lib/api-error";
import { montarProjetoDetalhado } from "@/lib/projetos-repo";
import { compilarRelatorio } from "@/lib/relatorio";

// GET /api/projetos/:id/relatorio — aciona MotorApresentacao, retorna payload para preview (HU-09).
// Ver Docs/02-Tecnico/Especificacao-API.md
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const detalhado = await montarProjetoDetalhado(getDb(), id);
  if (!detalhado) {
    return erroResponse(404, "PROJETO_NAO_ENCONTRADO", `Projeto ${id} não encontrado.`);
  }
  return NextResponse.json(compilarRelatorio(detalhado));
}
