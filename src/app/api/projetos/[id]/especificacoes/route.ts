import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { especificacoesTecnicas } from "@/db/schema";
import { erroResponse } from "@/lib/api-error";
import { buscarProjetoPorId } from "@/lib/projetos-repo";

interface BodyEspecificacoes {
  link_esquema_eletrico?: string | null;
  dados_motores?: {
    rpm?: unknown;
    fator_reducao?: unknown;
    diametro_engrenagem?: unknown;
  } | null;
  dados_sensores?: {
    part_numbers?: unknown;
    calibragem?: unknown;
  } | null;
}

// PUT /api/projetos/:id/especificacoes — cria/atualiza dados técnicos (idempotente).
// Ver Docs/02-Tecnico/Especificacao-API.md e HU-06/HU-07 em Backlog-Historias-Usuario.md
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();
  const projeto = await buscarProjetoPorId(db, id);
  if (!projeto) {
    return erroResponse(404, "PROJETO_NAO_ENCONTRADO", `Projeto ${id} não encontrado.`);
  }

  let body: BodyEspecificacoes;
  try {
    body = await request.json();
  } catch {
    return erroResponse(400, "VALIDACAO_CAMPO", "Corpo da requisição inválido (JSON esperado).");
  }

  const camposInvalidos: string[] = [];
  const dm = body.dados_motores;
  if (dm) {
    if (typeof dm.rpm !== "number") camposInvalidos.push("dados_motores.rpm");
    if (typeof dm.fator_reducao !== "number") camposInvalidos.push("dados_motores.fator_reducao");
    if (typeof dm.diametro_engrenagem !== "number")
      camposInvalidos.push("dados_motores.diametro_engrenagem");
  }
  const ds = body.dados_sensores;
  if (ds?.part_numbers !== undefined && !Array.isArray(ds.part_numbers)) {
    camposInvalidos.push("dados_sensores.part_numbers");
  }
  if (camposInvalidos.length > 0) {
    return erroResponse(400, "VALIDACAO_CAMPO", "Campos inválidos.", { camposInvalidos });
  }

  const valores = {
    linkEsquemaEletrico: body.link_esquema_eletrico ?? null,
    dadosMotores: dm
      ? {
          rpm: dm.rpm as number,
          fatorReducao: dm.fator_reducao as number,
          diametroEngrenagem: dm.diametro_engrenagem as number,
        }
      : null,
    dadosSensores: ds
      ? {
          partNumbers: (ds.part_numbers as string[]) ?? [],
          calibragem: (ds.calibragem as Record<string, unknown>) ?? {},
        }
      : null,
  };

  // Sem constraint UNIQUE em id_projeto no schema atual, então não dá pra
  // usar onConflictDoUpdate — select-then-branch faz o mesmo papel aqui.
  const [existente] = await db
    .select({ idEspecificacao: especificacoesTecnicas.idEspecificacao })
    .from(especificacoesTecnicas)
    .where(eq(especificacoesTecnicas.idProjeto, id));

  const [resultado] = existente
    ? await db
        .update(especificacoesTecnicas)
        .set(valores)
        .where(eq(especificacoesTecnicas.idProjeto, id))
        .returning()
    : await db
        .insert(especificacoesTecnicas)
        .values({ idProjeto: id, ...valores })
        .returning();

  return NextResponse.json(resultado);
}
