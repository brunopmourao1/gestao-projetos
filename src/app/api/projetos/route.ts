import { NextRequest, NextResponse } from "next/server";
import { and, eq, ilike, max, or } from "drizzle-orm";
import { getDb } from "@/db";
import { projetos } from "@/db/schema";
import { erroResponse } from "@/lib/api-error";
import { statusValido } from "@/lib/fluxo";
import { calcularOrdem } from "@/lib/ordenacao";

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
  if (busca) {
    condicoes.push(
      or(
        ilike(projetos.numero, `%${busca}%`),
        ilike(projetos.nomeMaquina, `%${busca}%`),
        ilike(projetos.nomeCliente, `%${busca}%`)
      )
    );
  }

  const db = getDb();
  const resultado = condicoes.length
    ? await db.select().from(projetos).where(and(...condicoes))
    : await db.select().from(projetos);

  return NextResponse.json(resultado);
}

// POST /api/projetos — cria projeto novo (status inicial: Esquema_Eletrico).
// numero é obrigatório e único; nome_maquina e descricao são opcionais.
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return erroResponse(400, "VALIDACAO_CAMPO", "Corpo da requisição inválido (JSON esperado).");
  }

  const dados = body as Record<string, unknown>;
  const numero = dados?.numero;
  if (typeof numero !== "string" || numero.trim().length === 0) {
    return erroResponse(400, "VALIDACAO_CAMPO", "Campo numero é obrigatório.");
  }
  const nomeMaquina = dados?.nome_maquina;
  if (nomeMaquina !== undefined && nomeMaquina !== null && typeof nomeMaquina !== "string") {
    return erroResponse(400, "VALIDACAO_CAMPO", "Campo nome_maquina deve ser texto.");
  }
  const nomeCliente = dados?.nome_cliente;
  if (nomeCliente !== undefined && nomeCliente !== null && typeof nomeCliente !== "string") {
    return erroResponse(400, "VALIDACAO_CAMPO", "Campo nome_cliente deve ser texto.");
  }
  const descricao = dados?.descricao;
  if (descricao !== undefined && descricao !== null && typeof descricao !== "string") {
    return erroResponse(400, "VALIDACAO_CAMPO", "Campo descricao deve ser texto.");
  }
  const dataPrevistaConclusao = dados?.data_prevista_conclusao;
  if (
    dataPrevistaConclusao !== undefined &&
    dataPrevistaConclusao !== null &&
    (typeof dataPrevistaConclusao !== "string" || Number.isNaN(new Date(dataPrevistaConclusao).getTime()))
  ) {
    return erroResponse(400, "VALIDACAO_CAMPO", "Campo data_prevista_conclusao deve ser uma data válida.");
  }

  const db = getDb();
  try {
    const [{ maxOrdem }] = await db
      .select({ maxOrdem: max(projetos.ordem) })
      .from(projetos)
      .where(eq(projetos.statusAtual, "Esquema_Eletrico"));
    const ordem = calcularOrdem(maxOrdem != null ? [maxOrdem] : [], 1);

    const [criado] = await db
      .insert(projetos)
      .values({
        numero: numero.trim(),
        nomeMaquina: (nomeMaquina as string | null | undefined)?.trim() || null,
        nomeCliente: (nomeCliente as string | null | undefined)?.trim() || null,
        descricao: (descricao as string | null | undefined)?.trim() || null,
        dataPrevistaConclusao: dataPrevistaConclusao ? new Date(dataPrevistaConclusao as string) : null,
        ordem,
        statusAtual: "Esquema_Eletrico",
      })
      .returning();

    return NextResponse.json(criado, { status: 201 });
  } catch (e) {
    // drizzle-orm envolve o erro original do driver em DrizzleQueryError,
    // preservando o erro real (com .code) em .cause.
    const causa = (e as { cause?: { code?: string } })?.cause;
    if (causa?.code === "23505") {
      return erroResponse(409, "VALIDACAO_CAMPO", `Já existe um projeto com o número "${numero.trim()}".`);
    }
    throw e;
  }
}
