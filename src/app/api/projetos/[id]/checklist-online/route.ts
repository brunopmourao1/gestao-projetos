import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { projetos } from "@/db/schema";
import { erroResponse } from "@/lib/api-error";
import { buscarProjetoPorId } from "@/lib/projetos-repo";
import { buscarItensChecklist, mesclarChecklist } from "@/lib/checklist-config-repo";

// PATCH /api/projetos/:id/checklist-online — merge parcial dos itens
// configurados pra fase Online (ver tela de Configurações, HU-20). Mesmo
// padrão de /checklist-offline.
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

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return erroResponse(400, "VALIDACAO_CAMPO", "Corpo da requisição inválido (JSON esperado).");
  }

  const itens = await buscarItensChecklist(db, "Online");
  const { checklistAtualizado, chavesInvalidas } = mesclarChecklist(
    itens,
    projeto.checklistOnline,
    body
  );
  if (chavesInvalidas.length > 0) {
    return erroResponse(400, "VALIDACAO_CAMPO", "Campos inválidos.", { camposInvalidos: chavesInvalidas });
  }

  const [atualizado] = await db
    .update(projetos)
    .set({ checklistOnline: checklistAtualizado })
    .where(eq(projetos.idProjeto, id))
    .returning();

  return NextResponse.json(atualizado);
}
