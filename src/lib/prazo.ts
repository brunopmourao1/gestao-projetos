export function estaAtrasado(dataPrevistaConclusao: string | null, agora: Date = new Date()): boolean {
  if (!dataPrevistaConclusao) return false;
  return new Date(dataPrevistaConclusao).getTime() < agora.getTime();
}

export function formatarData(dataIso: string): string {
  const d = new Date(dataIso);
  return d.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}
