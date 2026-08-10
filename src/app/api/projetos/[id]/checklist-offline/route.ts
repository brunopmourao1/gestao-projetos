import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { projetos } from "@/db/schema";
import { erroResponse } from "@/lib/api-error";
import { buscarProjetoPorId } from "@/lib/projetos-repo";

const CAMPOS = {
  hardware: "hardware",
  logica_fc_fb: "logicaFcFb",
  ihm: "ihm",
  seguranca: "seguranca",
} as const;

// PATCH /api/projetos/:id/checklist-offline — merge parcial das 4 sub-etapas
// da fase "Offline" (Hardware, Lógica FC/FB, IHM, Segurança). Uma chave
// ausente do body preserva o valor já salvo, igual ao padrão de /especificacoes.
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

  const camposInvalidos: string[] = [];
  const checklistAtualizado = { ...projeto.checklistOffline };
  for (const [chaveBody, chaveInterna] of Object.entries(CAMPOS)) {
    if (!(chaveBody in body)) continue;
    const valor = body[chaveBody];
    if (typeof valor !== "boolean") {
      camposInvalidos.push(chaveBody);
      continue;
    }
    checklistAtualizado[chaveInterna] = valor;
  }
  if (camposInvalidos.length > 0) {
    return erroResponse(400, "VALIDACAO_CAMPO", "Campos inválidos.", { camposInvalidos });
  }

  const [atualizado] = await db
    .update(projetos)
    .set({ checklistOffline: checklistAtualizado })
    .where(eq(projetos.idProjeto, id))
    .returning();

  return NextResponse.json(atualizado);
}
