import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { projetos } from "@/db/schema";
import { erroResponse } from "@/lib/api-error";
import { buscarProjetoPorId, montarProjetoDetalhado } from "@/lib/projetos-repo";

// GET /api/projetos/:id — detalhes do projeto (para o DetailsDrawer).
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
  return NextResponse.json(detalhado);
}

// PATCH /api/projetos/:id — edita numero/nome_maquina/descricao de um projeto existente.
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

  const dados = body as Record<string, unknown>;
  const numero = dados?.numero;
  if (typeof numero !== "string" || numero.trim().length === 0) {
    return erroResponse(400, "VALIDACAO_CAMPO", "Campo numero é obrigatório.");
  }
  const nomeMaquina = dados?.nome_maquina;
  if (nomeMaquina !== undefined && nomeMaquina !== null && typeof nomeMaquina !== "string") {
    return erroResponse(400, "VALIDACAO_CAMPO", "Campo nome_maquina deve ser texto.");
  }
  const descricao = dados?.descricao;
  if (descricao !== undefined && descricao !== null && typeof descricao !== "string") {
    return erroResponse(400, "VALIDACAO_CAMPO", "Campo descricao deve ser texto.");
  }

  try {
    const [atualizado] = await db
      .update(projetos)
      .set({
        numero: numero.trim(),
        nomeMaquina: (nomeMaquina as string | null | undefined)?.trim() || null,
        descricao: (descricao as string | null | undefined)?.trim() || null,
      })
      .where(eq(projetos.idProjeto, id))
      .returning();

    return NextResponse.json(atualizado);
  } catch (e) {
    const causa = (e as { cause?: { code?: string } })?.cause;
    if (causa?.code === "23505") {
      return erroResponse(409, "VALIDACAO_CAMPO", `Já existe um projeto com o número "${numero.trim()}".`);
    }
    throw e;
  }
}

// DELETE /api/projetos/:id — exclui o projeto (especificações técnicas e
// histórico são removidos em cascata pela FK ON DELETE CASCADE do schema).
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();
  const projeto = await buscarProjetoPorId(db, id);
  if (!projeto) {
    return erroResponse(404, "PROJETO_NAO_ENCONTRADO", `Projeto ${id} não encontrado.`);
  }

  await db.delete(projetos).where(eq(projetos.idProjeto, id));
  return NextResponse.json({ ok: true });
}
