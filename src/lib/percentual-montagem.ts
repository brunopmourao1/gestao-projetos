// Valida o percentual manual da fase "Montagem" (ver HU-17) — inteiro 0-100.
export function percentualValido(valor: unknown): valor is number {
  return typeof valor === "number" && Number.isInteger(valor) && valor >= 0 && valor <= 100;
}
