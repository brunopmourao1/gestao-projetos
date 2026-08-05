import { COLUNAS_FLUXO, EspecificacoesTecnicas, StatusProjeto } from "@/types/projeto";

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

export interface ResultadoValidacaoParametros {
  valido: boolean;
  camposFaltantes: string[];
}

// ValidacaoParametrosFisicos (ver Arquitetura.md) — checada antes de permitir
// transição para "Concluido". link_esquema_eletrico não é obrigatório.
export function validarParametrosFisicos(
  especificacoes: EspecificacoesTecnicas | null
): ResultadoValidacaoParametros {
  const faltantes: string[] = [];
  const motores = especificacoes?.dadosMotores;
  if (typeof motores?.rpm !== "number") faltantes.push("dados_motores.rpm");
  if (typeof motores?.fatorReducao !== "number") faltantes.push("dados_motores.fator_reducao");
  if (typeof motores?.diametroEngrenagem !== "number")
    faltantes.push("dados_motores.diametro_engrenagem");

  const sensores = especificacoes?.dadosSensores;
  if (!Array.isArray(sensores?.partNumbers) || sensores.partNumbers.length === 0) {
    faltantes.push("dados_sensores.part_numbers");
  }

  return { valido: faltantes.length === 0, camposFaltantes: faltantes };
}
