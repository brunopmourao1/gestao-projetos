import { describe, expect, it } from "vitest";
import { percentualChecklistOffline } from "./checklist-offline";

describe("percentualChecklistOffline", () => {
  it("retorna 0 quando nada está concluído", () => {
    expect(
      percentualChecklistOffline({ hardware: false, logicaFcFb: false, ihm: false, seguranca: false })
    ).toBe(0);
  });

  it("retorna 100 quando as 4 sub-etapas estão concluídas", () => {
    expect(
      percentualChecklistOffline({ hardware: true, logicaFcFb: true, ihm: true, seguranca: true })
    ).toBe(100);
  });

  it("calcula 25% por sub-etapa concluída", () => {
    expect(
      percentualChecklistOffline({ hardware: true, logicaFcFb: false, ihm: false, seguranca: false })
    ).toBe(25);
    expect(
      percentualChecklistOffline({ hardware: true, logicaFcFb: true, ihm: false, seguranca: false })
    ).toBe(50);
    expect(
      percentualChecklistOffline({ hardware: true, logicaFcFb: true, ihm: true, seguranca: false })
    ).toBe(75);
  });
});
