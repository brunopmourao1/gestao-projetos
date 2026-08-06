import { describe, expect, it } from "vitest";
import { estaAtrasado, formatarData } from "./prazo";

describe("estaAtrasado", () => {
  it("retorna false quando não há data prevista", () => {
    expect(estaAtrasado(null)).toBe(false);
  });

  it("retorna false quando a data prevista é futura", () => {
    const agora = new Date("2024-01-10T00:00:00.000Z");
    expect(estaAtrasado("2024-01-20T00:00:00.000Z", agora)).toBe(false);
  });

  it("retorna true quando a data prevista já passou", () => {
    const agora = new Date("2024-01-20T00:00:00.000Z");
    expect(estaAtrasado("2024-01-10T00:00:00.000Z", agora)).toBe(true);
  });
});

describe("formatarData", () => {
  it("formata no padrão dd/mm/aaaa", () => {
    expect(formatarData("2024-03-05T00:00:00.000Z")).toBe("05/03/2024");
  });
});
