import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { historicoTransicoes, projetos } from "@/db/schema";
import {
  calcularFluxoPorEstagio,
  calcularMetricas,
  calcularPrazosCriticos,
  montarAtividadeRecente,
} from "@/lib/dashboard";

// GET /api/dashboard — métricas agregadas da tela "Visão geral" (dashboard).
// Endpoint novo e aditivo (não altera nenhuma rota/regra existente) — ver
// design_handoff_redesign/README.md, tela "Visão geral".
export async function GET() {
  const db = getDb();
  const agora = new Date();

  const [todosProjetos, transicoesParaEntregue, historicoRecente] = await Promise.all([
    db.select().from(projetos),
    db.select().from(historicoTransicoes).where(eq(historicoTransicoes.colunaDestino, "Entregue")),
    db.select().from(historicoTransicoes).orderBy(desc(historicoTransicoes.dataMovimentacao)).limit(8),
  ]);

  const projetosNormalizados = todosProjetos.map((p) => ({
    idProjeto: p.idProjeto,
    numero: p.numero,
    nomeMaquina: p.nomeMaquina,
    nomeCliente: p.nomeCliente,
    descricao: p.descricao,
    ordem: p.ordem,
    dataPrevistaConclusao: p.dataPrevistaConclusao?.toISOString() ?? null,
    statusAtual: p.statusAtual,
    dataCriacao: p.dataCriacao.toISOString(),
    checklistOffline: p.checklistOffline,
    observacoes: p.observacoes,
    percentualMontagem: p.percentualMontagem,
    checklistOnline: p.checklistOnline,
  }));

  const projetosPorId = new Map(projetosNormalizados.map((p) => [p.idProjeto, { numero: p.numero }]));

  const metricas = calcularMetricas(
    projetosNormalizados,
    transicoesParaEntregue.map((t) => ({ idProjeto: t.idProjeto, dataMovimentacao: t.dataMovimentacao })),
    agora
  );
  const fluxoPorEstagio = calcularFluxoPorEstagio(projetosNormalizados);
  const prazosCriticos = calcularPrazosCriticos(projetosNormalizados, agora);
  const atividadeRecente = montarAtividadeRecente(
    historicoRecente.map((h) => ({
      idTransicao: h.idTransicao,
      idProjeto: h.idProjeto,
      colunaOrigem: h.colunaOrigem,
      colunaDestino: h.colunaDestino,
      dataMovimentacao: h.dataMovimentacao,
    })),
    projetosPorId,
    agora
  );

  return NextResponse.json({ metricas, fluxoPorEstagio, prazosCriticos, atividadeRecente });
}
