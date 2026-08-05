import { ProjetoDetalhado } from "@/types/projeto";
import { calcularMetricasTempo, MetricaEstagio } from "./metricas";

const NAO_INFORMADO = "não informado";

export interface RelatorioPayload {
  projeto: {
    idProjeto: string;
    nomeMaquina: string;
    statusAtual: string;
    dataCriacao: string;
  };
  especificacoesTecnicas: {
    linkEsquemaEletrico: string;
    dadosMotores: { rpm: string; fatorReducao: string; diametroEngrenagem: string };
    dadosSensores: { partNumbers: string; calibragem: string };
  };
  historicoResumido: { colunaOrigem: string; colunaDestino: string; dataMovimentacao: string }[];
  metricasTempo: MetricaEstagio[];
}

// MotorApresentacao (ver Arquitetura.md) — compila status, histórico e
// especificações técnicas. Campos ausentes viram "não informado" em vez de
// quebrar (ver Plano-Testes-QA.md, seção Relatório).
export function compilarRelatorio(projeto: ProjetoDetalhado): RelatorioPayload {
  const espec = projeto.especificacoesTecnicas;
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
      nomeMaquina: projeto.nomeMaquina,
      statusAtual: projeto.statusAtual,
      dataCriacao: projeto.dataCriacao,
    },
    especificacoesTecnicas: {
      linkEsquemaEletrico: espec?.linkEsquemaEletrico ?? NAO_INFORMADO,
      dadosMotores: {
        rpm: espec?.dadosMotores?.rpm != null ? String(espec.dadosMotores.rpm) : NAO_INFORMADO,
        fatorReducao:
          espec?.dadosMotores?.fatorReducao != null
            ? String(espec.dadosMotores.fatorReducao)
            : NAO_INFORMADO,
        diametroEngrenagem:
          espec?.dadosMotores?.diametroEngrenagem != null
            ? String(espec.dadosMotores.diametroEngrenagem)
            : NAO_INFORMADO,
      },
      dadosSensores: {
        partNumbers: espec?.dadosSensores?.partNumbers?.length
          ? espec.dadosSensores.partNumbers.join(", ")
          : NAO_INFORMADO,
        calibragem:
          espec?.dadosSensores?.calibragem &&
          Object.keys(espec.dadosSensores.calibragem).length > 0
            ? JSON.stringify(espec.dadosSensores.calibragem)
            : NAO_INFORMADO,
      },
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
  linhas.push(`# Relatório de Comissionamento — ${payload.projeto.nomeMaquina}`);
  linhas.push("");
  linhas.push(`**Status atual:** ${payload.projeto.statusAtual}`);
  linhas.push(`**Data de criação:** ${payload.projeto.dataCriacao}`);
  linhas.push("");
  linhas.push("## Especificações Técnicas");
  linhas.push(`- Link esquema elétrico: ${payload.especificacoesTecnicas.linkEsquemaEletrico}`);
  linhas.push(`- RPM: ${payload.especificacoesTecnicas.dadosMotores.rpm}`);
  linhas.push(`- Fator de redução: ${payload.especificacoesTecnicas.dadosMotores.fatorReducao}`);
  linhas.push(
    `- Diâmetro engrenagem: ${payload.especificacoesTecnicas.dadosMotores.diametroEngrenagem}`
  );
  linhas.push(`- Part numbers sensores: ${payload.especificacoesTecnicas.dadosSensores.partNumbers}`);
  linhas.push(`- Calibragem: ${payload.especificacoesTecnicas.dadosSensores.calibragem}`);
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
