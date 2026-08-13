import { describe, expect, it } from "vitest";
import { compilarRelatorio, compilarRelatorioMarkdown } from "./relatorio";
import { ProjetoDetalhado } from "@/types/projeto";

const projetoBase: ProjetoDetalhado = {
  idProjeto: "1",
  numero: "OS 1800",
  nomeMaquina: "Torno CNC 01",
  nomeCliente: null,
  descricao: null,
  ordem: 1000,
  dataPrevistaConclusao: null,
  statusAtual: "Offline",
  dataCriacao: "2024-01-01T00:00:00.000Z",
  checklistOffline: { hardware: false, logicaFcFb: false, ihm: false, seguranca: false },
  observacoes: null,
  percentualMontagem: 0,
  checklistOnline: { testesIO: false, ajusteParametros: false, testesFuncionais: false, liberacao: false },
  historicoTransicoes: [],
  pendenciasVisitas: [],
};

describe("compilarRelatorio", () => {
  it("não lança erro para um projeto sem histórico", () => {
    expect(() => compilarRelatorio(projetoBase)).not.toThrow();
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
  it("gera markdown com 'não informado' sem lançar erro para descrição ausente", () => {
    const payload = compilarRelatorio(projetoBase);
    const markdown = compilarRelatorioMarkdown(payload);
    expect(() => markdown).not.toThrow();
    expect(markdown).toContain("não informado");
    expect(markdown).toContain("Torno CNC 01");
  });
});
