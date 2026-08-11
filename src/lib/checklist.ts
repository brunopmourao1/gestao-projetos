import { ChecklistItemConfig } from "@/types/projeto";

// Cada sub-etapa vale 100/N% (N = número de itens configurados pra fase),
// sem progresso parcial por item. Ver HU-20.
export function percentualChecklist(
  itens: ChecklistItemConfig[],
  checklist: Record<string, boolean>
): number {
  if (itens.length === 0) return 0;
  const concluidos = itens.filter((item) => checklist[item.chave]).length;
  return Math.round((concluidos / itens.length) * 100);
}
