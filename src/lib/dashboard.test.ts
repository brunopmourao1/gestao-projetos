import { describe, expect, it } from "vitest";
import {
  calcularFluxoPorEstagio,
  calcularMetricas,
  calcularPrazosCriticos,
  formatarTempoRelativo,
  montarAtividadeRecente,
} from "./dashboard";
import { Projeto } from "@/types/projeto";

function criarProjeto(overrides: Partial<Projeto>): Projeto {
  return {
    idProjeto: overrides.idProjeto ?? "p1",
    numero: overrides.numero ?? "OS 1",
    nomeMaquina: null,
    nomeCliente: null,
    descricao: null,
    ordem: 1000,
    dataPrevistaConclusao: null,
    statusAtual: "Esquema_Eletrico",
    dataCriacao: new Date("2024-01-01T00:00:00Z").toISOString(),
    checklistOffline: {},
    observacoes: null,
    percentualMontagem: 0,
    checklistOnline: {},
    ...overrides,
  };
}

describe("calcularMetricas", () => {
  const agora = new Date("2024-03-01T00:00:00Z");

  it("conta projetos ativos (tudo que não está Entregue)", () => {
    const projetos = [
      criarProjeto({ idProjeto: "1", statusAtual: "Esquema_Eletrico" }),
      criarProjeto({ idProjeto: "2", statusAtual: "Montagem" }),
      criarProjeto({ idProjeto: "3", statusAtual: "Entregue" }),
    ];
    const resultado = calcularMetricas(projetos, [], agora);
    expect(resultado.projetosAtivos).toBe(2);
  });

  it("conta em atraso só projetos não entregues com prazo vencido", () => {
    const projetos = [
      criarProjeto({ idProjeto: "1", statusAtual: "Offline", dataPrevistaConclusao: "2024-01-01T00:00:00Z" }),
      criarProjeto({ idProjeto: "2", statusAtual: "Offline", dataPrevistaConclusao: "2024-06-01T00:00:00Z" }),
      criarProjeto({
        idProjeto: "3",
        statusAtual: "Entregue",
        dataPrevistaConclusao: "2024-01-01T00:00:00Z",
      }),
    ];
    const resultado = calcularMetricas(projetos, [], agora);
    expect(resultado.emAtraso).toBe(1);
  });

  it("conta entregues no ano pela transição mais recente pra Entregue", () => {
    const projetos = [
      criarProjeto({ idProjeto: "1", statusAtual: "Entregue", dataCriacao: "2023-01-01T00:00:00Z" }),
      criarProjeto({ idProjeto: "2", statusAtual: "Entregue", dataCriacao: "2022-01-01T00:00:00Z" }),
    ];
    const transicoes = [
      { idProjeto: "1", dataMovimentacao: new Date("2024-02-01T00:00:00Z") },
      { idProjeto: "2", dataMovimentacao: new Date("2023-05-01T00:00:00Z") },
    ];
    const resultado = calcularMetricas(projetos, transicoes, agora);
    expect(resultado.entreguesNoAno).toBe(1);
  });

  it("usa a transição mais recente quando o projeto foi entregue mais de uma vez", () => {
    const projetos = [criarProjeto({ idProjeto: "1", statusAtual: "Entregue", dataCriacao: "2023-01-01T00:00:00Z" })];
    const transicoes = [
      { idProjeto: "1", dataMovimentacao: new Date("2023-06-01T00:00:00Z") },
      { idProjeto: "1", dataMovimentacao: new Date("2024-01-15T00:00:00Z") },
    ];
    const resultado = calcularMetricas(projetos, transicoes, agora);
    expect(resultado.entreguesNoAno).toBe(1);
  });

  it("calcula lead time médio em dias entre criação e entrega", () => {
    const projetos = [
      criarProjeto({ idProjeto: "1", statusAtual: "Entregue", dataCriacao: "2024-01-01T00:00:00Z" }),
      criarProjeto({ idProjeto: "2", statusAtual: "Entregue", dataCriacao: "2024-01-11T00:00:00Z" }),
    ];
    const transicoes = [
      { idProjeto: "1", dataMovimentacao: new Date("2024-01-11T00:00:00Z") },
      { idProjeto: "2", dataMovimentacao: new Date("2024-01-21T00:00:00Z") },
    ];
    const resultado = calcularMetricas(projetos, transicoes, agora);
    expect(resultado.leadTimeMedioDias).toBe(10);
  });

  it("retorna lead time nulo quando não há projetos entregues", () => {
    const projetos = [criarProjeto({ idProjeto: "1", statusAtual: "Offline" })];
    const resultado = calcularMetricas(projetos, [], agora);
    expect(resultado.leadTimeMedioDias).toBeNull();
  });
});

