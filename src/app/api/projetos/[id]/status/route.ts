import { naoImplementado } from "@/lib/api-stub";

// PATCH /api/projetos/:id/status — move o projeto para a próxima coluna.
// Aciona CalculoMetricasTempo e, se destino for Concluido, ValidacaoParametrosFisicos.
// Ver Docs/02-Tecnico/Especificacao-API.md e HU-02/HU-08 em Backlog-Historias-Usuario.md
export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await params;
  return naoImplementado("Implementar PATCH /api/projetos/:id/status");
}
