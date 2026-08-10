import { ChecklistOffline, ITENS_CHECKLIST_OFFLINE } from "@/types/projeto";

// Cada sub-etapa vale 25% (4 no total) — decisão confirmada com o usuário,
// sem progresso parcial por item.
export function percentualChecklistOffline(checklist: ChecklistOffline): number {
  const concluidos = ITENS_CHECKLIST_OFFLINE.filter((item) => checklist[item.chave]).length;
  return Math.round((concluidos / ITENS_CHECKLIST_OFFLINE.length) * 100);
}