describe("calcularFluxoPorEstagio", () => {
  it("conta projetos por estágio na ordem do fluxo e normaliza a barra pelo maior", () => {
    const projetos = [
      criarProjeto({ idProjeto: "1", statusAtual: "Offline" }),
      criarProjeto({ idProjeto: "2", statusAtual: "Offline" }),
      criarProjeto({ idProjeto: "3", statusAtual: "Montagem" }),
    ];
    const resultado = calcularFluxoPorEstagio(projetos);
    expect(resultado.map((r) => r.status)).toEqual([
      "Esquema_Eletrico",
      "Offline",
      "Montagem",
      "Online",
      "Tryout",
      "Entregue",
    ]);
    expect(resultado.find((r) => r.status === "Offline")).toMatchObject({ quantidade: 2, percentualBarra: 100 });
    expect(resultado.find((r) => r.status === "Montagem")).toMatchObject({ quantidade: 1, percentualBarra: 50 });
    expect(resultado.find((r) => r.status === "Esquema_Eletrico")).toMatchObject({ quantidade: 0, percentualBarra: 0 });
  });
});

describe("calcularPrazosCriticos", () => {
  const agora = new Date("2024-03-01T00:00:00Z");

  it("ignora projetos sem prazo e já entregues, ordena pelo prazo mais próximo/atrasado", () => {
    const projetos = [
      criarProjeto({ idProjeto: "1", numero: "OS 1", statusAtual: "Offline", dataPrevistaConclusao: "2024-05-01T00:00:00Z" }),
      criarProjeto({ idProjeto: "2", numero: "OS 2", statusAtual: "Offline", dataPrevistaConclusao: "2024-01-01T00:00:00Z" }),
      criarProjeto({ idProjeto: "3", numero: "OS 3", statusAtual: "Offline", dataPrevistaConclusao: null }),
      criarProjeto({ idProjeto: "4", numero: "OS 4", statusAtual: "Entregue", dataPrevistaConclusao: "2024-01-01T00:00:00Z" }),
    ];
    const resultado = calcularPrazosCriticos(projetos, agora, 3);
    expect(resultado.map((r) => r.numero)).toEqual(["OS 2", "OS 1"]);
    expect(resultado[0].atrasado).toBe(true);
    expect(resultado[1].atrasado).toBe(false);
  });

  it("respeita o limite informado", () => {
    const projetos = Array.from({ length: 5 }, (_, i) =>
      criarProjeto({
        idProjeto: String(i),
        numero: `OS ${i}`,
        statusAtual: "Offline",
        dataPrevistaConclusao: `2024-0${i + 1}-01T00:00:00Z`,
      })
    );
    const resultado = calcularPrazosCriticos(projetos, agora, 3);
    expect(resultado).toHaveLength(3);
  });
});

describe("formatarTempoRelativo", () => {
  const agora = new Date("2024-01-01T12:00:00Z");

  it("formata minutos, horas e dias", () => {
    expect(formatarTempoRelativo(new Date("2024-01-01T11:59:00Z"), agora)).toBe("há 1 min");
    expect(formatarTempoRelativo(new Date("2024-01-01T10:00:00Z"), agora)).toBe("há 2 h");
    expect(formatarTempoRelativo(new Date("2023-12-30T12:00:00Z"), agora)).toBe("há 2 d");
  });
});

describe("montarAtividadeRecente", () => {
  it("ordena por mais recente, monta o texto com os títulos das colunas e ignora transições órfãs", () => {
    const agora = new Date("2024-01-01T12:00:00Z");
    const projetosPorId = new Map([["1", { numero: "OS 1" }]]);
    const transicoes = [
      {
        idTransicao: "t1",
        idProjeto: "1",
        colunaOrigem: "Esquema_Eletrico",
        colunaDestino: "Offline",
        dataMovimentacao: new Date("2024-01-01T10:00:00Z"),
      },
      {
        idTransicao: "t2",
        idProjeto: "1",
        colunaOrigem: "Offline",
        colunaDestino: "Montagem",
        dataMovimentacao: new Date("2024-01-01T11:00:00Z"),
      },
      {
        idTransicao: "t3",
        idProjeto: "orfao",
        colunaOrigem: "Offline",
        colunaDestino: "Montagem",
        dataMovimentacao: new Date("2024-01-01T11:30:00Z"),
      },
    ];

    const resultado = montarAtividadeRecente(transicoes, projetosPorId, agora);

    expect(resultado).toHaveLength(2);
    expect(resultado[0]).toMatchObject({
      idTransicao: "t2",
      texto: "OS 1: Projeto Offline → Aguardando Montagem",
      quando: "há 1 h",
      status: "Montagem",
    });
    expect(resultado[1]).toMatchObject({ idTransicao: "t1" });
  });

  it("respeita o limite informado", () => {
    const agora = new Date("2024-01-01T12:00:00Z");
    const projetosPorId = new Map([["1", { numero: "OS 1" }]]);
    const transicoes = Array.from({ length: 5 }, (_, i) => ({
      idTransicao: `t${i}`,
      idProjeto: "1",
      colunaOrigem: "Esquema_Eletrico",
      colunaDestino: "Offline",
      dataMovimentacao: new Date(agora.getTime() - i * 60_000),
    }));
    const resultado = montarAtividadeRecente(transicoes, projetosPorId, agora, 2);
    expect(resultado).toHaveLength(2);
  });
});
