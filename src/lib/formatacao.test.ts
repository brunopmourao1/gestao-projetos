import { describe, expect, it } from "vitest";
import { formatarDuracao } from "./formatacao";

describe("formatarDuracao", () => {
  it("mostra minutos quando menos de 1 hora", () => {
    expect(formatarDuracao(0.5)).toBe("30 min");
  });

  it("mostra 0 min para duração zero", () => {
    expect(formatarDuracao(0)).toBe("0 min");
  });

  it("mostra horas com uma casa decimal entre 1h e 24h", () => {
    expect(formatarDuracao(5.25)).toBe("5.3h");
  });

  it("mostra dias e horas quando 24h ou mais", () => {
    expect(formatarDuracao(30)).toBe("1d 6h");
  });

  it("mostra múltiplos dias corretamente", () => {
    expect(formatarDuracao(50)).toBe("2d 2h");
  });
});
