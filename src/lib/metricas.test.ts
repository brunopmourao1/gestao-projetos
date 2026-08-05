import { describe, expect, it } from "vitest";
import { calcularMetricasTempo } from "./metricas";

describe("calcularMetricasTempo", () => {
  it("calcula uma transição única com datas fixas", () => {
    const dataCriacao = new Date("2024-01-01T00:00:00Z");
    const agora = new Date("2024-01-03T00:00:00Z");
    const resultado = calcularMetricasTempo(
      "Esquema_Eletrico",
      dataCriacao,
      [
        {
          colunaOrigem: "Esquema_Eletrico",
          colunaDestino: "Offline",
          dataMovimentacao: new Date("2024-01-02T00:00:00Z"),
        },
      ],
      agora
    );

    expect(resultado).toEqual([
      { coluna: "Esquema_Eletrico", tempoPermanenciaHoras: 24 },
      { coluna: "Offline", tempoPermanenciaHoras: 24 },
    ]);
  });

  it("retorna só o estágio atual quando não há transições", () => {
    const dataCriacao = new Date("2024-01-01T00:00:00Z");
    const agora = new Date("2024-01-01T05:00:00Z");
    const resultado = calcularMetricasTempo("Esquema_Eletrico", dataCriacao, [], agora);

    expect(resultado).toEqual([{ coluna: "Esquema_Eletrico", tempoPermanenciaHoras: 5 }]);
  });

  it("ordena transições fora de ordem antes de calcular", () => {
    const dataCriacao = new Date("2024-01-01T00:00:00Z");
    const t1 = {
      colunaOrigem: "Esquema_Eletrico",
      colunaDestino: "Offline",
      dataMovimentacao: new Date("2024-01-02T00:00:00Z"),
    };
    const t2 = {
      colunaOrigem: "Offline",
      colunaDestino: "Montagem",
      dataMovimentacao: new Date("2024-01-04T00:00:00Z"),
    };
    const agora = new Date("2024-01-05T00:00:00Z");

    // Passadas fora de ordem propositalmente.
    const resultado = calcularMetricasTempo("Esquema_Eletrico", dataCriacao, [t2, t1], agora);

    expect(resultado).toEqual([
      { coluna: "Esquema_Eletrico", tempoPermanenciaHoras: 24 },
      { coluna: "Offline", tempoPermanenciaHoras: 48 },
      { coluna: "Montagem", tempoPermanenciaHoras: 24 },
    ]);
  });

  it("nunca retorna tempo negativo (desvio de relógio entre servidores)", () => {
    const dataCriacao = new Date("2024-01-01T00:00:00.010Z");
    // "agora" ligeiramente anterior à dataMovimentacao — simula desvio de
    // relógio entre o servidor do banco e o processo Node.
    const agora = new Date("2024-01-01T00:00:00.000Z");
    const resultado = calcularMetricasTempo("Esquema_Eletrico", dataCriacao, [], agora);

    expect(resultado).toEqual([{ coluna: "Esquema_Eletrico", tempoPermanenciaHoras: 0 }]);
  });
});
