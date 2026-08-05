export interface TransicaoParaCalculo {
  colunaOrigem: string;
  colunaDestino: string;
  dataMovimentacao: Date;
}

export interface MetricaEstagio {
  coluna: string;
  tempoPermanenciaHoras: number;
}

const MS_POR_HORA = 3_600_000;

// Datas de origens diferentes (relógio do servidor Postgres vs. relógio do
// processo Node) podem sofrer pequeno desvio e produzir deltas negativos —
// nunca deve aparecer tempo de permanência negativo nas métricas.
function horasEntre(inicio: Date, fim: Date): number {
  return Math.max(0, (fim.getTime() - inicio.getTime()) / MS_POR_HORA);
}

// CalculoMetricasTempo (ver Arquitetura.md) — tempo de permanência por
// estágio a partir do histórico de transições. Lista cronológica (se o
// projeto revisitar uma coluna, ela aparece mais de uma vez, não agregada).
export function calcularMetricasTempo(
  statusInicial: string,
  dataCriacao: Date,
  transicoes: TransicaoParaCalculo[],
  agora: Date = new Date()
): MetricaEstagio[] {
  const ordenadas = [...transicoes].sort(
    (a, b) => a.dataMovimentacao.getTime() - b.dataMovimentacao.getTime()
  );

  const resultado: MetricaEstagio[] = [];
  let colunaAtual = statusInicial;
  let inicioEstagio = dataCriacao;

  for (const t of ordenadas) {
    resultado.push({
      coluna: colunaAtual,
      tempoPermanenciaHoras: horasEntre(inicioEstagio, t.dataMovimentacao),
    });
    colunaAtual = t.colunaDestino;
    inicioEstagio = t.dataMovimentacao;
  }

  // Estágio atual (ainda aberto), contado até "agora".
  resultado.push({
    coluna: colunaAtual,
    tempoPermanenciaHoras: horasEntre(inicioEstagio, agora),
  });

  return resultado;
}
