import { ProjetoDetalhado } from "@/types/projeto";
import { calcularMetricasTempo, MetricaEstagio } from "./metricas";

const NAO_INFORMADO = "não informado";

export interface RelatorioPayload {
  projeto: {
    idProjeto: string;
    numero: string;
    nomeMaquina: string;
    descricao: string;
    statusAtual: string;
    dataCriacao: string;
  };
  historicoResumido: { colunaOrigem: string; colunaDestino: string; dataMovimentacao: string }[];
  metricasTempo: MetricaEstagio[];
}

// MotorApresentacao (ver Arquitetura.md) — compila status e histórico.
// Campos ausentes viram "não informado" em vez de quebrar (ver Plano-Testes-QA.md, seção Relatório).
export function compilarRelatorio(projeto: ProjetoDetalhado): RelatorioPayload {
  const statusInicial =
    projeto.historicoTransicoes.length > 0
      ? projeto.historicoTransicoes[0].colunaOrigem
      : projeto.statusAtual;

  const metricasTempo = calcularMetricasTempo(
    statusInicial,
    new Date(projeto.dataCriacao),
    projeto.historicoTransicoes.map((h) => ({
      colunaOrigem: h.colunaOrigem,
      colunaDestino: h.colunaDestino,
      dataMovimentacao: new Date(h.dataMovimentacao),
    }))
  );

  return {
    projeto: {
      idProjeto: projeto.idProjeto,
      numero: projeto.numero,
      nomeMaquina: projeto.nomeMaquina ?? NAO_INFORMADO,
      descricao: projeto.descricao ?? NAO_INFORMADO,
      statusAtual: projeto.statusAtual,
      dataCriacao: projeto.dataCriacao,
    },
    historicoResumido: projeto.historicoTransicoes.map((h) => ({
      colunaOrigem: h.colunaOrigem,
      colunaDestino: h.colunaDestino,
      dataMovimentacao: h.dataMovimentacao,
    })),
    metricasTempo,
  };
}

export function compilarRelatorioMarkdown(payload: RelatorioPayload): string {
  const linhas: string[] = [];
  linhas.push(`# Relatório de Comissionamento — ${payload.projeto.numero}`);
  linhas.push("");
  linhas.push(`**Nome da máquina:** ${payload.projeto.nomeMaquina}`);
  linhas.push(`**Descrição:** ${payload.projeto.descricao}`);
  linhas.push(`**Status atual:** ${payload.projeto.statusAtual}`);
  linhas.push(`**Data de criação:** ${payload.projeto.dataCriacao}`);
  linhas.push("");
  linhas.push("## Histórico de Transições");
  if (payload.historicoResumido.length === 0) {
    linhas.push("Nenhuma transição registrada.");
  } else {
    for (const h of payload.historicoResumido) {
      linhas.push(`- ${h.colunaOrigem} → ${h.colunaDestino} em ${h.dataMovimentacao}`);
    }
  }
  linhas.push("");
  linhas.push("## Tempo por Estágio");
  for (const m of payload.metricasTempo) {
    linhas.push(`- ${m.coluna}: ${m.tempoPermanenciaHoras.toFixed(2)}h`);
  }
  return linhas.join("\n");
}
