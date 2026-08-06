import { describe, expect, it } from "vitest";
import { calcularOrdem } from "./ordenacao";

describe("calcularOrdem", () => {
  it("retorna o valor base quando a lista está vazia", () => {
    expect(calcularOrdem([], 0)).toBe(1000);
  });

  it("insere antes do primeiro item (topo da coluna)", () => {
    expect(calcularOrdem([1000, 2000, 3000], 0)).toBe(0);
  });

  it("insere depois do último item (fim da coluna)", () => {
    expect(calcularOrdem([1000, 2000, 3000], 3)).toBe(4000);
  });

  it("insere no meio, calculando a média dos vizinhos", () => {
    expect(calcularOrdem([1000, 2000, 3000], 1)).toBe(1500);
    expect(calcularOrdem([1000, 2000, 3000], 2)).toBe(2500);
  });

  it("insere numa lista de um único item", () => {
    expect(calcularOrdem([1000], 0)).toBe(0);
    expect(calcularOrdem([1000], 1)).toBe(2000);
  });
});
