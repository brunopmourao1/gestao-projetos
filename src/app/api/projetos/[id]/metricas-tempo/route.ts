import { naoImplementado } from "@/lib/api-stub";

// GET /api/projetos/:id/metricas-tempo — lead time por estágio (HU-05, CalculoMetricasTempo).
// Ver Docs/02-Tecnico/Especificacao-API.md
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await params;
  return naoImplementado("Implementar GET /api/projetos/:id/metricas-tempo");
}
