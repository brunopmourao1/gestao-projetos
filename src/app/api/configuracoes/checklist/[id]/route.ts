import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { checklistItens } from "@/db/schema";
import { erroResponse } from "@/lib/api-error";

// PATCH /api/configuracoes/checklist/:id — renomeia o rótulo de um item.
// A `chave` (usada no JSON dos projetos) nunca muda, só o texto exibido.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return erroResponse(400, "VALIDACAO_CAMPO", "Corpo da requisição inválido (JSON esperado).");
  }

  const rotulo = (body as Record<string, unknown>)?.rotulo;
  if (typeof rotulo !== "string" || rotulo.trim().length === 0) {
    return erroResponse(400, "VALIDACAO_CAMPO", "Campo rotulo é obrigatório.");
  }

  const [atualizado] = await db
    .update(checklistItens)
    .set({ rotulo: rotulo.trim() })
    .where(eq(checklistItens.idItem, id))
    .returning();

  if (!atualizado) {
    return erroResponse(404, "ITEM_CHECKLIST_NAO_ENCONTRADO", `Item ${id} não encontrado.`);
  }

  return NextResponse.json(atualizado);
}

// DELETE /api/configuracoes/checklist/:id — remove o item da configuração.
// Projetos que já tinham essa chave marcada mantêm o valor no JSON, só
// deixa de contar no percentual/validação (chave órfã, sem limpeza retroativa).
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const [removido] = await db.delete(checklistItens).where(eq(checklistItens.idItem, id)).returning();
  if (!removido) {
    return erroResponse(404, "ITEM_CHECKLIST_NAO_ENCONTRADO", `Item ${id} não encontrado.`);
  }

  return NextResponse.json({ ok: true });
}
