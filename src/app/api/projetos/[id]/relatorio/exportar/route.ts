import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { erroResponse } from "@/lib/api-error";
import { montarProjetoDetalhado } from "@/lib/projetos-repo";
import { compilarRelatorio, compilarRelatorioMarkdown } from "@/lib/relatorio";

// POST /api/projetos/:id/relatorio/exportar — gera arquivo de exportação.
// Sem gerador de PDF/storage provisionado ainda: devolve Markdown como data:
// URL auto-contida. Ver Docs/02-Tecnico/Especificacao-API.md
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const detalhado = await montarProjetoDetalhado(getDb(), id);
  if (!detalhado) {
    return erroResponse(404, "PROJETO_NAO_ENCONTRADO", `Projeto ${id} não encontrado.`);
  }

  const markdown = compilarRelatorioMarkdown(compilarRelatorio(detalhado));
  const base64 = Buffer.from(markdown, "utf-8").toString("base64");
  const urlDownload = `data:text/markdown;charset=utf-8;base64,${base64}`;

  return NextResponse.json({ urlDownload });
}
