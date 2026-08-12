import { headers } from "next/headers";
import { BoardClient } from "@/components/board/BoardClient";
import { Projeto } from "@/types/projeto";

type ResultadoBusca = { ok: true; projetos: Projeto[] } | { ok: false };

async function buscarProjetos(): Promise<ResultadoBusca> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const protocolo = h.get("x-forwarded-proto") ?? "http";
  // Repassa o cookie de sessão — a rota /api/projetos está atrás do proxy de
  // autenticação (ver src/proxy.ts), sem o cookie ela responde 401.
  const cookie = h.get("cookie") ?? "";
  try {
    const resposta = await fetch(`${protocolo}://${host}/api/projetos`, {
      cache: "no-store",
      headers: { cookie },
    });
    if (!resposta.ok) return { ok: false };
    return { ok: true, projetos: await resposta.json() };
  } catch {
    return { ok: false };
  }
}

export default async function BoardPage() {
  const resultado = await buscarProjetos();
  return (
    <BoardClient
      projetosIniciais={resultado.ok ? resultado.projetos : []}
      erroCarregamento={!resultado.ok}
    />
  );
}
