import { NextResponse } from "next/server";

export type CodigoErro =
  | "PROJETO_NAO_ENCONTRADO"
  | "TRANSICAO_INVALIDA"
  | "PARAMETROS_INCOMPLETOS"
  | "CHECKLIST_OFFLINE_INCOMPLETO"
  | "VALIDACAO_CAMPO";

// Formato de erro conforme Docs/02-Tecnico/Especificacao-API.md.
export function erroResponse(
  status: number,
  codigo: CodigoErro,
  mensagem: string,
  detalhes?: Record<string, unknown>
) {
  return NextResponse.json({ erro: { codigo, mensagem, ...detalhes } }, { status });
}
