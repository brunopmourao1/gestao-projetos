import { naoImplementado } from "@/lib/api-stub";

// GET /api/projetos/:id/historico — lista de transições do projeto (HU-04).
// Ver Docs/02-Tecnico/Especificacao-API.md
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await params;
  return naoImplementado("Implementar GET /api/projetos/:id/historico");
}
