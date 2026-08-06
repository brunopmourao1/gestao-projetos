import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { especificacoesTecnicas } from "@/db/schema";
import { erroResponse } from "@/lib/api-error";
import { buscarProjetoPorId } from "@/lib/projetos-repo";
import { montarValoresEspecificacoes } from "@/lib/especificacoes";

// PUT /api/projetos/:id/especificacoes — cria/atualiza dados técnicos (idempotente,
// merge parcial: chave ausente do body preserva o valor já salvo).
// Ver Docs/02-Tecnico/Especificacao-API.md e HU-06/HU-07 em Backlog-Historias-Usuario.md
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();
  const projeto = await buscarProjetoPorId(db, id);
  if (!projeto) {
    return erroResponse(404, "PROJETO_NAO_ENCONTRADO", `Projeto ${id} não encontrado.`);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return erroResponse(400, "VALIDACAO_CAMPO", "Corpo da requisição inválido (JSON esperado).");
  }

  // Sem constraint UNIQUE em id_projeto no schema atual, então não dá pra
  // usar onConflictDoUpdate — select-then-branch faz o mesmo papel aqui.
  const [existente] = await db
    .select()
    .from(especificacoesTecnicas)
    .where(eq(especificacoesTecnicas.idProjeto, id));

  const { camposInvalidos, valores } = montarValoresEspecificacoes(body, existente ?? null);
  if (camposInvalidos.length > 0) {
    return erroResponse(400, "VALIDACAO_CAMPO", "Campos inválidos.", { camposInvalidos });
  }

  const [resultado] = existente
    ? await db
        .update(especificacoesTecnicas)
        .set(valores)
        .where(eq(especificacoesTecnicas.idProjeto, id))
        .returning()
    : await db
        .insert(especificacoesTecnicas)
        .values({ idProjeto: id, ...valores })
        .returning();

  return NextResponse.json(resultado);
}
