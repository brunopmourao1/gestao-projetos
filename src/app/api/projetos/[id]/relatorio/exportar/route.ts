import { naoImplementado } from "@/lib/api-stub";

// POST /api/projetos/:id/relatorio/exportar — gera arquivo de exportação (PDF/apresentação).
// Ver Docs/02-Tecnico/Especificacao-API.md
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await params;
  return naoImplementado("Implementar POST /api/projetos/:id/relatorio/exportar");
}
