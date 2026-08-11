import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { historicoTransicoes, projetos } from "@/db/schema";
import { erroResponse } from "@/lib/api-error";
import { buscarProjetoPorId } from "@/lib/projetos-repo";
import { buscarItensChecklist } from "@/lib/checklist-config-repo";
import { isTransicaoValida, statusValido, validarChecklist } from "@/lib/fluxo";
import { StatusProjeto } from "@/types/projeto";

// PATCH /api/projetos/:id/status — move o projeto para uma coluna adjacente.
// Aciona CalculoMetricasTempo (implícito via Historico_Transicoes).
// Ver Docs/02-Tecnico/Especificacao-API.md e HU-02 em Backlog-Historias-Usuario.md
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return erroResponse(400, "VALIDACAO_CAMPO", "Corpo da requisição inválido (JSON esperado).");
  }

  const dados = body as Record<string, unknown>;
  const novoStatus = dados?.novo_status;
  if (!statusValido(novoStatus)) {
    return erroResponse(
      400,
      "VALIDACAO_CAMPO",
      "Campo novo_status é obrigatório e deve ser um status válido."
    );
  }
  const ordem = dados?.ordem;
  if (ordem !== undefined && typeof ordem !== "number") {
    return erroResponse(400, "VALIDACAO_CAMPO", "Campo ordem deve ser número.");
  }

  const db = getDb();
  const projeto = await buscarProjetoPorId(db, id);
  if (!projeto) {
    return erroResponse(404, "PROJETO_NAO_ENCONTRADO", `Projeto ${id} não encontrado.`);
  }

  if (!isTransicaoValida(projeto.statusAtual, novoStatus)) {
    return erroResponse(
      400,
      "TRANSICAO_INVALIDA",
      `Não é possível mover de "${projeto.statusAtual}" para "${novoStatus}".`
    );
  }

  if (projeto.statusAtual === "Offline" && novoStatus === "Montagem") {
    const itens = await buscarItensChecklist(db, "Offline");
    const validacao = validarChecklist(itens, projeto.checklistOffline);
    if (!validacao.valido) {
      return erroResponse(
        422,
        "CHECKLIST_OFFLINE_INCOMPLETO",
        "Checklist da fase Offline precisa estar 100% concluído antes de avançar.",
        { itensFaltantes: validacao.itensFaltantes }
      );
    }
  }

  if (projeto.statusAtual === "Online" && novoStatus === "Tryout") {
    const itens = await buscarItensChecklist(db, "Online");
    const validacao = validarChecklist(itens, projeto.checklistOnline);
    if (!validacao.valido) {
      return erroResponse(
        422,
        "CHECKLIST_ONLINE_INCOMPLETO",
        "Checklist da fase Online precisa estar 100% concluído antes de avançar.",
        { itensFaltantes: validacao.itensFaltantes }
      );
    }
  }

  // neon-http não suporta transações interativas (db.transaction lança
  // "No transactions support in neon-http driver") — db.batch roda as duas
  // queries atomicamente em uma única viagem HTTP, o que basta aqui já que
  // nenhuma depende de valor computado pela outra.
  const [updateResult] = await db.batch([
    db
      .update(projetos)
      .set({
        statusAtual: novoStatus as StatusProjeto,
        ...(ordem !== undefined ? { ordem: ordem as number } : {}),
      })
      .where(eq(projetos.idProjeto, id))
      .returning(),
    db.insert(historicoTransicoes).values({
      idProjeto: id,
      colunaOrigem: projeto.statusAtual,
      colunaDestino: novoStatus as StatusProjeto,
    }),
  ]);

  return NextResponse.json(updateResult[0]);
}
