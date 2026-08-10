import { describe, expect, it } from "vitest";
import {
  isTransicaoValida,
  statusValido,
  validarChecklistOffline,
  validarParametrosFisicos,
} from "./fluxo";

describe("statusValido", () => {
  it("aceita cada status válido do fluxo", () => {
    for (const status of [
      "Esquema_Eletrico",
      "Offline",
      "Montagem",
      "Online",
      "Concluido",
    ]) {
      expect(statusValido(status)).toBe(true);
    }
  });

  it("rejeita valores inválidos", () => {
    expect(statusValido("Foo")).toBe(false);
    expect(statusValido(undefined)).toBe(false);
    expect(statusValido(123)).toBe(false);
  });
});

describe("isTransicaoValida", () => {
  it("permite avançar uma coluna", () => {
    expect(isTransicaoValida("Esquema_Eletrico", "Offline")).toBe(true);
    expect(isTransicaoValida("Montagem", "Online")).toBe(true);
  });

  it("permite retroceder uma coluna", () => {
    expect(isTransicaoValida("Offline", "Esquema_Eletrico")).toBe(true);
    expect(isTransicaoValida("Online", "Montagem")).toBe(true);
  });

  it("bloqueia pular etapas", () => {
    expect(isTransicaoValida("Offline", "Online")).toBe(false);
    expect(isTransicaoValida("Esquema_Eletrico", "Concluido")).toBe(false);
  });

  it("bloqueia status desconhecido", () => {
    expect(isTransicaoValida("Esquema_Eletrico", "Foo" as never)).toBe(false);
  });
});

describe("validarParametrosFisicos", () => {
  it("aponta todos os campos faltantes quando especificações é null", () => {
    const resultado = validarParametrosFisicos(null);
    expect(resultado.valido).toBe(false);
    expect(resultado.camposFaltantes).toEqual([
      "dados_motores.rpm",
      "dados_motores.fator_reducao",
      "dados_motores.diametro_engrenagem",
      "dados_sensores.part_numbers",
    ]);
  });

  it("aprova quando todos os campos obrigatórios estão preenchidos", () => {
    const resultado = validarParametrosFisicos({
      idEspecificacao: "1",
      idProjeto: "1",
      linkEsquemaEletrico: null,
      dadosMotores: { rpm: 1750, fatorReducao: 2.5, diametroEngrenagem: 30 },
      dadosSensores: { partNumbers: ["PN-001"], calibragem: {} },
    });
    expect(resultado).toEqual({ valido: true, camposFaltantes: [] });
  });

  it("aponta apenas o campo faltante quando só um está ausente", () => {
    const resultado = validarParametrosFisicos({
      idEspecificacao: "1",
      idProjeto: "1",
      linkEsquemaEletrico: null,
      dadosMotores: { rpm: 1750, fatorReducao: undefined as unknown as number, diametroEngrenagem: 30 },
      dadosSensores: { partNumbers: ["PN-001"], calibragem: {} },
    });
    expect(resultado.camposFaltantes).toEqual(["dados_motores.fator_reducao"]);
  });

  it("trata part_numbers vazio como faltante", () => {
    const resultado = validarParametrosFisicos({
      idEspecificacao: "1",
      idProjeto: "1",
      linkEsquemaEletrico: null,
      dadosMotores: { rpm: 1750, fatorReducao: 2.5, diametroEngrenagem: 30 },
      dadosSensores: { partNumbers: [], calibragem: {} },
    });
    expect(resultado.valido).toBe(false);
    expect(resultado.camposFaltantes).toEqual(["dados_sensores.part_numbers"]);
  });
});

describe("validarChecklistOffline", () => {
  it("aponta todos os itens quando nada está marcado", () => {
    const resultado = validarChecklistOffline({
      hardware: false,
      logicaFcFb: false,
      ihm: false,
      seguranca: false,
    });
    expect(resultado.valido).toBe(false);
    expect(resultado.itensFaltantes).toEqual([
      "Hardware",
      "Lógica (FC's e FB's)",
      "IHM",
      "Segurança (PLC de segurança)",
    ]);
  });

  it("aprova quando as 4 sub-etapas estão concluídas", () => {
    const resultado = validarChecklistOffline({
      hardware: true,
      logicaFcFb: true,
      ihm: true,
      seguranca: true,
    });
    expect(resultado).toEqual({ valido: true, itensFaltantes: [] });
  });

  it("aponta apenas os itens faltantes", () => {
    const resultado = validarChecklistOffline({
      hardware: true,
      logicaFcFb: true,
      ihm: false,
      seguranca: false,
    });
    expect(resultado.itensFaltantes).toEqual(["IHM", "Segurança (PLC de segurança)"]);
  });
});
