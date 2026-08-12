import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { pendenciasVisitas } from "@/db/schema";

// GET /api/pendencias/resumo — contagem de pendências em aberto (concluida
// = false) por projeto. Endpoint novo e aditivo, usado só pelo indicador
// OK/pendências no card do Board (visão rápida do kanban geral, sem precisar
// abrir o drawer de cada projeto pra saber). Projetos sem pendência em
// aberto simplesmente não aparecem no mapa (ausência = 0).
export async function GET() {
  const db = getDb();
  const abertas = await db
    .select({ idProjeto: pendenciasVisitas.idProjeto })
    .from(pendenciasVisitas)
    .where(eq(pendenciasVisitas.concluida, false));

  const contagem: Record<string, number> = {};
  for (const { idProjeto } of abertas) {
    contagem[idProjeto] = (contagem[idProjeto] ?? 0) + 1;
  }

  return NextResponse.json(contagem);
}
