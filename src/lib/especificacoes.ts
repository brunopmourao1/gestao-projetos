import { EspecificacoesTecnicas } from "@/types/projeto";

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

type ExistenteParcial = Pick<
  EspecificacoesTecnicas,
  "linkEsquemaEletrico" | "dadosMotores" | "dadosSensores"
> | null;

export interface ResultadoMerge {
  camposInvalidos: string[];
  valores: Pick<EspecificacoesTecnicas, "linkEsquemaEletrico" | "dadosMotores" | "dadosSensores">;
}

// PUT parcial: uma chave AUSENTE do body preserva o valor já existente; uma
// chave presente (mesmo null) sobrescreve. Evita que salvar só
// dados_sensores apague dados_motores já salvos, e vice-versa.
export function montarValoresEspecificacoes(
  body: BodyEspecificacoes,
  existente: ExistenteParcial
): ResultadoMerge {
  const camposInvalidos: string[] = [];

  const temMotores = "dados_motores" in body;
  const dm = body.dados_motores;
  if (temMotores && dm) {
    if (typeof dm.rpm !== "number") camposInvalidos.push("dados_motores.rpm");
    if (typeof dm.fator_reducao !== "number") camposInvalidos.push("dados_motores.fator_reducao");
    if (typeof dm.diametro_engrenagem !== "number")
      camposInvalidos.push("dados_motores.diametro_engrenagem");
  }

  const temSensores = "dados_sensores" in body;
  const ds = body.dados_sensores;
  if (temSensores && ds?.part_numbers !== undefined && !Array.isArray(ds.part_numbers)) {
    camposInvalidos.push("dados_sensores.part_numbers");
  }

  const valores = {
    linkEsquemaEletrico:
      "link_esquema_eletrico" in body
        ? body.link_esquema_eletrico ?? null
        : existente?.linkEsquemaEletrico ?? null,
    dadosMotores: !temMotores
      ? existente?.dadosMotores ?? null
      : dm
        ? {
            rpm: dm.rpm as number,
            fatorReducao: dm.fator_reducao as number,
            diametroEngrenagem: dm.diametro_engrenagem as number,
          }
        : null,
    dadosSensores: !temSensores
      ? existente?.dadosSensores ?? null
      : ds
        ? {
            partNumbers: (ds.part_numbers as string[]) ?? [],
            calibragem: (ds.calibragem as Record<string, unknown>) ?? {},
          }
        : null,
  };

  return { camposInvalidos, valores };
}
