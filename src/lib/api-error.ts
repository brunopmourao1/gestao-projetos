import { NextResponse } from "next/server";

export type CodigoErro =
  | "PROJETO_NAO_ENCONTRADO"
  | "TRANSICAO_INVALIDA"
  | "CHECKLIST_OFFLINE_INCOMPLETO"
  | "CHECKLIST_ONLINE_INCOMPLETO"
  | "ITEM_CHECKLIST_NAO_ENCONTRADO"
  | "PENDENCIA_NAO_ENCONTRADA"
  | "SENHA_INCORRETA"
  | "NAO_AUTENTICADO"
  | "MUITAS_TENTATIVAS"
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
