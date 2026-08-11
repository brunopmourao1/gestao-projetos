import { ChecklistItemConfig, COLUNAS_FLUXO, StatusProjeto } from "@/types/projeto";

const ORDEM: StatusProjeto[] = COLUNAS_FLUXO.map((c) => c.status);

export function statusValido(valor: unknown): valor is StatusProjeto {
  return typeof valor === "string" && (ORDEM as string[]).includes(valor);
}

// Adjacente = uma posição à frente ou atrás no fluxo sequencial — permite
// corrigir um movimento errado sem precisar de uma rota separada.
export function isTransicaoValida(origem: StatusProjeto, destino: StatusProjeto): boolean {
  const idxOrigem = ORDEM.indexOf(origem);
  const idxDestino = ORDEM.indexOf(destino);
  if (idxOrigem === -1 || idxDestino === -1) return false;
  return Math.abs(idxDestino - idxOrigem) === 1;
}

export interface ResultadoValidacaoChecklist {
  valido: boolean;
  itensFaltantes: string[];
}

// Checada antes de permitir Offline->Montagem (itens da fase Offline) ou
// Online->Tryout (itens da fase Online). Itens vêm da tabela checklist_itens
// (configurável via tela de Configurações, ver HU-20) — todos precisam
// estar `true` no mapa `checklist` (chave-do-item -> concluído).
export function validarChecklist(
  itens: ChecklistItemConfig[],
  checklist: Record<string, boolean>
): ResultadoValidacaoChecklist {
  const itensFaltantes = itens.filter((item) => !checklist[item.chave]).map((item) => item.rotulo);
  return { valido: itensFaltantes.length === 0, itensFaltantes };
}
