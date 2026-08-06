export function formatarDuracao(horas: number): string {
  if (horas < 1) return `${Math.round(horas * 60)} min`;
  const dias = Math.floor(horas / 24);
  const horasRestantes = horas % 24;
  if (dias > 0) return `${dias}d ${Math.round(horasRestantes)}h`;
  return `${horas.toFixed(1)}h`;
}
