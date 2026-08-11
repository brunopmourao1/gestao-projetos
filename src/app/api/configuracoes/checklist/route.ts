import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { getDb } from "@/db";
import { checklistItens } from "@/db/schema";
import { erroResponse } from "@/lib/api-error";
import { gerarChaveUnica } from "@/lib/checklist-config-repo";
import { FaseChecklist } from "@/types/projeto";

const FASES_VALIDAS: FaseChecklist[] = ["Offline", "Online"];

// GET /api/configuracoes/checklist — lista os itens configurados das duas
// fases (Offline/Online), ordenados por `ordem`. Ver HU-20.
export async function GET() {
  const db = getDb();
  const itens = await db.select().from(checklistItens).orderBy(asc(checklistItens.ordem));
  return NextResponse.json(itens);
}

// POST /api/configuracoes/checklist — cria um novo item pro final da lista
// da fase informada. `chave` é gerada a partir do rótulo (slug único).
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return erroResponse(400, "VALIDACAO_CAMPO", "Corpo da requisição inválido (JSON esperado).");
  }

  const dados = body as Record<string, unknown>;
  const fase = dados?.fase;
  const rotulo = dados?.rotulo;
  if (!FASES_VALIDAS.includes(fase as FaseChecklist)) {
    return erroResponse(400, "VALIDACAO_CAMPO", "Campo fase é obrigatório e deve ser Offline ou Online.");
  }
  if (typeof rotulo !== "string" || rotulo.trim().length === 0) {
    return erroResponse(400, "VALIDACAO_CAMPO", "Campo rotulo é obrigatório.");
  }

  const db = getDb();
  const existentes = await db.select().from(checklistItens);
  const daFase = existentes.filter((i) => i.fase === fase);
  const chave = gerarChaveUnica(rotulo.trim(), new Set(daFase.map((i) => i.chave)));
  const ordem = daFase.length > 0 ? Math.max(...daFase.map((i) => i.ordem)) + 1 : 0;

  const [criado] = await db
    .insert(checklistItens)
    .values({ fase: fase as FaseChecklist, chave, rotulo: rotulo.trim(), ordem })
    .returning();

  return NextResponse.json(criado, { status: 201 });
}
