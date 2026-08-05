import { NextRequest, NextResponse } from "next/server";
import { and, eq, ilike } from "drizzle-orm";
import { getDb } from "@/db";
import { projetos } from "@/db/schema";
import { erroResponse } from "@/lib/api-error";
import { statusValido } from "@/lib/fluxo";

// GET /api/projetos — lista projetos (usado por GerenciadorEstadoBoard).
// Ver Docs/02-Tecnico/Especificacao-API.md
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const busca = searchParams.get("busca");

  if (status && !statusValido(status)) {
    return erroResponse(400, "VALIDACAO_CAMPO", `status inválido: ${status}`);
  }

  const condicoes = [];
  if (statusValido(status)) condicoes.push(eq(projetos.statusAtual, status));
  if (busca) condicoes.push(ilike(projetos.nomeMaquina, `%${busca}%`));

  const db = getDb();
  const resultado = condicoes.length
    ? await db.select().from(projetos).where(and(...condicoes))
    : await db.select().from(projetos);

  return NextResponse.json(resultado);
}

// POST /api/projetos — cria projeto novo (status inicial: Esquema_Eletrico).
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return erroResponse(400, "VALIDACAO_CAMPO", "Corpo da requisição inválido (JSON esperado).");
  }

  const nomeMaquina = (body as Record<string, unknown>)?.nome_maquina;
  if (typeof nomeMaquina !== "string" || nomeMaquina.trim().length === 0) {
    return erroResponse(400, "VALIDACAO_CAMPO", "Campo nome_maquina é obrigatório.");
  }

  const db = getDb();
  const [criado] = await db
    .insert(projetos)
    .values({ nomeMaquina, statusAtual: "Esquema_Eletrico" })
    .returning();

  return NextResponse.json(criado, { status: 201 });
}
