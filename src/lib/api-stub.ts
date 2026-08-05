import { NextResponse } from "next/server";

// Resposta padrão para endpoints ainda não implementados.
// Formato de erro conforme Docs/02-Tecnico/Especificacao-API.md.
export function naoImplementado(tarefa: string) {
  return NextResponse.json(
    {
      erro: {
        codigo: "NAO_IMPLEMENTADO",
        mensagem: `Endpoint ainda não implementado. Ver tarefa "${tarefa}" em Docs/04-Acompanhamento/Board-Tarefas.md.`,
      },
    },
    { status: 501 }
  );
}
