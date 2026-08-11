import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { checklistItens } from "@/db/schema";
import { ChecklistItemConfig, FaseChecklist } from "@/types/projeto";

type Db = ReturnType<typeof getDb>;

// Gera uma chave estável (slug) a partir do rótulo, garantindo unicidade
// dentro da fase (sufixo numérico em caso de colisão).
export function gerarChaveUnica(rotulo: string, chavesExistentes: Set<string>): string {
  const base =
    rotulo
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "item";

  if (!chavesExistentes.has(base)) return base;
  let sufixo = 2;
  while (chavesExistentes.has(`${base}_${sufixo}`)) sufixo++;
  return `${base}_${sufixo}`;
}

export async function buscarItensChecklist(db: Db, fase: FaseChecklist): Promise<ChecklistItemConfig[]> {
  return db
    .select()
    .from(checklistItens)
    .where(eq(checklistItens.fase, fase))
    .orderBy(asc(checklistItens.ordem));
}

export interface ResultadoMergeChecklist {
  checklistAtualizado: Record<string, boolean>;
  chavesInvalidas: string[];
}

// Merge parcial: uma chave ausente do body preserva o valor já salvo. Só
// aceita chaves que correspondem a um item configurado pra fase (evita
// poluir o JSON com chaves arbitrárias/typos).
export function mesclarChecklist(
  itens: ChecklistItemConfig[],
  atual: Record<string, boolean>,
  body: Record<string, unknown>
): ResultadoMergeChecklist {
  const chavesValidas = new Set(itens.map((item) => item.chave));
  const chavesInvalidas: string[] = [];
  const checklistAtualizado = { ...atual };

  for (const [chave, valor] of Object.entries(body)) {
    if (!chavesValidas.has(chave) || typeof valor !== "boolean") {
      chavesInvalidas.push(chave);
      continue;
    }
    checklistAtualizado[chave] = valor;
  }

  return { checklistAtualizado, chavesInvalidas };
}
