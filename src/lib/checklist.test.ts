import { describe, expect, it } from "vitest";
import { percentualChecklist } from "./checklist";
import { ChecklistItemConfig } from "@/types/projeto";

const quatroItens: ChecklistItemConfig[] = [
  { idItem: "1", fase: "Offline", chave: "a", rotulo: "A", ordem: 0 },
  { idItem: "2", fase: "Offline", chave: "b", rotulo: "B", ordem: 1 },
  { idItem: "3", fase: "Offline", chave: "c", rotulo: "C", ordem: 2 },
  { idItem: "4", fase: "Offline", chave: "d", rotulo: "D", ordem: 3 },
];

describe("percentualChecklist", () => {
  it("retorna 0 quando nada está concluído", () => {
    expect(percentualChecklist(quatroItens, {})).toBe(0);
  });

  it("retorna 100 quando todos os itens estão concluídos", () => {
    expect(percentualChecklist(quatroItens, { a: true, b: true, c: true, d: true })).toBe(100);
  });

  it("calcula 25% por item concluído quando há 4 itens", () => {
    expect(percentualChecklist(quatroItens, { a: true })).toBe(25);
    expect(percentualChecklist(quatroItens, { a: true, b: true })).toBe(50);
    expect(percentualChecklist(quatroItens, { a: true, b: true, c: true })).toBe(75);
  });

  it("divide 100/N para um número diferente de itens", () => {
    const doisItens: ChecklistItemConfig[] = [
      { idItem: "1", fase: "Online", chave: "x", rotulo: "X", ordem: 0 },
      { idItem: "2", fase: "Online", chave: "y", rotulo: "Y", ordem: 1 },
    ];
    expect(percentualChecklist(doisItens, { x: true })).toBe(50);
  });

  it("retorna 0 quando não há itens configurados (evita divisão por zero)", () => {
    expect(percentualChecklist([], {})).toBe(0);
  });
});
