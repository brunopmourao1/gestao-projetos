import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { historicoTransicoes } from "@/db/schema";
import { erroResponse } from "@/lib/api-error";
import { buscarProjetoPorId } from "@/lib/projetos-repo";
import { calcularMetricasTempo } from "@/lib/metricas";

// GET /api/projetos/:id/metricas-tempo — lead time por estágio (HU-05, CalculoMetricasTempo).
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

  const statusInicial = historico.length > 0 ? historico[0].colunaOrigem : projeto.statusAtual;
  const porEstagio = calcularMetricasTempo(
    statusInicial,
    projeto.dataCriacao,
    historico.map((h) => ({
      colunaOrigem: h.colunaOrigem,
      colunaDestino: h.colunaDestino,
      dataMovimentacao: h.dataMovimentacao,
    }))
  );

  return NextResponse.json({ porEstagio });
}
