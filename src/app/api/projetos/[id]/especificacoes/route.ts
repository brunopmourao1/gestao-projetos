import { naoImplementado } from "@/lib/api-stub";

// PUT /api/projetos/:id/especificacoes — cria/atualiza dados técnicos (idempotente).
// Ver Docs/02-Tecnico/Especificacao-API.md e HU-06/HU-07 em Backlog-Historias-Usuario.md
export async function PUT(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await params;
  return naoImplementado("Implementar PUT /api/projetos/:id/especificacoes");
}
