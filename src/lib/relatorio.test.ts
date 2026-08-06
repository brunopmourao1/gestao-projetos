import { describe, expect, it } from "vitest";
import { compilarRelatorio, compilarRelatorioMarkdown } from "./relatorio";
import { ProjetoDetalhado } from "@/types/projeto";

const projetoBase: ProjetoDetalhado = {
  idProjeto: "1",
  numero: "OS 1800",
  nomeMaquina: "Torno CNC 01",
  descricao: null,
  ordem: 1000,
  dataPrevistaConclusao: null,
  statusAtual: "Offline",
  dataCriacao: "2024-01-01T00:00:00.000Z",
  especificacoesTecnicas: null,
  historicoTransicoes: [],
};

describe("compilarRelatorio", () => {
  it("preenche tudo com 'não informado' quando especificações é null, sem lançar erro", () => {
    expect(() => compilarRelatorio(projetoBase)).not.toThrow();
    const payload = compilarRelatorio(projetoBase);
    expect(payload.especificacoesTecnicas).toEqual({
      linkEsquemaEletrico: "não informado",
      dadosMotores: { rpm: "não informado", fatorReducao: "não informado", diametroEngrenagem: "não informado" },
      dadosSensores: { partNumbers: "não informado", calibragem: "não informado" },
    });
  });

  it("preenche parcialmente quando só dados_motores está presente", () => {
    const projeto: ProjetoDetalhado = {
      ...projetoBase,
      especificacoesTecnicas: {
        idEspecificacao: "e1",
        idProjeto: "1",
        linkEsquemaEletrico: null,
        dadosMotores: { rpm: 1750, fatorReducao: 2.5, diametroEngrenagem: 30 },
        dadosSensores: null,
      },
    };
    const payload = compilarRelatorio(projeto);
    expect(payload.especificacoesTecnicas.dadosMotores).toEqual({
      rpm: "1750",
      fatorReducao: "2.5",
      diametroEngrenagem: "30",
    });
    expect(payload.especificacoesTecnicas.dadosSensores.partNumbers).toBe("não informado");
  });

  it("mantém numero e usa 'não informado' quando nome_maquina/descricao são null", () => {
    const payload = compilarRelatorio(projetoBase);
    expect(payload.projeto.numero).toBe("OS 1800");
    expect(payload.projeto.nomeMaquina).toBe("Torno CNC 01");
    expect(payload.projeto.descricao).toBe("não informado");

    const semNome: ProjetoDetalhado = { ...projetoBase, nomeMaquina: null };
    expect(compilarRelatorio(semNome).projeto.nomeMaquina).toBe("não informado");
  });
});

describe("compilarRelatorioMarkdown", () => {
  it("gera markdown com 'não informado' sem lançar erro para especificações ausentes", () => {
    const payload = compilarRelatorio(projetoBase);
    const markdown = compilarRelatorioMarkdown(payload);
    expect(() => markdown).not.toThrow();
    expect(markdown).toContain("não informado");
    expect(markdown).toContain("Torno CNC 01");
  });
});
