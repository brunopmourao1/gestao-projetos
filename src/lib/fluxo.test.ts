import { describe, expect, it } from "vitest";
import { isTransicaoValida, statusValido, validarChecklist } from "./fluxo";
import { ChecklistItemConfig } from "@/types/projeto";

const itensOffline: ChecklistItemConfig[] = [
  { idItem: "1", fase: "Offline", chave: "hardware", rotulo: "Hardware", ordem: 0 },
  { idItem: "2", fase: "Offline", chave: "logicaFcFb", rotulo: "Lógica (FC's e FB's)", ordem: 1 },
  { idItem: "3", fase: "Offline", chave: "ihm", rotulo: "IHM", ordem: 2 },
  { idItem: "4", fase: "Offline", chave: "seguranca", rotulo: "Segurança (PLC de segurança)", ordem: 3 },
];

describe("statusValido", () => {
  it("aceita cada status válido do fluxo", () => {
    for (const status of [
      "Esquema_Eletrico",
      "Offline",
      "Montagem",
      "Online",
      "Tryout",
      "Entregue",
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
    expect(isTransicaoValida("Tryout", "Entregue")).toBe(true);
  });

  it("permite retroceder uma coluna", () => {
    expect(isTransicaoValida("Offline", "Esquema_Eletrico")).toBe(true);
    expect(isTransicaoValida("Online", "Montagem")).toBe(true);
  });

  it("bloqueia pular etapas", () => {
    expect(isTransicaoValida("Offline", "Online")).toBe(false);
    expect(isTransicaoValida("Esquema_Eletrico", "Entregue")).toBe(false);
  });

  it("bloqueia status desconhecido", () => {
    expect(isTransicaoValida("Esquema_Eletrico", "Foo" as never)).toBe(false);
  });
});

describe("validarChecklist", () => {
  it("aponta todos os itens quando nada está marcado", () => {
    const resultado = validarChecklist(itensOffline, {
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

  it("aprova quando todos os itens estão concluídos", () => {
    const resultado = validarChecklist(itensOffline, {
      hardware: true,
      logicaFcFb: true,
      ihm: true,
      seguranca: true,
    });
    expect(resultado).toEqual({ valido: true, itensFaltantes: [] });
  });

  it("aponta apenas os itens faltantes", () => {
    const resultado = validarChecklist(itensOffline, {
      hardware: true,
      logicaFcFb: true,
      ihm: false,
      seguranca: false,
    });
    expect(resultado.itensFaltantes).toEqual(["IHM", "Segurança (PLC de segurança)"]);
  });

  it("funciona com qualquer número de itens configurados (não fixo em 4)", () => {
    const doisItens: ChecklistItemConfig[] = [
      { idItem: "a", fase: "Online", chave: "x", rotulo: "X", ordem: 0 },
      { idItem: "b", fase: "Online", chave: "y", rotulo: "Y", ordem: 1 },
    ];
    expect(validarChecklist(doisItens, { x: true, y: false })).toEqual({
      valido: false,
      itensFaltantes: ["Y"],
    });
    expect(validarChecklist(doisItens, { x: true, y: true })).toEqual({
      valido: true,
      itensFaltantes: [],
    });
  });

  it("aprova automaticamente quando não há itens configurados", () => {
    expect(validarChecklist([], {})).toEqual({ valido: true, itensFaltantes: [] });
  });
});
