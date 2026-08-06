import { describe, expect, it } from "vitest";
import { montarValoresEspecificacoes } from "./especificacoes";

const existente = {
  linkEsquemaEletrico: "https://exemplo.com/antigo.pdf",
  dadosMotores: { rpm: 1000, fatorReducao: 1, diametroEngrenagem: 10 },
  dadosSensores: { partNumbers: ["PN-OLD"], calibragem: { offset: 1 } },
};

describe("montarValoresEspecificacoes", () => {
  it("preserva dados_motores existentes quando a chave está ausente do body", () => {
    const resultado = montarValoresEspecificacoes(
      { dados_sensores: { part_numbers: ["PN-NEW"], calibragem: {} } },
      existente
    );
    expect(resultado.camposInvalidos).toEqual([]);
    expect(resultado.valores.dadosMotores).toEqual(existente.dadosMotores);
    expect(resultado.valores.dadosSensores).toEqual({ partNumbers: ["PN-NEW"], calibragem: {} });
  });

  it("preserva dados_sensores existentes quando a chave está ausente do body", () => {
    const resultado = montarValoresEspecificacoes(
      { dados_motores: { rpm: 1750, fator_reducao: 2.5, diametro_engrenagem: 30 } },
      existente
    );
    expect(resultado.valores.dadosSensores).toEqual(existente.dadosSensores);
    expect(resultado.valores.dadosMotores).toEqual({
      rpm: 1750,
      fatorReducao: 2.5,
      diametroEngrenagem: 30,
    });
  });

  it("sobrescreve com objeto válido quando a chave está presente", () => {
    const resultado = montarValoresEspecificacoes(
      { dados_motores: { rpm: 1, fator_reducao: 2, diametro_engrenagem: 3 } },
      existente
    );
    expect(resultado.valores.dadosMotores).toEqual({
      rpm: 1,
      fatorReducao: 2,
      diametroEngrenagem: 3,
    });
  });

  it("limpa explicitamente quando a chave está presente como null", () => {
    const resultado = montarValoresEspecificacoes({ dados_motores: null }, existente);
    expect(resultado.valores.dadosMotores).toBeNull();
    expect(resultado.valores.dadosSensores).toEqual(existente.dadosSensores);
  });

  it("rejeita campos numéricos inválidos em dados_motores", () => {
    const resultado = montarValoresEspecificacoes(
      { dados_motores: { rpm: "1750", fator_reducao: 2.5, diametro_engrenagem: 30 } },
      null
    );
    expect(resultado.camposInvalidos).toEqual(["dados_motores.rpm"]);
  });

  it("rejeita part_numbers que não é array", () => {
    const resultado = montarValoresEspecificacoes(
      { dados_sensores: { part_numbers: "PN-001" } },
      null
    );
    expect(resultado.camposInvalidos).toEqual(["dados_sensores.part_numbers"]);
  });

  it("sem existente e sem body, tudo fica null", () => {
    const resultado = montarValoresEspecificacoes({}, null);
    expect(resultado.valores).toEqual({
      linkEsquemaEletrico: null,
      dadosMotores: null,
      dadosSensores: null,
    });
  });
});
