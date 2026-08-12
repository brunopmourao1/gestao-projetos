import { COLUNAS_FLUXO, Projeto, StatusProjeto } from "@/types/projeto";

// Cálculos puros da tela "Visão geral" (dashboard). Arquivo novo — não
// altera nenhum módulo existente de src/lib. Consome os mesmos dados de
// /api/projetos + histórico de transições, sem introduzir campo novo no
// schema nem mudar regra de negócio alguma (só agrega o que já existe).

export interface MetricasDashboard {
  projetosAtivos: number;
  emAtraso: number;
  entreguesNoAno: number;
  leadTimeMedioDias: number | null;
}

export interface FluxoEstagio {
  status: StatusProjeto;
  titulo: string;
  quantidade: number;
  /** 0-100, proporcional ao estágio com mais projetos. */
  percentualBarra: number;
}

export interface PrazoCritico {
  idProjeto: string;
  numero: string;
  nomeMaquina: string | null;
  dataPrevistaConclusao: string;
  atrasado: boolean;
}

export interface AtividadeItem {
  idTransicao: string;
  idProjeto: string;
  texto: string;
  quando: string;
  status: StatusProjeto;
}

const MS_POR_DIA = 86_400_000;

function tituloDoEstagio(status: string): string {
  return COLUNAS_FLUXO.find((c) => c.status === status)?.titulo ?? status;
}

export function calcularMetricas(
  projetos: Projeto[],
  transicoesParaEntregue: { idProjeto: string; dataMovimentacao: Date }[],
  agora: Date = new Date()
): MetricasDashboard {
  const projetosAtivos = projetos.filter((p) => p.statusAtual !== "Entregue").length;
  const emAtraso = projetos.filter(
    (p) => p.statusAtual !== "Entregue" && p.dataPrevistaConclusao && new Date(p.dataPrevistaConclusao) < agora
  ).length;

  // Última transição pra "Entregue" de cada projeto (o fluxo permite voltar
  // uma etapa e ser entregue de novo — usamos sempre a mais recente).
  const ultimaEntregaPorProjeto = new Map<string, Date>();
  for (const t of transicoesParaEntregue) {
    const atual = ultimaEntregaPorProjeto.get(t.idProjeto);
    if (!atual || t.dataMovimentacao > atual) ultimaEntregaPorProjeto.set(t.idProjeto, t.dataMovimentacao);
  }

  const anoAtual = agora.getFullYear();
  let entreguesNoAno = 0;
  const leadTimes: number[] = [];
  for (const projeto of projetos) {
    if (projeto.statusAtual !== "Entregue") continue;
    const dataEntrega = ultimaEntregaPorProjeto.get(projeto.idProjeto);
    if (!dataEntrega) continue;
    if (dataEntrega.getFullYear() === anoAtual) entreguesNoAno += 1;
    const dias = (dataEntrega.getTime() - new Date(projeto.dataCriacao).getTime()) / MS_POR_DIA;
    if (dias >= 0) leadTimes.push(dias);
  }

  const leadTimeMedioDias =
    leadTimes.length > 0 ? Math.round((leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length) * 10) / 10 : null;

  return { projetosAtivos, emAtraso, entreguesNoAno, leadTimeMedioDias };
}

export function calcularFluxoPorEstagio(projetos: Projeto[]): FluxoEstagio[] {
  const contagens = COLUNAS_FLUXO.map(({ status, titulo }) => ({
    status,
    titulo,
    quantidade: projetos.filter((p) => p.statusAtual === status).length,
  }));
  const maior = Math.max(1, ...contagens.map((c) => c.quantidade));
  return contagens.map((c) => ({ ...c, percentualBarra: Math.round((c.quantidade / maior) * 100) }));
}

export function calcularPrazosCriticos(projetos: Projeto[], agora: Date = new Date(), limite = 3): PrazoCritico[] {
  return projetos
    .filter((p): p is Projeto & { dataPrevistaConclusao: string } => p.statusAtual !== "Entregue" && Boolean(p.dataPrevistaConclusao))
    .sort((a, b) => new Date(a.dataPrevistaConclusao).getTime() - new Date(b.dataPrevistaConclusao).getTime())
    .slice(0, limite)
    .map((p) => ({
      idProjeto: p.idProjeto,
      numero: p.numero,
      nomeMaquina: p.nomeMaquina,
      dataPrevistaConclusao: p.dataPrevistaConclusao,
      atrasado: new Date(p.dataPrevistaConclusao) < agora,
    }));
}

export function formatarTempoRelativo(data: Date, agora: Date = new Date()): string {
  const diffMin = Math.max(0, Math.round((agora.getTime() - data.getTime()) / 60_000));
  if (diffMin < 1) return "agora mesmo";
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffHoras = Math.round(diffMin / 60);
  if (diffHoras < 24) return `há ${diffHoras} h`;
  const diffDias = Math.round(diffHoras / 24);
  if (diffDias < 30) return `há ${diffDias} d`;
  const diffMeses = Math.round(diffDias / 30);
  return `há ${diffMeses} ${diffMeses === 1 ? "mês" : "meses"}`;
}

export function montarAtividadeRecente(
  transicoes: {
    idTransicao: string;
    idProjeto: string;
    colunaOrigem: string;
    colunaDestino: string;
    dataMovimentacao: Date;
  }[],
  projetosPorId: Map<string, Pick<Projeto, "numero">>,
  agora: Date = new Date(),
  limite = 8
): AtividadeItem[] {
  return [...transicoes]
    .sort((a, b) => b.dataMovimentacao.getTime() - a.dataMovimentacao.getTime())
    .slice(0, limite)
    .flatMap((t) => {
      const projeto = projetosPorId.get(t.idProjeto);
      if (!projeto) return [];
      return [
        {
          idTransicao: t.idTransicao,
          idProjeto: t.idProjeto,
          texto: `${projeto.numero}: ${tituloDoEstagio(t.colunaOrigem)} → ${tituloDoEstagio(t.colunaDestino)}`,
          quando: formatarTempoRelativo(t.dataMovimentacao, agora),
          status: t.colunaDestino as StatusProjeto,
        },
      ];
    });
}
