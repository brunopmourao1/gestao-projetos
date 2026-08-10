import { describe, expect, it } from "vitest";
import { percentualValido } from "./percentual-montagem";

describe("percentualValido", () => {
  it("aceita inteiros entre 0 e 100", () => {
    expect(percentualValido(0)).toBe(true);
    expect(percentualValido(50)).toBe(true);
    expect(percentualValido(100)).toBe(true);
  });

  it("rejeita valores fora do intervalo", () => {
    expect(percentualValido(-1)).toBe(false);
    expect(percentualValido(101)).toBe(false);
  });

  it("rejeita não-números e não-inteiros", () => {
    expect(percentualValido("50")).toBe(false);
    expect(percentualValido(undefined)).toBe(false);
    expect(percentualValido(null)).toBe(false);
    expect(percentualValido(50.5)).toBe(false);
  });
});
